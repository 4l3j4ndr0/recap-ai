import { defineFunction } from "@aws-amplify/backend";

export const OnNewTranscriptionFunction = defineFunction({
  name: "bucket-event-trigger-new-transcription",
  runtime: 22,
  timeoutSeconds: 300,
  memoryMB: 2048,
  ephemeralStorageSizeMB: 1024,
  resourceGroupName: "data",
});
