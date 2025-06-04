import type { APIGatewayProxyHandler } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
const headers = {
  "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
  "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
};
const logger = new Logger();
import {
  PollyClient,
  StartSpeechSynthesisTaskCommand,
  GetSpeechSynthesisTaskCommand,
} from "@aws-sdk/client-polly";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
const pollyClient = new PollyClient();
const bedrockClient = new BedrockAgentRuntimeClient();
let client: ApiGatewayManagementApiClient;
const sendSocketMessage = async (connectionId: string, postMessage: string) => {
  const params = {
    ConnectionId: connectionId,
    Data: postMessage,
  };

  const command = new PostToConnectionCommand(params);
  await client.send(command);
};
export const handler: APIGatewayProxyHandler = async (
  event: any,
  context: any
) => {
  try {
    logger.addContext(context);
    logger.info("Event received", event);

    const connectionId = event.requestContext.connectionId;
    const domainName = event.requestContext.domainName;
    const stage = event.requestContext.stage;
    const endpoint = `https://${domainName}/${stage}`;
    const userId = event.requestContext.authorizer.sub;

    client = new ApiGatewayManagementApiClient({ endpoint });

    let message;
    try {
      message = JSON.parse(event.body).message;
    } catch (error: any) {
      logger.error("Error parsing message:", error);
      return { statusCode: 400, body: "Invalid message format" };
    }

    try {
      console.log("MESSAGE:::::", message);
      let postMessage;
      //TO-DO Logica para llamar el Agent de bedrock con el input del usuario
      const bedrockCommand = new InvokeAgentCommand({
        agentId: "KHGH9LHEGR",
        agentAliasId: "V85QDGYODF",
        inputText: message.message,
        sessionId: userId,
        endSession: message.action === "endSession" ? true : false,
      });

      const bedrockResponse: any = await bedrockClient.send(bedrockCommand);
      console.log("BEDROCK RESPONSE", bedrockResponse.completion);

      if (message.action === "endSession") {
        postMessage = JSON.stringify({
          message: {
            action: "endSession",
            message: "Bedrock session ended.",
          },
        });
        await sendSocketMessage(connectionId, postMessage);
        return { statusCode: 200, body: "Message received" };
      }

      let completion = "";
      for await (const chunkEvent of bedrockResponse.completion) {
        if (chunkEvent.chunk) {
          const chunk = chunkEvent.chunk;
          let decoded = new TextDecoder("utf-8").decode(chunk.bytes);
          completion += decoded;
        }
      }

      const pollyCommand = new StartSpeechSynthesisTaskCommand({
        Engine: "neural",
        OutputFormat: "mp3",
        LanguageCode: "es-MX",
        Text: completion,
        VoiceId: "Andres",
        OutputS3BucketName: process.env.S3_BUCKET_NAME,
        OutputS3KeyPrefix: "polly-output/",
      });

      const startTaskResponse: any = await pollyClient.send(pollyCommand);
      console.log("POLLY TASK", startTaskResponse);

      const taskId = startTaskResponse.SynthesisTask.TaskId;

      let taskStatus = "scheduled";
      let outPutUrl = "";
      while (taskStatus === "scheduled" || taskStatus === "inProgress") {
        console.log(`Estado de la tarea: ${taskStatus}. Esperando...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const getTaskCommand = new GetSpeechSynthesisTaskCommand({
          TaskId: taskId,
        });
        const getTaskResponse: any = await pollyClient.send(getTaskCommand);
        taskStatus = getTaskResponse.SynthesisTask.TaskStatus;
        outPutUrl = getTaskResponse.SynthesisTask.OutputUri;
      }

      if (taskStatus === "completed") {
        const parts = outPutUrl.split("/");
        postMessage = JSON.stringify({
          message: {
            action: "polly",
            outPutUrl: `polly-output/${parts[parts.length - 1]}`,
            bedrockResponse: completion,
          },
        });

        await sendSocketMessage(connectionId, postMessage);
      }

      logger.info(`Sent pong message to connection ID ${connectionId}`);
    } catch (error: any) {
      logger.error("Error:", error);
      return { statusCode: 500, body: "Failed to send pong message" };
    }

    return { statusCode: 200, body: "Message received" };
  } catch (error: any) {
    logger.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(error),
    };
  }
};
