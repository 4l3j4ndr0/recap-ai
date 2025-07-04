import { defineFunction } from "@aws-amplify/backend";

export const OnNewRecordFunction = defineFunction({
  name: "bucket-event-trigger-new-recording",
  runtime: 22,
  timeoutSeconds: 30,
  memoryMB: 2048,
  ephemeralStorageSizeMB: 1024,
});
