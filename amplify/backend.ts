import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import { WebSocketApi, WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { storage } from "./storage/resource";
import { ConnectFunction } from "./functions/connect-function/resource";
import { DisconnectFunction } from "./functions/disconnect-function/resource";
import { SendMessageFunction } from "./functions/send-messages-function/resource";

import { AuthorizerFunction } from "./functions/authorizer-function/resource";
/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  // ConnectFunction,
  // DisconnectFunction,
  // SendMessageFunction,
  // AuthorizerFunction,
  // storage,
  // data,
});

// backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
//   new PolicyStatement({
//     actions: [
//       "polly:SynthesizeSpeech",
//       "transcribe:StartStreamTranscriptionWebSocket"
//     ],
//     resources: ["*"]
//   })
// );

// const apiStack = backend.createStack("api-stack");

// const webSocketApi = new WebSocketApi(apiStack, "websocket-api", {
//   apiName: "IAInterviewSimulator",
//   connectRouteOptions: {
//     authorizer: new WebSocketLambdaAuthorizer(
//       "Authorizer",
//       backend.AuthorizerFunction.resources.lambda,
//       {
//         identitySource: ["route.request.querystring.idToken"]
//       }
//     ),
//     integration: new WebSocketLambdaIntegration(
//       "ConnectHandlerIntegratio",
//       backend.ConnectFunction.resources.lambda
//     )
//   },
//   disconnectRouteOptions: {
//     integration: new WebSocketLambdaIntegration(
//       "DisconnectHandlerIntegration",
//       backend.DisconnectFunction.resources.lambda
//     )
//   },
//   routeSelectionExpression: "$request.body.action"
// });

// const apiStage = new WebSocketStage(apiStack, "websocket-stage", {
//   webSocketApi,
//   stageName: "prod",
//   autoDeploy: true
// });

// webSocketApi.addRoute("SendMessage", {
//   integration: new WebSocketLambdaIntegration(
//     "SendMessageIntegration",
//     backend.SendMessageFunction.resources.lambda
//   )
// });

// backend.SendMessageFunction.resources.lambda.addToRolePolicy(
//   new PolicyStatement({
//     actions: ["execute-api:ManageConnections"],
//     resources: [
//       Stack.of(apiStack).formatArn({
//         service: "execute-api",
//         resourceName: `${apiStage.stageName}/POST/*`,
//         resource: "*"
//       })
//     ]
//   })
// );

// backend.SendMessageFunction.resources.lambda.role?.attachInlinePolicy(
//   new Policy(apiStack, "s3-policy", {
//     statements: [
//       new PolicyStatement({
//         actions: ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
//         resources: ["*"]
//       })
//     ]
//   })
// );

// backend.SendMessageFunction.resources.lambda.role?.attachInlinePolicy(
//   new Policy(apiStack, "polly-policy", {
//     statements: [
//       new PolicyStatement({
//         actions: [
//           "polly:StartSpeechSynthesisTask",
//           "polly:GetSpeechSynthesisTask"
//         ],
//         resources: ["*"]
//       })
//     ]
//   })
// );

// backend.SendMessageFunction.resources.lambda.role?.attachInlinePolicy(
//   new Policy(apiStack, "bedrock-policy", {
//     statements: [
//       new PolicyStatement({
//         actions: ["bedrock:InvokeAgent"],
//         resources: ["*"]
//       })
//     ]
//   })
// );

// backend.AuthorizerFunction.addEnvironment(
//   "USER_POOL_ID",
//   backend.auth.resources.userPool.userPoolId
// );

// backend.SendMessageFunction.addEnvironment(
//   "S3_BUCKET_NAME",
//   backend.storage.resources.bucket.bucketName
// );

// backend.addOutput({
//   custom: {
//     WebSocketApiEndpoint: `${webSocketApi.apiEndpoint}/${apiStage.stageName}`,
//     WebSocketApiId: webSocketApi.apiId
//   }
// });
