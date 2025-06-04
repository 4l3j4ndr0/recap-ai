import { defineStore } from "pinia";
import { getUrl } from "@aws-amplify/storage";
import axios from "axios";
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
        `${this.webSocketEndpoint}?idToken=${token}`
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
        })
      );
    },
    async startAudioRecording() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Tu navegador no soporta la grabación de audio.");
        return;
      }

      try {
        this.isRecording = true;
        this.userInput = "";
        this.speechRecognition =
          //@ts-ignore
          window.SpeechRecognition || window.webkitSpeechRecognition;

        if (this.speechRecognition) {
          //@ts-ignore
          this.recognition = new this.speechRecognition();
          //@ts-ignore
          this.recognition.lang = "es-US";
          //@ts-ignore
          this.recognition.continuous = true;

          //@ts-ignore
          this.recognition.onstart = () => {
            console.log("Reconocimiento de voz iniciado");
          };
          //@ts-ignore
          this.recognition.onend = (event) => {
            console.log("AQUI::::::", this.userInput);
            this.sendMessageWS({
              action: "userInput",
              message: this.userInput,
            });
          };

          //@ts-ignore
          this.recognition.onresult = (event: any) => {
            const transcript =
              event.results[event.results.length - 1][0].transcript;
            this.userInput += ` ${transcript}`;
          };

          //@ts-ignore
          this.recognition.onerror = (event: any) => {
            console.error("Error en el reconocimiento de voz:", event.error);
          };
          //@ts-ignore
          this.recognition.start();
        } else {
          console.error(
            "El reconocimiento de voz no está disponible en este navegador."
          );
        }
      } catch (error) {
        console.error("Error al acceder al micrófono", error);
      }
    },
    stopAudioRecording() {
      this.isRecording = false;
      //@ts-ignore
      this.recognition.stop();
      this.recognition = null;
      console.log("Reconocimiento de voz finalizado:::::", this.userInput);
    },
    async startAudioPlay(path: string) {
      const signedURL: any = await getUrl({ path });
      console.log("SIGNED URL:::", signedURL);

      if (!signedURL || !signedURL.url) {
        throw new Error("La URL firmada es inválida");
      }

      const response = await axios.get(signedURL.url, {
        responseType: "blob",
      });

      if (response.status !== 200) {
        throw new Error("Error al descargar el archivo de audio");
      }

      const blob = response.data;

      this.audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(this.audioUrl);

      audio.onerror = (event) => {
        console.error("Error al cargar el audio:", event);
      };

      await audio.play();
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
      console.log("Reproducción de audio iniciada");
    },
  },
});
