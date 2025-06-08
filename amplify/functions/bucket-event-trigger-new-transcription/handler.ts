import { Handler } from "aws-lambda";
import type { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/bucket-event-trigger-new-transcription";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { LanguageCode } from "@aws-sdk/client-transcribe";

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

interface TranscriptionResult {
  jobName: string;
  accountId: string;
  status: string;
  results: {
    language_code: string;
    language_identification: { code: string; score: string }[];
    transcripts: { transcript: string }[];
  };
}

interface BedrockResponse {
  title: string;
  summary: string;
}

const MODEL_ID =
  process.env.MODEL_ID || "us.anthropic.claude-sonnet-4-20250514-v1:0";

export const handler: Handler = async (event) => {
  console.log("S3 Event received:", JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const bucketName = record.s3.bucket.name;
      const objectKey = decodeURIComponent(
        record.s3.object.key.replace(/\+/g, " "),
      );

      console.log(`Processing transcription file: ${objectKey}`);

      // 1. Descargar el archivo JSON de transcripción desde S3
      const transcriptionData = await downloadTranscriptionFromS3(
        bucketName,
        objectKey,
      );

      // 2. Extraer información necesaria
      const languageCode = transcriptionData.results.language_code;
      const transcriptionText =
        transcriptionData.results.transcripts[0]?.transcript;
      const jobName = transcriptionData.jobName;

      if (!transcriptionText) {
        console.error("No transcription text found");
        await updateRecordingStatus(
          jobName,
          "FAILED",
          "No transcription text found",
        );
        continue;
      }

      console.log(`Language detected: ${languageCode}`);
      console.log(
        `Transcription length: ${transcriptionText.length} characters`,
      );

      // 3. Actualizar estado a "GENERATING_SUMMARY"
      await updateRecordingStatus(jobName, "GENERATING_SUMMARY");

      // 4. Generar resumen con Bedrock
      const bedrockResponse = await generateSummaryWithBedrock(
        transcriptionText,
        languageCode,
      );

      // 5. Actualizar registro final en DynamoDB
      await updateRecordingWithSummary(
        jobName,
        transcriptionText,
        bedrockResponse.title,
        bedrockResponse.summary,
        languageCode,
        `s3://${bucketName}/${objectKey}`,
      );

      console.log(`Successfully processed transcription for job: ${jobName}`);
    } catch (error: any) {
      console.error("Error processing transcription:", error);

      // Intentar actualizar estado a FAILED si es posible
      try {
        const objectKey = decodeURIComponent(
          record.s3.object.key.replace(/\+/g, " "),
        );
        const jobName = extractJobNameFromKey(objectKey);
        if (jobName) {
          await updateRecordingStatus(jobName, "FAILED", error.message);
        }
      } catch (updateError) {
        console.error("Failed to update error status:", updateError);
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Transcription processing completed" }),
  };
};

async function downloadTranscriptionFromS3(
  bucketName: string,
  objectKey: string,
): Promise<TranscriptionResult> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const response = await s3Client.send(command);
    const jsonString = await response.Body?.transformToString();

    if (!jsonString) {
      throw new Error("Empty transcription file");
    }

    return JSON.parse(jsonString) as TranscriptionResult;
  } catch (error: any) {
    console.error("Error downloading transcription from S3:", error);
    throw new Error(`Failed to download transcription: ${error.message}`);
  }
}

