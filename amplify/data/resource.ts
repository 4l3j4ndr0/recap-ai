import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { OnNewRecordFunction } from "../functions/bucket-event-trigger-new-recording/resource";
const schema = a
  .schema({
    RecordingSummary: a
      .model({
        id: a.id().required(),
        userId: a.id().required(),

        // Estado del procesamiento
        status: a.enum([
          "COMPLETED",
          "FAILED",
          "TRANSCRIBING",
          "GENERATING_SUMMARY",
        ]),

        // Información del archivo original
        originalFileName: a.string().required(),
        s3Uri: a.string().required(), // URI del archivo de audio en S3

        // Contenido del resumen generado por LLM (en formato Markdown)
        summaryMarkdown: a.string(), // Contenido completo del resumen en Markdown

        transcriptionS3Uri: a.string(), // URI del archivo de transcripción
        transcriptionText: a.string(), // Texto completo transcrito

        // Metadatos del archivo
        fileSize: a.integer(),
        duration: a.float(), // duración en segundos
        mimeType: a.string(),

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
      .authorization((allow) => [
        allow.owner().to(["create", "read", "update", "delete"]),
      ]),
  })
  .authorization((allow) => [
    allow.resource(OnNewRecordFunction).to(["mutate"]),
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
