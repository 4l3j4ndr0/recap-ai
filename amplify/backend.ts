import { defineBackend } from "@aws-amplify/backend";
import { EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Stack } from "aws-cdk-lib";
import { WebSocketApi, WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
  PolicyDocument,
} from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { storage } from "./storage/resource";
import { data } from "./data/resource";
import { ConnectFunction } from "./functions/connect-function/resource";
import { DisconnectFunction } from "./functions/disconnect-function/resource";
// import { SendMessageFunction } from "./functions/send-messages-function/resource";
import { AuthorizerFunction } from "./functions/authorizer-function/resource";
import { OnNewRecordFunction } from "./functions/bucket-event-trigger-new-recording/resource";
/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  // ConnectFunction,
  // DisconnectFunction,
  // SendMessageFunction,
  // AuthorizerFunction,
  storage,
  OnNewRecordFunction,
  data,
});

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED_PUT,
  new LambdaDestination(backend.OnNewRecordFunction.resources.lambda),
  {
    prefix: "users-recordings/",
  }
);

backend.OnNewRecordFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["transcribe:StartTranscriptionJob"],
    resources: ["*"],
  })
);

backend.OnNewRecordFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:GetItem"],
    resources: ["*"],
  })
);

const customResourcesStack = backend.createStack("custom-resources-stack");

const transcribeServiceRole = new Role(
  customResourcesStack,
  "TranscribeServiceRole",
  {
    roleName: "RecapAI-TranscribeServiceRole",
    assumedBy: new ServicePrincipal("transcribe.amazonaws.com"),
    description: "Role for Amazon Transcribe to access S3 buckets",
    inlinePolicies: {
      TranscribeS3Access: new PolicyDocument({
        statements: [
          // Permisos para leer archivos de audio del bucket de entrada
          new PolicyStatement({
            actions: [
              "s3:GetObject",
              "s3:GetObjectVersion",
              "s3:PutObject",
              "s3:PutObjectAcl",
            ],
            resources: [`*`],
          }),
          // Permisos para listar bucket (opcional pero recomendado)
          new PolicyStatement({
            actions: ["s3:ListBucket"],
            resources: ["*"],
            conditions: {
              StringLike: {
                "s3:prefix": ["users-recordings/*", "transcriptions/*"],
              },
            },
          }),
        ],
      }),
    },
  }
);

// // Agregar permisos para que Lambda pueda pasar el rol a Transcribe
backend.OnNewRecordFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["iam:PassRole"],
    resources: [transcribeServiceRole.roleArn],
    conditions: {
      StringEquals: {
        "iam:PassedToService": "transcribe.amazonaws.com",
      },
    },
  })
);

backend.OnNewRecordFunction.addEnvironment(
  "TRANSCRIBE_ROLE_ARN",
  transcribeServiceRole.roleArn
);

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
