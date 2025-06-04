<template>
  <div class="recording-section">
    <q-btn
      :class="['recording-btn', { 'recording-active': isRecording }]"
      :color="isRecording ? 'negative' : 'secondary'"
      :icon="isRecording ? 'stop' : 'mic'"
      :label="isRecording ? 'Stop Recording' : 'New Recording'"
      size="lg"
      no-caps
      @click="toggleRecording"
      :loading="startingRecording"
    >
      <!-- Animación de pulso cuando está grabando -->
      <div v-if="isRecording" class="recording-pulse"></div>
    </q-btn>

    <!-- Visualizador de ondas de audio + Timer -->
    <div v-if="isRecording" class="audio-visualizer-container">
      <!-- Ondas de audio estilo WhatsApp -->
      <div class="audio-visualizer">
        <div
          v-for="i in 20"
          :key="i"
          class="audio-bar"
          :style="{ height: audioLevels[i - 1] + '%' }"
        ></div>
      </div>

      <!-- Timer -->
      <div class="recording-timer">
        <q-icon name="fiber_manual_record" class="recording-dot" />
        {{ recordingTime }}
      </div>
    </div>

    <!-- Mensaje de permiso de micrófono -->
    <div v-if="microphoneError" class="microphone-error">
      <q-icon name="mic_off" />
      <span>{{ microphoneError }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
//@ts-ignore
import mixin from "../mixins/mixin";

// Definir emits para comunicar con el componente padre
const emit = defineEmits<{
  recordingStarted: [];
  recordingStopped: [audioBlob: Blob, duration: string];
  recordingError: [error: string];
}>();

const { showNoty } = mixin();

// Estados de grabación
const isRecording = ref(false);
const startingRecording = ref(false);
const recordingStartTime = ref<Date | null>(null);
const recordingTime = ref("00:00");
const microphoneError = ref("");

// Estados para audio real
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingInterval: NodeJS.Timeout | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let microphone: MediaStreamAudioSourceNode | null = null;
let animationFrame: number | null = null;

// Estados para visualización de ondas
const audioLevels = ref<number[]>(new Array(20).fill(0));

// Función para formatear el tiempo de grabación
const updateRecordingTime = () => {
  if (!recordingStartTime.value) return;

  const now = new Date();
  const diff = now.getTime() - recordingStartTime.value.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  recordingTime.value = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

// Función para animar las ondas de audio
const updateAudioVisualization = () => {
  if (!analyser || !isRecording.value) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  // Crear 20 barras basadas en diferentes rangos de frecuencia
  const barCount = 20;
  const step = Math.floor(bufferLength / barCount);

  for (let i = 0; i < barCount; i++) {
    let sum = 0;
    const start = i * step;
    const end = start + step;

    for (let j = start; j < end && j < bufferLength; j++) {
      sum += dataArray[j];
    }

    const average = sum / step;
    // Convertir a porcentaje y añadir algo de randomización para efecto visual
    const level = (average / 255) * 100;
    const randomFactor = 0.8 + Math.random() * 0.4; // Entre 0.8 y 1.2
    audioLevels.value[i] = Math.max(5, Math.min(100, level * randomFactor));
  }

  animationFrame = requestAnimationFrame(updateAudioVisualization);
};

// Función principal de grabación
const toggleRecording = async () => {
  if (isRecording.value) {
    await stopRecording();
  } else {
    await startRecording();
  }
};

const startRecording = async () => {
  try {
    startingRecording.value = true;
    microphoneError.value = "";

    // Solicitar permisos de micrófono
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Configurar MediaRecorder
    const options = {
      mimeType: "audio/webm;codecs=opus", // Formato compatible
    };

    // Verificar si el formato es soportado
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "";
      }
    }

    mediaRecorder = new MediaRecorder(
      stream,
      options.mimeType ? options : undefined
    );
    audioChunks = [];

    // Configurar análisis de audio para visualización
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    microphone.connect(analyser);

    // Eventos del MediaRecorder
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, {
        type: mediaRecorder?.mimeType || "audio/webm",
      });
      const finalDuration = recordingTime.value;
      emit("recordingStopped", audioBlob, finalDuration);
    };

    // Iniciar grabación
    mediaRecorder.start(1000); // Guardar datos cada segundo

    // Activar estado de grabación
    isRecording.value = true;
    recordingStartTime.value = new Date();

    // Iniciar contador de tiempo y visualización
    recordingInterval = setInterval(updateRecordingTime, 1000);
    updateAudioVisualization();

    showNoty("Grabación iniciada correctamente", "positive");
    emit("recordingStarted");
  } catch (error) {
    console.error("Error al iniciar grabación:", error);

    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        microphoneError.value = "Permiso de micrófono denegado";
        showNoty("Permiso de micrófono denegado", "negative");
      } else if (error.name === "NotFoundError") {
        microphoneError.value = "No se encontró micrófono";
        showNoty("No se encontró micrófono", "negative");
      } else {
        microphoneError.value = "Error al acceder al micrófono";
        showNoty("Error al acceder al micrófono", "negative");
      }
    }

    emit("recordingError", microphoneError.value);
  } finally {
    startingRecording.value = false;
  }
};

