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
import { useUserStore } from "src/stores/User";
import RecordingButton from "../components/RecordingButton.vue";

const general = useGeneralStore();
const user = useUserStore();
//@ts-ignore
import mixin from "../mixins/mixin";

const { showNoty } = mixin();

const onRecordingStarted = () => {
  console.log("Grabación iniciada.");
};

const onRecordingStopped = async (audioBlob, duration) => {
  console.log(`Grabación detenida. Duración: ${duration}`);
  console.log("Audio blob:", audioBlob);
  const result = await general.uploadAudioToS3(audioBlob, user.userId);
  result.success
    ? showNoty(
        "success",
        "The recording is proccesing and will be available soon."
      )
    : showNoty(
        "error",
        "There was an error uploading the audio. Please try again."
      );

  const audioUrl = URL.createObjectURL(audioBlob);
  console.log("Audio URL:", audioUrl);
};

const onRecordingError = (error) => {
  console.error("Error en grabación:", error);
  showNoty(`Error: ${error}`, "negative");
};

defineOptions({
  name: "IndexPage",
});
</script>

<style scoped></style>
