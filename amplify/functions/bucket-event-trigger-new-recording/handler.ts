import { Handler } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { AssemblyAI } from "assemblyai";
import type { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/bucket-event-trigger-new-recording";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

// Initialize AssemblyAI client
const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

// Types for better type safety
interface TranscriptionParams {
  audio: string;
  speech_model?: "best" | "nano";
  language_detection?: boolean;
  language_code?: string;
  punctuate?: boolean;
  format_text?: boolean;
  speaker_labels?: boolean;
  auto_chapters?: boolean;
  sentiment_analysis?: boolean;
  entity_detection?: boolean;
  iab_categories?: boolean;
  content_safety?: boolean;
}

interface ProcessingResult {
  success: boolean;
  processId: string;
  error?: string;
}

export const handler: Handler = async (event) => {
  console.log("S3 Event received:", JSON.stringify(event, null, 2));

  const results: ProcessingResult[] = [];

  for (const record of event.Records) {
    const result = await processRecord(record);
    results.push(result);
  }

  const successCount = results.filter((r) => r.success).length;
  const errorCount = results.filter((r) => !r.success).length;

  console.log(
    `Processing completed: ${successCount} successful, ${errorCount} failed`,
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Processing completed",
      results: {
        successful: successCount,
        failed: errorCount,
        details: results,
      },
    }),
  };
};

async function processRecord(record: any): Promise<ProcessingResult> {
  try {
    const bucketName = record.s3.bucket.name;
    const objectKey = decodeURIComponent(
      record.s3.object.key.replace(/\+/g, " "),
    );
    const fileSize = record.s3.object.size;

    // Validate audio file
    if (!isValidAudioFile(objectKey)) {
      console.log(`Skipping non-audio file: ${objectKey}`);
      return {
        success: false,
        processId: "",
        error: "Invalid audio file format",
      };
    }

    // Check file size (AssemblyAI supports up to 2GB, but let's be reasonable)
    if (fileSize > 500 * 1024 * 1024) {
      // 500MB limit
      console.error(`File too large: ${objectKey} (${fileSize} bytes)`);
      await saveErrorStatus(objectKey, "File exceeds 500MB limit");
      return { success: false, processId: "", error: "File too large" };
    }

    // Generate unique process ID
    const processId = generateProcessId();
    const { userId, fileName } = extractFileInfo(objectKey);
    const inputUri = `s3://${bucketName}/${objectKey}`;

    console.log(`Starting AssemblyAI transcription for: ${objectKey}`);

    // Save initial status
    await saveInitialStatus(processId, userId, fileName, inputUri, fileSize);

    // Generate pre-signed URL for AssemblyAI to access the file
    const audioUrl = await generatePresignedUrl(bucketName, objectKey);

    // Transcribe with AssemblyAI
    const transcriptionResult = await transcribeWithAssemblyAI(
      audioUrl,
      fileName,
    );

    // Save transcription result
    await saveTranscriptionResult(processId, transcriptionResult);

    console.log(
      `AssemblyAI transcription completed successfully: ${processId}`,
    );

    return { success: true, processId };
  } catch (error: any) {
    console.error("Error processing record:", error);

    try {
      await saveErrorStatus(record.s3.object.key, error.message);
    } catch (saveError) {
      console.error("Error saving error status:", saveError);
    }

    return {
      success: false,
      processId: "",
      error: error.message || "Unknown error",
    };
  }
}

async function transcribeWithAssemblyAI(audioUrl: string, fileName: string) {
  try {
    console.log(`Sending ${fileName} to AssemblyAI`);

    // Configure transcription parameters
    const params: TranscriptionParams = {
      audio: audioUrl,
      speech_model: "best", // Use the most accurate model
      language_detection: true, // Auto-detect language
      punctuate: true,
      format_text: true,
      speaker_labels: true, // Enable speaker diarization
      auto_chapters: true, // Auto-generate chapters
      sentiment_analysis: false, // Enable if needed
      entity_detection: false, // Enable if needed
      iab_categories: false, // Enable if needed
      content_safety: false, // Enable if needed
    };

    // Start transcription
    const transcript = await assemblyClient.transcripts.transcribe(params);

    // Check if transcription was successful
    if (transcript.status === "error") {
      throw new Error(`AssemblyAI transcription failed: ${transcript.error}`);
    }

    console.log("AssemblyAI transcription completed:", {
      id: transcript.id,
      status: transcript.status,
      duration: transcript.audio_duration,
      language: transcript.language_code,
      confidence: transcript.confidence,
      textLength: transcript.text?.length || 0,
    });

    return transcript;
  } catch (error) {
    console.error("Error in AssemblyAI transcription:", error);
    throw error;
  }
}

async function generatePresignedUrl(
  bucketName: string,
  objectKey: string,
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    // Generate URL valid for 1 hour
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    console.log(`Generated pre-signed URL for ${objectKey}`);
    return presignedUrl;
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw error;
  }
}

async function saveInitialStatus(
  processId: string,
  userId: string,
  fileName: string,
  inputUri: string,
  fileSize: number,
) {
  try {
    const { errors, data } = await client.models.RecordingSummary.create({
      id: processId,
      userId: userId,
      status: "TRANSCRIBING",
      originalFileName: fileName,
      s3Uri: inputUri,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileSize,
    });

    if (errors) {
      console.error("Error creating initial status:", errors);
      throw new Error("Failed to save initial status");
    }

    console.log("Initial status saved:", data);
  } catch (error) {
    console.error("Error saving initial status:", error);
    throw error;
  }
}

async function saveTranscriptionResult(processId: string, transcript: any) {
  try {
    const updateData: any = {
      id: processId,
      status: "TRANSCRIBING_COMPLETED",
      transcriptionText: transcript.text,
      languageCode: transcript.language_code,
      audioDuration: transcript.audio_duration,
      confidenceScore: transcript.confidence,
      updatedAt: new Date().toISOString(),
    };

    const { errors, data } =
      await client.models.RecordingSummary.update(updateData);

    if (errors) {
      console.error("Error updating transcription result:", errors);
      throw new Error("Failed to save transcription result");
    }

    console.log("Transcription result saved successfully");
    return data;
  } catch (error) {
    console.error("Error saving transcription result:", error);
    throw error;
  }
}

async function saveErrorStatus(objectKey: string, errorMessage: string) {
  try {
    const { userId, fileName } = extractFileInfo(objectKey);
    const errorId = generateProcessId();

    await client.models.RecordingSummary.create({
      id: errorId,
      userId: userId,
      status: "ERROR",
      originalFileName: fileName,
      s3Uri: objectKey,
      errorMessage: errorMessage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`Error status saved for ${objectKey}: ${errorMessage}`);
  } catch (error) {
    console.error("Error saving error status:", error);
  }
}

// Utility functions
function generateProcessId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 11);
  return `assemblyai-${timestamp}-${random}`;
}

function isValidAudioFile(objectKey: string): boolean {
  // AssemblyAI supported formats
  const validExtensions = [
    ".mp3",
    ".wav",
    ".flac",
    ".m4a",
    ".aac",
    ".ogg",
    ".wma",
    ".webm",
    ".mp4",
    ".3gp",
    ".amr",
  ];

  const extension = objectKey
    .toLowerCase()
    .substring(objectKey.lastIndexOf("."));

  return validExtensions.includes(extension);
}

function extractFileInfo(objectKey: string): {
  userId: string;
  fileName: string;
} {
  const pathParts = objectKey.split("/");
  const userId = pathParts[1] || "unknown";
  const fileName = objectKey.split("/").pop() || "unknown";

  return { userId, fileName };
}
