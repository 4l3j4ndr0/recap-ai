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
    <!-- Lista de recordings -->
    <RecordingSummaryList />
  </q-layout>
</template>

<script setup lang="ts">
import { useGeneralStore } from "../../src/stores/General";
import { useUserStore } from "../../src/stores/User";
import RecordingButton from "../components/RecordingButton.vue";
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
    console.log("New recording summary created:", data);
    recordingSummary.addRecordingSummaryListener(data);
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
    console.log("New recording summary updated:", data);
    recordingSummary.updateRecordyngSummaryListener(data);
  },
  error: (error) => console.warn(error),
});

const onRecordingStarted = () => {
  console.log("Grabación iniciada.");
};

const onRecordingStopped = async (audioBlob: any, duration: any) => {
  console.log(`Grabación detenida. Duración: ${duration}`);
  console.log("Audio blob:", audioBlob);
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

const onRecordingError = (error: any) => {
  console.error("Error en grabación:", error);
  showNoty(`Error: ${error}`, "negative");
};

defineOptions({
  name: "IndexPage",
});
</script>

<style scoped></style>
