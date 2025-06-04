<template>
  <q-layout>
    <div class="q-pa-md">
      <RecordingButton
        ref="recordingButtonRef"
        @recording-started="onRecordingStarted"
        @recording-stopped="onRecordingStopped"
        @recording-error="onRecordingError"
      />
    </div>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useGeneralStore } from "src/stores/General";
import RecordingButton from "../components/RecordingButton.vue";

const general = useGeneralStore();
//@ts-ignore
import mixin from "../mixins/mixin";

const { showNoty } = mixin();

const onRecordingStarted = () => {
  console.log("Grabación iniciada desde el layout");
  // Aquí puedes agregar lógica adicional cuando inicie la grabación
  // Por ejemplo, cambiar el estado global, enviar analytics, etc.
};

const onRecordingStopped = (audioBlob, duration) => {
  console.log(`Grabación detenida. Duración: ${duration}`);
  console.log("Audio blob:", audioBlob);

  // Aquí puedes manejar el archivo de audio:
  // 1. Crear URL para reproducir
  const audioUrl = URL.createObjectURL(audioBlob);
  console.log("Audio URL:", audioUrl);

  // 2. Enviar a tu API
  uploadAudioToServer(audioBlob, duration);

  // 3. Guardar en el store si es necesario
  // general.setRecordedAudio(audioBlob);
};

const onRecordingError = (error) => {
  console.error("Error en grabación:", error);
  showNoty(`Error: ${error}`, "negative");
};

// Función para subir audio al servidor
const uploadAudioToServer = async (audioBlob, duration) => {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, `recording_${Date.now()}.webm`);
    formData.append("duration", duration);

    // Ejemplo de envío
    // const response = await fetch('/api/upload-audio', {
    //   method: 'POST',
    //   body: formData
    // });

    console.log("Audio listo para enviar al servidor");
    showNoty("Audio procesado correctamente", "positive");
  } catch (error) {
    console.error("Error al subir audio:", error);
    showNoty("Error al procesar el audio", "negative");
  }
};

defineOptions({
  name: "IndexPage",
});
</script>

<style scoped></style>
