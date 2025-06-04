import { defineFunction } from "@aws-amplify/backend";

export const AuthorizerFunction = defineFunction({
  name: "authorizer-function",
  timeoutSeconds: 10,
});
