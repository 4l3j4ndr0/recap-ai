import { defineStore } from "pinia";
import { getUrl, uploadData } from "@aws-amplify/storage";

export const useGeneralStore = defineStore("general", {
  state: () => ({
    webSocketEndpoint: "",
    sockeClient: null,
    token: null,
    speechRecognition: null,
    recognition: null,
    audioChunks: [],
    isRecording: false,
    userInput: "" as string,
    audioUrl: null as any,
    signedURL: null as any,
    waitingResponse: false as boolean,
    // Nuevos estados para manejo de uploads
    uploadProgress: 0 as number,
    isUploading: false as boolean,
    lastUploadedAudioPath: null as string | null,
  }),

  actions: {
    setWebsocketEndpoint(endpoint: string) {
      this.webSocketEndpoint = endpoint;
    },

    initSocketClient(token: string) {
      //@ts-ignore
      this.token = token;
      //@ts-ignore
      this.sockeClient = new WebSocket(
        `${this.webSocketEndpoint}?idToken=${token}`,
      );
    },

    sendMessageWS(message: any) {
      this.waitingResponse = true;
      //@ts-ignore
      this.sockeClient.send(
        JSON.stringify({
          action: "SendMessage",
          message,
          token: this.token,
        }),
      );
    },

    async uploadAudioToS3(
      audioBlob: Blob,
      userId: string,
      fileName?: string,
    ): Promise<{
      success: boolean;
      path?: string;
      error?: string;
    }> {
      try {
        this.isUploading = true;
        this.uploadProgress = 0;

        // Generar nombre único para el archivo si no se proporciona
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const finalFileName = fileName || `recording-${timestamp}.webm`;

        // Crear path con estructura organizada
        const audioPath = `users-recordings/${userId}/${new Date().getFullYear()}/${
          new Date().getMonth() + 1
        }/${finalFileName}`;

        console.log("Iniciando upload de audio a S3...", {
          path: audioPath,
          size: audioBlob.size,
          type: audioBlob.type,
        });

        // Subir archivo a S3
        const result = await uploadData({
          path: audioPath,
          data: audioBlob,
          options: {
            contentType: audioBlob.type || "audio/webm",
            onProgress: ({ transferredBytes, totalBytes }) => {
              if (totalBytes) {
                this.uploadProgress = Math.round(
                  (transferredBytes / totalBytes) * 100,
                );
                console.log(`Upload progress: ${this.uploadProgress}%`);
              }
            },
          },
        }).result;

        console.log("Audio subido exitosamente:", result.path);
        this.lastUploadedAudioPath = result.path;
        return {
          success: true,
          path: result.path,
        };
      } catch (error) {
        console.error("Error al subir audio a S3:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      } finally {
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    },

    // Método para obtener URL firmada de un audio existente
    async getAudioSignedUrl(
      path: string,
      expiresIn: number = 3600,
    ): Promise<string | null> {
      try {
        // Limpiar el path de cualquier prefijo del bucket
        let cleanPath = path;

        // Si el path contiene información del bucket, limpiarla
        if (path.includes("s3://") || path.includes("%3A//")) {
          // Extraer solo la parte del path después del bucket
          const pathParts = path.split("/");
          const bucketEndIndex = pathParts.findIndex(
            (part) =>
              part.includes("recapaibucket") ||
              part.includes("users-recordings"),
          );

          if (bucketEndIndex !== -1) {
            if (pathParts[bucketEndIndex].includes("users-recordings")) {
              cleanPath = pathParts.slice(bucketEndIndex).join("/");
            } else {
              cleanPath = pathParts.slice(bucketEndIndex + 1).join("/");
            }
          }
        }

        const urlResult = await getUrl({
          path: cleanPath,
          options: {
            expiresIn: expiresIn,
          },
        });

        const finalUrl = urlResult.url.toString();

        return finalUrl;
      } catch (error) {
        console.error("Error al obtener URL firmada:", error);
        return null;
      }
    },

    // Método para limpiar URLs y estados de upload
    clearUploadState() {
      this.uploadProgress = 0;
      this.isUploading = false;
      this.lastUploadedAudioPath = null;
      this.signedURL = null;
    },
  },
});
