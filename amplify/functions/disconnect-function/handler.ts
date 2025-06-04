import type { APIGatewayProxyHandler } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
const headers = {
  "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
  "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
};
const logger = new Logger();
export const handler: APIGatewayProxyHandler = async (
  event: any,
  context: any
) => {
  try {
    logger.addContext(context);
    logger.info("Event received", event);

    const connectionId = event.requestContext.connectionId;
    logger.info(`User disconnected, Connection ID ${connectionId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify("User Connected"),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(error),
    };
  }
};
