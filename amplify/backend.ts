import { defineBackend, secret } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import { EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { StartingPosition, EventSourceMapping } from "aws-cdk-lib/aws-lambda";
import {
  PolicyStatement,
  Role,
  ServicePrincipal,
  PolicyDocument,
  Effect,
  Policy,
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

const audioFormats = [".mp3", ".webm", ".wav", ".m4a", ".ogg", ".flac"];

audioFormats.forEach((suffix) => {
  backend.storage.resources.bucket.addEventNotification(
    EventType.OBJECT_CREATED,
    new LambdaDestination(backend.OnNewRecordFunction.resources.lambda),
    {
      prefix: "users-recordings/",
      suffix: suffix,
    },
  );
});

const recordingSummaryTable = backend.data.resources.tables["RecordingSummary"];
const policy = new Policy(
  Stack.of(recordingSummaryTable),
  "recordingSummaryTableStreamPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
        ],
        resources: ["*"],
      }),
    ],
  },
);

backend.OnNewTranscriptionFunction.resources.lambda.role?.attachInlinePolicy(
  policy,
);
backend.OnNewTranscriptionFunction.resources.lambda.role?.attachInlinePolicy(
  policy,
);

const mapping = new EventSourceMapping(
  Stack.of(recordingSummaryTable),
  "RecordingSummaryStreamMapping",
  {
    target: backend.OnNewTranscriptionFunction.resources.lambda,
    eventSourceArn: recordingSummaryTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  },
);

mapping.node.addDependency(policy);
backend.OnNewRecordFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["s3:GetObject"],
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

backend.OnNewRecordFunction.addEnvironment(
  "ASSEMBLYAI_API_KEY",
  secret("ASSEMBLYAI_API_KEY"),
);
