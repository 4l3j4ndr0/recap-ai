import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "ia-interview-simulator",
  access: (allow) => ({
    "polly-output/*": [allow.authenticated.to(["read", "write"])],
  }),
});