async function generateSummaryWithBedrock(
  transcriptionText: string,
  languageCode: string,
): Promise<BedrockResponse> {
  const prompt = createSummaryPrompt(transcriptionText, languageCode);

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.3,
        top_p: 0.9,
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Claude estructura: responseBody.content[0].text
    const content = responseBody.content[0].text;
    console.log("Claude response content:", content);

    return parseBedrockResponse(content);
  } catch (error: any) {
    console.error("Error calling Bedrock:", error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

function parseBedrockResponse(content: string): BedrockResponse {
  try {
    console.log("Raw content to parse:", content);

    // Claude a menudo envuelve JSON en bloques de código
    let jsonString = content.trim();

    // Remover bloques de código markdown si existen
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    console.log("Cleaned JSON string:", jsonString);

    const parsedResponse = JSON.parse(jsonString);

    if (parsedResponse.title && parsedResponse.summary) {
      return {
        title: parsedResponse.title.substring(0, 200),
        summary: parsedResponse.summary,
      };
    }

    throw new Error("Missing title or summary in parsed response");
  } catch (error) {
    console.error("Error parsing JSON:", error);

    // Fallback: extraer título y crear resumen básico
    const titleMatch = content.match(/["']title["']\s*:\s*["']([^"']+)["']/i);
    const title = titleMatch ? titleMatch[1] : "Resumen de Grabación";

    // Si el contenido tiene estructura markdown, usarlo
    const markdownMatch = content.match(/#[^#][\s\S]*/);
    const summary = markdownMatch
      ? markdownMatch[0]
      : `## Resumen\n\n${content.substring(0, 1000)}`;

    return {
      title: title.substring(0, 200),
      summary: summary,
    };
  }
}

function createSummaryPrompt(
  transcriptionText: string,
  languageCode: string,
): string {
  const language = languageCode.startsWith("es") ? "Spanish" : LanguageCode;

  return `You are an expert content analysis and structured summary generation assistant. Your task is to analyze the following transcription from a recording (meeting, conference, podcast, interview, etc.) and create a comprehensive, well-structured summary.

TRANSCRIPTION TO ANALYZE:
${transcriptionText}

INSTRUCTIONS:
1. Carefully analyze the transcription content
2. Identify the event type (meeting, conference, podcast, interview, etc.)
3. Create a descriptive and specific title for this content
4. Generate a structured summary in Markdown format
5. Use proper Markdown formatting with headers, lists, and emphasis
6. Ensure the summary is logical, readable, and includes all significant information
7. Include mentioned names, products, or companies
8. Include specific dates, numbers, or data when mentioned
9. Maintain a professional and objective tone
10. Extract actionable items when present
11. Highlight important decisions or agreements

REQUIRED RESPONSE FORMAT:
Respond only with valid JSON using this exact structure:
{
  "title": "Descriptive and specific content title",
  "summary": "Markdown formatted summary in ${language}"
}

REQUIREMENTS:
- Title must be specific and descriptive (max 80 characters) in ${language}
- Summary must be in ${language}
- Use proper Markdown formatting with headers, lists, and emphasis
- Structure information logically and readably
- Include only relevant and significant information
- Include mentioned names, products, or companies
- Include specific dates, numbers, or data when mentioned
- Maintain professional and objective tone
- Extract actionable items when present
- Highlight important decisions or agreements

Respond ONLY with the requested JSON, no additional text before or after.`;
}

async function updateRecordingStatus(
  jobName: string,
  status: string,
  errorMessage?: string,
) {
  try {
    const updateData: any = {
      status: status as any,
      updatedAt: new Date().toISOString(),
    };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
      updateData.failureReason = errorMessage;
    }

    const { errors } = await client.models.RecordingSummary.update({
      id: jobName,
      ...updateData,
    });

    if (errors) {
      console.error("Error updating recording status:", errors);
      throw new Error("Failed to update recording status");
    }

    console.log(`Recording status updated to ${status} for job: ${jobName}`);
  } catch (error) {
    console.error("Error updating recording status:", error);
    throw error;
  }
}

async function updateRecordingWithSummary(
  jobName: string,
  transcriptionText: string,
  summaryTitle: string,
  summaryMarkdown: string,
  languageCode: string,
  transcriptionS3Uri: string,
) {
  try {
    const { errors } = await client.models.RecordingSummary.update({
      id: jobName,
      status: "COMPLETED" as any,
      transcriptionText: transcriptionText,
      summaryTitle: summaryTitle,
      summaryMarkdown: summaryMarkdown,
      languageCode: languageCode,
      transcriptionS3Uri: transcriptionS3Uri,
      llmModel: MODEL_ID,
      updatedAt: new Date().toISOString(),
    });

    if (errors) {
      console.error("Error updating recording with summary:", errors);
      throw new Error("Failed to update recording with summary");
    }

    console.log(`Recording summary completed for job: ${jobName}`);
  } catch (error) {
    console.error("Error updating recording with summary:", error);
    throw error;
  }
}

function extractJobNameFromKey(objectKey: string): string | null {
  // Asumiendo que el objectKey contiene el jobName
  // Ejemplo: "transcriptions/jobName.json"
  const parts = objectKey.split("/");
  const filename = parts[parts.length - 1];
  return filename.replace(".json", "");
}
