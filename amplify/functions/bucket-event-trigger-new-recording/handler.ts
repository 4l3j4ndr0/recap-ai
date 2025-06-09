import { Handler } from "aws-lambda";
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  LanguageCode,
  MediaFormat,
} from "@aws-sdk/client-transcribe";
import type { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/bucket-event-trigger-new-recording";

const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

export const handler: Handler = async (event) => {
  console.log("S3 Event received:", JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const bucketName = record.s3.bucket.name;
      const objectKey = decodeURIComponent(
        record.s3.object.key.replace(/\+/g, " "),
      );

      const fileSize = record.s3.object.size;

      // Verificar que sea un archivo de audio válido
      if (!isValidAudioFile(objectKey)) {
        console.log(`Skipping non-audio file: ${objectKey}`);
        continue;
      }

      // Generar nombre único para el job de transcripción
      const timestamp = Date.now();
      const jobName = `transcription-${timestamp}-${Math.random()
        .toString(36)
        .slice(2, 11)}`;

      // Extraer información del usuario desde el path
      const { userId, fileName } = extractFileInfo(objectKey);

      // Construir URI de entrada
      const inputUri = `s3://${bucketName}/${objectKey}`;

      // Definir clave de salida
      const outputKey = `transcriptions/${userId}/${jobName}.json`;

      // Iniciar job de transcripción
      await startTranscriptionJob({
        jobName,
        inputUri,
        outputBucket: bucketName,
        outputKey,
        language: LanguageCode.ES_ES,
      });

      // Guardar estado inicial en DynamoDB
      await saveInitialStatus(jobName, userId, fileName, inputUri, fileSize);

      console.log(`Transcription job started successfully: ${jobName}`);
    } catch (error) {
      console.error("Error processing S3 event:", error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Processing completed" }),
  };
};

async function startTranscriptionJob({
  jobName,
  inputUri,
  outputBucket,
  outputKey,
}: {
  jobName: string;
  inputUri: string;
  outputBucket: string;
  outputKey: string;
  language: LanguageCode;
}) {
  const command = new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    // LanguageCode: language,
    IdentifyLanguage: true,
    MediaFormat: getMediaFormat(inputUri),
    Media: {
      MediaFileUri: inputUri,
    },

    OutputBucketName: outputBucket,
    OutputKey: outputKey,
    Settings: {
      ShowSpeakerLabels: false,
    },
    // Remover JobExecutionSettings si no tienes el role ARN configurado
    ...(process.env.TRANSCRIBE_ROLE_ARN && {
      JobExecutionSettings: {
        AllowDeferredExecution: false,
        DataAccessRoleArn: process.env.TRANSCRIBE_ROLE_ARN,
      },
    }),
  });

  try {
    const response = await transcribeClient.send(command);
    console.log(
      "Transcription job started:",
      response.TranscriptionJob?.TranscriptionJobName,
    );
    return response;
  } catch (error) {
    console.error("Error starting transcription job:", error);
    throw error;
  }
}

async function saveInitialStatus(
  jobName: string,
  userId: string,
  fileName: string,
  inputUri: string,
  fileSize: number,
) {
  try {
    const { errors: createErrors, data: newRecordingSummary } =
      await client.models.RecordingSummary.create({
        id: jobName,
        userId: userId,
        status: "TRANSCRIBING",
        originalFileName: fileName,
        s3Uri: inputUri, // Agregar este campo
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fileSize,
      });

    if (createErrors) {
      console.error("Error creating initial status in DynamoDB:", createErrors);
      throw new Error("Failed to save initial status");
    }
    console.log("Initial status saved:", newRecordingSummary);
  } catch (error) {
    console.error("Error saving initial status:", error);
    throw error;
  }
}

function isValidAudioFile(objectKey: string): boolean {
  const validExtensions = [".webm", ".mp3", ".wav", ".m4a", ".ogg", ".flac"];
  const extension = objectKey
    .toLowerCase()
    .substring(objectKey.lastIndexOf("."));
  return validExtensions.includes(extension);
}

function getMediaFormat(uri: string): MediaFormat {
  const extension = uri.toLowerCase().substring(uri.lastIndexOf(".") + 1);

  const formatMap: { [key: string]: MediaFormat } = {
    webm: MediaFormat.WEBM,
    mp3: MediaFormat.MP3,
    wav: MediaFormat.WAV,
    m4a: MediaFormat.M4A,
    ogg: MediaFormat.OGG,
    flac: MediaFormat.FLAC,
  };

  return formatMap[extension] || MediaFormat.WEBM;
}

function extractFileInfo(objectKey: string): {
  userId: string;
  fileName: string;
} {
  // Asumimos que el formato del objectKey es "users-recordings/{userId}/year/month/day/fileName"
  const pathParts = objectKey.split("/");

  let userId = pathParts[1] || "unknown";
  let fileName = objectKey.split("/").pop() || "unknown";

  return { userId, fileName };
}
