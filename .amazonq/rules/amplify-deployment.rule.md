# AWS Amplify Deployment

## Purpose
Standardize AWS Amplify deployment patterns and CI/CD workflows for RecapAI's full-stack application.

## Instructions
• ALWAYS use Amplify Gen 2 with TypeScript configuration (ID: AMPLIFY_GEN2)
• MUST define backend resources in amplify/backend.ts (ID: BACKEND_CONFIG)
• Use Amplify sandbox for local development (ID: SANDBOX_DEV)
• NEVER commit amplify/backend/amplify-meta.json to version control (ID: NO_META_COMMIT)
• Configure environment-specific settings via Amplify console (ID: ENV_SETTINGS)
• Use Amplify Auth for Cognito integration (ID: AMPLIFY_AUTH)
• ALWAYS test deployments in sandbox before production (ID: SANDBOX_TESTING)

## Priority
High

## Error Handling
• If sandbox fails, check AWS credentials and permissions
• For deployment issues, verify backend configuration syntax
• Use Amplify CLI logs for troubleshooting deployment failures
