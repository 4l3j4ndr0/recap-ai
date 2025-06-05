import { Handler } from "aws-lambda";
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  LanguageCode,
  MediaFormat,
} from "@aws-sdk/client-transcribe";
// import type { Schema } from "../../data/resource";
// import { Amplify } from "aws-amplify";
// import { generateClient } from "aws-amplify/data";
// import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
// import { env } from "$amplify/env/bucket-event-trigger-new-recording";

// // Remover la configuración asíncrona del nivel superior
// let client: ReturnType<typeof generateClient<Schema>>;
// let isAmplifyConfigured = false;

const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// // Función para inicializar Amplify de manera lazy
// async function initializeAmplify() {
//   if (!isAmplifyConfigured) {
//     try {
//       const { resourceConfig, libraryOptions } =
//         await getAmplifyDataClientConfig({
//           ...env,
//           AMPLIFY_DATA_DEFAULT_NAME: "",
//         });

//       Amplify.configure(resourceConfig, libraryOptions);
//       client = generateClient<Schema>();
//       isAmplifyConfigured = true;

//       console.log("Amplify configured successfully");
//     } catch (error) {
//       console.error("Error configuring Amplify:", error);
//       throw error;
//     }
//   }
// }

export const handler: Handler = async (event) => {
  console.log("S3 Event received:", JSON.stringify(event, null, 2));

  // // Inicializar Amplify al inicio del handler
  // await initializeAmplify();

  for (const record of event.Records) {
    try {
      const bucketName = record.s3.bucket.name;
      const objectKey = decodeURIComponent(
        record.s3.object.key.replace(/\+/g, " ")
      );

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
      const { userId } = extractFileInfo(objectKey);

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
      // await saveInitialStatus(jobName, userId, fileName, inputUri);

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
  language,
}: {
  jobName: string;
  inputUri: string;
  outputBucket: string;
  outputKey: string;
  language: LanguageCode;
}) {
  const command = new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: language,
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
      response.TranscriptionJob?.TranscriptionJobName
    );
    return response;
  } catch (error) {
    console.error("Error starting transcription job:", error);
    throw error;
  }
}

// async function saveInitialStatus(
//   jobName: string,
//   userId: string,
//   fileName: string,
//   inputUri: string
// ) {
//   try {
//     const { errors: createErrors, data: newRecordingSummary } =
//       await client.models.RecordingSummary.create({
//         id: jobName,
//         userId: userId,
//         status: "TRANSCRIBING",
//         originalFileName: fileName,
//         s3Uri: inputUri, // Agregar este campo
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       });

//     if (createErrors) {
//       console.error("Error creating initial status in DynamoDB:", createErrors);
//       throw new Error("Failed to save initial status");
//     }
//     console.log("Initial status saved:", newRecordingSummary);
//   } catch (error) {
//     console.error("Error saving initial status:", error);
//     throw error;
//   }
// }

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
