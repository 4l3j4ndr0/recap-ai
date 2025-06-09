import { defineStorage, defineFunction } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "recap-ai",
  access: (allow) => ({
    "users-recordings/*": [allow.authenticated.to(["get", "write", "list"])],
    "transcriptions/*": [allow.authenticated.to(["read", "write"])],
  }),
});
