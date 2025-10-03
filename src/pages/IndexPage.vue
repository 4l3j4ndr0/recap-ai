<template>
  <q-layout>
    <div class="q-pa-md">
      <div class="row q-gutter-md justify-center">
        <RecordingButton
          ref="recordingButtonRef"
          @recording-started="onRecordingStarted"
          @recording-stopped="onRecordingStopped"
          @recording-error="onRecordingError"
        />
        <FileUploadButton />
      </div>
    </div>
    <!-- Lista de recordings -->
    <RecordingSummaryList />
  </q-layout>
</template>

<script setup lang="ts">
import { useGeneralStore } from "../../src/stores/General";
import { useUserStore } from "../../src/stores/User";
import RecordingButton from "../components/RecordingButton.vue";
import FileUploadButton from "../components/FileUploadButton.vue";
import RecordingSummaryList from "../components/RecordingSummaryList.vue";
import { useRecordingSummaryStore } from "../../src/stores/RecordingSumary";
import { generateClient } from "aws-amplify/data";

import type { Schema } from "../../amplify/data/resource";

const general = useGeneralStore();
const user = useUserStore();
const recordingSummary = useRecordingSummaryStore();
//@ts-ignore
import mixin from "../mixins/mixin";

const { showNoty } = mixin();

const client = generateClient<Schema>();
client.models.RecordingSummary.onCreate({
  filter: {
    userId: { eq: user.userId },
  },
  authMode: "userPool",
}).subscribe({
  next: (data) => {
    // console.log("New recording summary created:", data);
    recordingSummary.getRecordingSummaries();
  },
  error: (error) => console.warn(error),
});

client.models.RecordingSummary.onUpdate({
  filter: {
    userId: { eq: user.userId },
  },
  authMode: "userPool",
}).subscribe({
  next: (data) => {
    // console.log("New recording summary updated:", data);
    recordingSummary.updateRecordyngSummaryListener(data);
  },
  error: (error) => console.warn(error),
});

const onRecordingStarted = () => {
  console.log("Grabación iniciada.");
};

const onRecordingStopped = async (audioBlob: any, duration: string) => {
  console.log(`Grabación detenida. Duración: ${duration}`);
  console.log("Audio blob:", audioBlob);
  if (!validateRecordingMinDUration(duration)) {
    return;
  }
  const result = await general.uploadAudioToS3(audioBlob, user.userId);
  result.success
    ? showNoty(
        "success",
        "The recording is proccesing and will be available soon.",
      )
    : showNoty(
        "error",
        "There was an error uploading the audio. Please try again.",
      );

  const audioUrl = URL.createObjectURL(audioBlob);
  console.log("Audio URL:", audioUrl);
};

const validateRecordingMinDUration = (duration: string) => {
  return true;
  const minutes = parseInt(duration.split(":")[0], 10);
  if (minutes < 2) {
    showNoty("error", "The recording must be at least 3 minutes long.");
    return false;
  }
  return true;
};

const onRecordingError = (error: any) => {
  console.error("Error en grabación:", error);
  showNoty(`Error: ${error}`, "negative");
};

defineOptions({
  name: "IndexPage",
});
</script>

<style scoped></style>
