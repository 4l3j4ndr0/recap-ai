import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { OnNewRecordFunction } from "../functions/bucket-event-trigger-new-recording/resource";
import { OnNewTranscriptionFunction } from "../functions/bucket-event-trigger-new-transcription/resource";
const schema = a
  .schema({
    RecordingSummary: a
      .model({
        id: a.id().required(),
        userId: a.id().required(),
        summaryTitle: a.string(),
        // Estado del procesamiento
        status: a.enum([
          "COMPLETED",
          "FAILED",
          "TRANSCRIBING",
          "TRANSCRIBING_COMPLETED",
          "GENERATING_SUMMARY",
          "ERROR",
        ]),

        // Información del archivo original
        originalFileName: a.string().required(),
        s3Uri: a.string().required(), // URI del archivo de audio en S3
        audioDuration: a.float(), // Duración del audio en segundos
        confidenceScore: a.float(), // Puntuación de confianza de la transcripción
        // Contenido del resumen generado por LLM (en formato Markdown)
        summaryMarkdown: a.string(), // Contenido completo del resumen en Markdown
        mermaidDiagram: a.string(), // Diagrama Mermaid generado

        transcriptionS3Uri: a.string(), // URI del archivo de transcripción
        transcriptionText: a.string(), // Texto completo transcrito

        // Metadatos del archivo
        fileSize: a.integer(),

        // Información de error
        errorMessage: a.string(),
        failureReason: a.string(),

        // Timestamps
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        // Configuración del procesamiento
        languageCode: a.string().default("es-ES"),
        llmModel: a.string(), // Modelo de LLM usado para generar el resumen

        // Metadatos adicionales opcionales
        notes: a.string(),
        isArchived: a.boolean().default(false),
        isFavorite: a.boolean().default(false),
      })
      .secondaryIndexes((index) => [
        index("userId")
          .sortKeys(["createdAt"])
          .queryField("listByUserId")
      ])
      .authorization((allow) => [
        allow.authenticated().to(["list", "listen", "update", "delete", "get"]),
      ]),
  })
  .authorization((allow) => [
    allow.resource(OnNewRecordFunction).to(["mutate"]),
    allow.resource(OnNewTranscriptionFunction).to(["mutate"]),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      description: "This is the API key if for request Publics.",
      expiresInDays: 365,
    },
  },
});
