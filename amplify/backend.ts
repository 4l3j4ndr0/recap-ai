import { defineBackend } from "@aws-amplify/backend";
import { EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import {
  PolicyStatement,
  Role,
  ServicePrincipal,
  PolicyDocument,
} from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { storage } from "./storage/resource";
import { data } from "./data/resource";
import { OnNewRecordFunction } from "./functions/bucket-event-trigger-new-recording/resource";
import { OnNewTranscriptionFunction } from "./functions/bucket-event-trigger-new-transcription/resource";
/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  storage,
  OnNewRecordFunction,
  OnNewTranscriptionFunction,
  data,
});

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED_PUT,
  new LambdaDestination(backend.OnNewRecordFunction.resources.lambda),
  {
    prefix: "users-recordings/",
  },
);

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED_PUT,
  new LambdaDestination(backend.OnNewTranscriptionFunction.resources.lambda),
  {
    prefix: "transcriptions/",
    suffix: ".json",
  },
);

backend.OnNewRecordFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["transcribe:StartTranscriptionJob"],
    resources: ["*"],
  }),
);

backend.OnNewTranscriptionFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["s3:GetObject", "bedrock:InvokeModel"],
    resources: ["*"],
  }),
);

backend.OnNewTranscriptionFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:GetItem"],
    resources: ["*"],
  }),
);

backend.OnNewTranscriptionFunction.addEnvironment(
  "MODEL_ID",
  "us.anthropic.claude-sonnet-4-20250514-v1:0",
);

const customResourcesStack = backend.createStack("custom-resources-stack");

const transcribeServiceRole = new Role(
  customResourcesStack,
  "TranscribeServiceRole",
  {
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
  },
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
  }),
);

backend.OnNewRecordFunction.addEnvironment(
  "TRANSCRIBE_ROLE_ARN",
  transcribeServiceRole.roleArn,
);