const stopRecording = async () => {
  try {
    startingRecording.value = true;

    // Detener MediaRecorder
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }

    // Limpiar recursos de audio
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    if (microphone) {
      microphone.disconnect();
      microphone = null;
    }

    if (audioContext) {
      await audioContext.close();
      audioContext = null;
    }

    // Detener stream de micrófono
    if (mediaRecorder?.stream) {
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }

    // Limpiar interval
    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }

    // Resetear estados
    isRecording.value = false;
    recordingStartTime.value = null;
    recordingTime.value = "00:00";
    audioLevels.value = new Array(20).fill(0);

    showNoty("Grabación finalizada correctamente", "positive");
  } catch (error) {
    console.error("Error al detener grabación:", error);
    showNoty("Error al detener la grabación", "negative");
  } finally {
    startingRecording.value = false;
  }
};

// Método público para detener grabación desde el componente padre
const forceStop = async () => {
  if (isRecording.value) {
    await stopRecording();
  }
};

// Exponer método al componente padre
defineExpose({
  forceStop,
  isRecording: () => isRecording.value,
});

onUnmounted(() => {
  // Limpiar todos los recursos
  if (recordingInterval) {
    clearInterval(recordingInterval);
  }
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  if (audioContext) {
    audioContext.close();
  }
  if (mediaRecorder?.stream) {
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  }
});
</script>

<style scoped>
/* Sección de grabación */
.recording-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.recording-btn {
  position: relative;
  overflow: hidden;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border-radius: 12px;
  padding: 12px 24px;
  min-width: 180px;
}

.recording-btn:not(.recording-active) {
  background: #ff6b35 !important;
}

.recording-btn:not(.recording-active):hover {
  background: #e55a28 !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.recording-btn.recording-active {
  background: #ef4444 !important;
  animation: recordingGlow 2s infinite;
}

.recording-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: inherit;
  animation: pulse 1.5s infinite;
}

/* Contenedor del visualizador */
.audio-visualizer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.2);
  min-width: 280px;
}

/* Visualizador de ondas estilo WhatsApp */
.audio-visualizer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 40px;
  padding: 0 8px;
}

.audio-bar {
  width: 3px;
  background: linear-gradient(to top, #ef4444, #f87171);
  border-radius: 2px;
  transition: height 0.1s ease;
  min-height: 4px;
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.3);
}

.recording-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: "Roboto Mono", monospace;
}

.recording-dot {
  color: #ef4444;
  font-size: 8px;
  animation: blink 1s infinite;
}

/* Error de micrófono */
.microphone-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef4444;
  font-size: 0.8rem;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Animaciones */
@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
}

@keyframes recordingGlow {
  0%,
  100% {
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 4px 30px rgba(239, 68, 68, 0.6);
  }
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0.3;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .recording-btn {
    min-width: 150px;
    padding: 10px 20px;
    font-size: 0.875rem;
  }

  .audio-visualizer-container {
    min-width: 240px;
    padding: 10px;
  }

  .audio-visualizer {
    height: 35px;
  }

  .audio-bar {
    width: 2.5px;
  }

  .recording-timer {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .recording-btn {
    min-width: 120px;
    padding: 8px 16px;
  }

  .recording-section {
    gap: 8px;
  }

  .audio-visualizer-container {
    min-width: 200px;
    padding: 8px;
  }

  .audio-visualizer {
    height: 30px;
    gap: 1.5px;
  }

  .audio-bar {
    width: 2px;
  }
}
</style>
