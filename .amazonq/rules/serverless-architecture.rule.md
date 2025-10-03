# Serverless Architecture

## Purpose
Enforce serverless-first design patterns and AWS Lambda best practices for RecapAI's meeting intelligence platform.

## Instructions
• ALWAYS design solutions using serverless services first (ID: SERVERLESS_FIRST)
• MUST use AWS Lambda for all processing functions (ID: LAMBDA_CORE)
• Event-driven architecture with S3, EventBridge, and DynamoDB (ID: EVENT_DRIVEN)
• NEVER suggest EC2 or container solutions unless explicitly required (ID: NO_SERVERS)
• Optimize for cold start performance in Lambda functions (ID: COLD_START_OPT)
• Use environment variables for configuration, not hardcoded values (ID: ENV_CONFIG)

## Priority
High

## Error Handling
• If serverless approach isn't feasible, explain limitations and suggest hybrid approach
• For high-latency requirements, consider provisioned concurrency
• Default to managed services over custom implementations
