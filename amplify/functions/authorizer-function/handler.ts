import type { APIGatewayProxyHandler } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { verifyToken } from "./verifyToken";
import { generateAllowPolicy } from "./generatePolicy";
// Environment variable provided by AWS.
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

const USER_POOL_ID = process.env.USER_POOL_ID || "";
const headers = {
  "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
  "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
};
const logger = new Logger();
//@ts-ignore
export const handler: APIGatewayProxyHandler = async (
  event: any,
  context: any
) => {
  const token = event["queryStringParameters"]["idToken"];
  logger.info("Event received", event);
  if (!token) {
    return "Unauthorized";
  }

  const verifyTokenResponse: any = await verifyToken(
    AWS_REGION,
    USER_POOL_ID,
    token
  );

  if (!verifyTokenResponse) {
    return "Unauthorized";
  }

  console.log("verifyTokenResponse", JSON.stringify(verifyTokenResponse));

  // Optionally: use `verifyTokenResponse` data to allow or deny (with `generateDenyPolicy()`) user access based on
  // your business requirements. You can also add whatever context payload you'd like - it will be available in every
  // WS lambda call.

  const policy = generateAllowPolicy("user", event.methodArn, {
    ...verifyTokenResponse,
    customPayload: "customPayloadValue",
  });

  console.log("policy", JSON.stringify(policy));

  return policy;
};
