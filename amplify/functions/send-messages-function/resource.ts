import { defineFunction } from "@aws-amplify/backend";

export const SendMessageFunction = defineFunction({
  name: "send-messages-function",
  timeoutSeconds: 120,
  memoryMB: 2048
});
