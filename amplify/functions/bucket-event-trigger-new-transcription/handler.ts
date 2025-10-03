import { DynamoDBStreamHandler, DynamoDBRecord } from "aws-lambda";
import type { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/bucket-event-trigger-new-recording";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

interface BedrockResponse {
  title: string;
  summary: string;
  mermaidDiagrams?: {
    title: string;
    description: string;
    type: string;
    diagram: string;
  }[];
}

interface RecordingSummaryRecord {
  id: string;
  status: string;
  transcriptionText?: string;
  transcriptionLanguage?: string;
  userId: string;
  originalFileName: string;
  transcriptionService?: string;
  createdAt: string;
  updatedAt: string;
}

const MODEL_ID =
  process.env.MODEL_ID || "us.anthropic.claude-sonnet-4-20250514-v1:0";

export const handler: DynamoDBStreamHandler = async (event) => {
  console.log(
    "DynamoDB Stream Event received:",
    JSON.stringify(event, null, 2),
  );

  const results: Array<{ success: boolean; recordId: string; error?: string }> =
    [];

  for (const record of event.Records) {
    const result = await processStreamRecord(record);
    results.push(result);
  }

  const successCount = results.filter((r) => r.success).length;
  const errorCount = results.filter((r) => !r.success).length;

  console.log(
    `Stream processing completed: ${successCount} successful, ${errorCount} failed`,
  );

  return {
    batchItemFailures: results
      .filter((r) => !r.success)
      .map((r) => ({ itemIdentifier: r.recordId })),
  };
};

async function processStreamRecord(
  record: DynamoDBRecord,
): Promise<{ success: boolean; recordId: string; error?: string }> {
  const recordId = record.dynamodb?.Keys?.id?.S || "unknown";

  try {
    // Only process INSERT and MODIFY events
    if (!record.eventName || !["INSERT", "MODIFY"].includes(record.eventName)) {
      console.log(
        `Skipping event type: ${record.eventName} for record: ${recordId}`,
      );
      return { success: true, recordId };
    }

    // Check if this is a transcription completion event
    const newImage = record.dynamodb?.NewImage;
    const oldImage = record.dynamodb?.OldImage;

    if (!newImage) {
      console.log(`No new image for record: ${recordId}`);
      return { success: true, recordId };
    }

    // Parse the DynamoDB record
    const recordingSummary = parseDynamoDBRecord(newImage);

    if (recordingSummary.status !== "TRANSCRIBING_COMPLETED") {
      console.log(`Skipping non-completed record: ${recordId}`);
      return { success: true, recordId };
    }

    // Check if this record should trigger summary generation
    if (!shouldGenerateSummary(recordingSummary, oldImage)) {
      console.log(`Record ${recordId} does not require summary generation`);
      return { success: true, recordId };
    }

    console.log(`Processing summary generation for record: ${recordId}`);

    // Validate required fields
    if (
      !recordingSummary.transcriptionText ||
      recordingSummary.transcriptionText.trim().length === 0
    ) {
      console.error(`No transcription text found for record: ${recordId}`);
      await updateRecordingStatus(
        recordId,
        "FAILED",
        "No transcription text available",
      );
      return { success: false, recordId, error: "No transcription text" };
    }

    // Update status to GENERATING_SUMMARY
    await updateRecordingStatus(recordId, "GENERATING_SUMMARY");

    // Generate summary with Bedrock
    const bedrockResponse = await generateSummaryWithBedrock(
      recordingSummary.transcriptionText,
      recordingSummary.transcriptionLanguage || "en-US",
    );

    // Update record with summary
    await updateRecordingWithSummary(
      recordId,
      bedrockResponse.title,
      bedrockResponse.summary,
      bedrockResponse.mermaidDiagrams || [],
    );

    console.log(`Successfully generated summary for record: ${recordId}`);
    return { success: true, recordId };
  } catch (error: any) {
    console.error(`Error processing stream record ${recordId}:`, error);

    // Try to update status to FAILED
    try {
      await updateRecordingStatus(recordId, "FAILED", error.message);
    } catch (updateError) {
      console.error(
        `Failed to update error status for record ${recordId}:`,
        updateError,
      );
    }

    return {
      success: false,
      recordId,
      error: error.message || "Unknown error",
    };
  }
}

function parseDynamoDBRecord(newImage: any): RecordingSummaryRecord {
  return {
    id: newImage.id?.S || "",
    status: newImage.status?.S || "",
    transcriptionText: newImage.transcriptionText?.S || "",
    transcriptionLanguage:
      newImage.transcriptionLanguage?.S || newImage.languageCode?.S || "en-US",
    userId: newImage.userId?.S || "",
    originalFileName: newImage.originalFileName?.S || "",
    transcriptionService: newImage.transcriptionService?.S || "",
    createdAt: newImage.createdAt?.S || "",
    updatedAt: newImage.updatedAt?.S || "",
  };
}

function shouldGenerateSummary(
  newRecord: RecordingSummaryRecord,
  oldImage?: any,
): boolean {
  // Check if status changed to COMPLETED and we have transcription text
  const newStatus = newRecord.status;
  const oldStatus = oldImage?.status?.S || "";

  // Generate summary when:
  // 1. Status is COMPLETED and we have transcription text
  // 2. Status changed from something else to COMPLETED
  // 3. Record doesn't already have a summary
  const hasTranscription = Boolean(
    newRecord.transcriptionText &&
      newRecord.transcriptionText.trim().length > 0,
  );
  const isCompleted = newStatus === "TRANSCRIBING_COMPLETED";
  const statusChanged = oldStatus !== newStatus;
  const hasExistingSummary = Boolean(
    oldImage?.summaryTitle?.S && oldImage?.summaryMarkdown?.S,
  );

  const shouldGenerate: boolean =
    isCompleted && hasTranscription && !hasExistingSummary;

  console.log(`Summary generation check for ${newRecord.id}:`, {
    newStatus,
    oldStatus,
    hasTranscription: !!hasTranscription,
    statusChanged,
    hasExistingSummary: !!hasExistingSummary,
    shouldGenerate,
  });

  return shouldGenerate;
}

async function generateSummaryWithBedrock(
  transcriptionText: string,
  languageCode: string,
): Promise<BedrockResponse> {
  const prompt = createSummaryPrompt(transcriptionText, languageCode);

  try {
    console.log(
      `Generating summary with Bedrock for ${transcriptionText.length} characters of text`,
    );

    const command = MODEL_ID.includes("anthropic")
      ? new InvokeModelCommand({
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
            // top_p: 0.9,
          }),
        })
      : new InvokeModelCommand({
          modelId: MODEL_ID,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            inferenceConfig: {
              maxTokens: 4000,
              temperature: 0.3,
            },
          }),
        });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Claude estructura: responseBody.content[0].text
    console.log("RESPONSE BODY", responseBody);

    const content = MODEL_ID.includes("anthropic")
      ? responseBody.content[0].text
      : responseBody.output.message.content[0].text;
    console.log("Claude response received, length:", content.length);

    return parseBedrockResponse(content);
  } catch (error: any) {
    console.error("Error calling Bedrock:", error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

function parseBedrockResponse(content: string): BedrockResponse {
  try {
    console.log("Parsing Bedrock response...");

    // Claude a menudo envuelve JSON en bloques de código
    let jsonString = content.trim();

    // Remover bloques de código markdown si existen
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsedResponse = JSON.parse(jsonString);

    if (parsedResponse.title && parsedResponse.summary) {
      return {
        title: parsedResponse.title.substring(0, 200),
        summary: parsedResponse.summary,
        mermaidDiagrams: parsedResponse.mermaidDiagrams || [],
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
  const language = languageCode.startsWith("es") ? "Spanish" : "English";
  return `You are an expert content analysis and structured summary generation assistant. Your task is to analyze the following transcription from a recording (meeting, conference, podcast, interview, etc.) and create a comprehensive, well-structured summary with visual flow diagrams when applicable.

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
12. Generate Mermaid flow diagrams when processes, workflows, or decision trees are discussed
13. Create visual representations for organizational structures, timelines, or system architectures when mentioned

CRITICAL MERMAID SYNTAX RULES:
- NEVER use accented characters (á, é, í, ó, ú, ñ, ü) - replace with non-accented versions
- NEVER use special characters like quotes (", "), parentheses in labels, or symbols (@, #, %, &, +, =)
- Use only alphanumeric characters, spaces, hyphens, and underscores in node labels
- Keep node IDs simple: use only letters, numbers, and underscores (A, B1, START_NODE)
- Use pipe characters | only for choice separators in decision nodes
- Escape special characters in text with quotes if absolutely necessary
- Use simple, clear English terms even when content language is ${language}
- Maximum 50 characters per node label
- Avoid complex nested structures
- Test syntax: all nodes must be properly connected with valid arrows
- Use standard Mermaid keywords only: TD, TB, LR, RL for directions

MERMAID DIAGRAM GUIDELINES:
- Generate flowcharts for processes, workflows, or decision flows
- Create timeline diagrams for project schedules or historical events  
- Use organizational charts for company structures or team hierarchies
- Generate sequence diagrams for system interactions or communication flows
- Only include diagrams when the content clearly describes processes, flows, or structures
- Keep diagrams simple and focused on the main concepts
- Use clear, concise labels without special characters
- Prefer English terms in diagrams for better compatibility
- Maximum 15 nodes per diagram to maintain clarity
- Always validate arrow syntax: --> for solid arrows, -.-> for dotted arrows

REQUIRED RESPONSE FORMAT:
Respond only with valid JSON using this exact structure:
{
  "title": "Descriptive and specific content title",
  "summary": "Markdown formatted summary in ${language}",
  "mermaidDiagrams": [
    {
      "title": "Diagram title", 
      "description": "Brief description of what the diagram represents",
      "type": "flowchart|timeline|gitgraph|sequence|classDiagram|erDiagram|gantt|pie|quadrantChart|mindmap|sankey",
      "diagram": "mermaid diagram code"
    }
  ]
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
- Generate Mermaid diagrams only when the content clearly describes processes, workflows, organizational structures, timelines, or system architectures
- STRICTLY follow Mermaid syntax rules to prevent parsing errors
- Test each diagram mentally for syntax validity before including
- If uncertain about syntax, omit the diagram rather than risk errors
- If no diagrams are applicable, return an empty array for mermaidDiagrams

Respond ONLY with the requested JSON, no additional text before or after.`;
}

async function updateRecordingStatus(
  recordId: string,
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
      id: recordId,
      ...updateData,
    });

    if (errors) {
      console.error("Error updating recording status:", errors);
      throw new Error("Failed to update recording status");
    }

    console.log(
      `Recording status updated to ${status} for record: ${recordId}`,
    );
  } catch (error) {
    console.error("Error updating recording status:", error);
    throw error;
  }
}

async function updateRecordingWithSummary(
  recordId: string,
  summaryTitle: string,
  summaryMarkdown: string,
  mermaidDiagrams: any[] = [],
) {
  try {
    const { errors } = await client.models.RecordingSummary.update({
      id: recordId,
      status: "COMPLETED",
      summaryTitle: summaryTitle,
      summaryMarkdown: summaryMarkdown,
      llmModel: MODEL_ID,
      updatedAt: new Date().toISOString(),
      ...(mermaidDiagrams.length > 0 && {
        mermaidDiagram: JSON.stringify(mermaidDiagrams),
      }),
    });

    if (errors) {
      console.error("Error updating recording with summary:", errors);
      throw new Error("Failed to update recording with summary");
    }

    console.log(`Recording updated with summary for record: ${recordId}`);
  } catch (error) {
    console.error("Error updating recording with summary:", error);
    throw error;
  }
}
