# Lambda Functions Standards

## Purpose
Define coding standards and patterns for RecapAI's Lambda functions handling audio processing, transcription, and AI summarization.

## Instructions
• ALWAYS use Node.js 20.x runtime for consistency (ID: NODE_RUNTIME)
• MUST implement proper error handling with structured logging (ID: ERROR_HANDLING)
• Use AWS SDK v3 with modular imports for smaller bundle size (ID: SDK_V3)
• NEVER exceed 15-minute timeout, chunk long-running tasks (ID: TIMEOUT_LIMIT)
• Implement idempotency for processing functions (ID: IDEMPOTENCY)
• Use environment variables for service configuration (ID: ENV_VARS)
• ALWAYS validate input parameters and file formats (ID: INPUT_VALIDATION)

## Priority
High

## Error Handling
• Log errors with correlation IDs for tracing
• Return structured error responses with appropriate HTTP status codes
• Implement circuit breaker pattern for external service calls
• Use dead letter queues for failed processing attempts
