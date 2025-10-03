# AI Processing Workflow

## Purpose
Standardize AI processing patterns for RecapAI's meeting intelligence pipeline using AssemblyAI and Amazon Bedrock.

## Instructions
• ALWAYS validate audio format before processing (ID: AUDIO_VALIDATION)
• MUST use AssemblyAI for speech-to-text conversion with confidence scoring (ID: ASSEMBLYAI_REQUIRED)
• Use Amazon Bedrock for AI-powered summarization and Mermaid diagram generation (ID: BEDROCK_CLAUDE)
• NEVER process audio files larger than 2GB without chunking (ID: FILE_SIZE_LIMIT)
• Generate both markdown summaries and Mermaid diagrams automatically (ID: DUAL_OUTPUT)
• Store processing status in DynamoDB with real-time updates (ID: STATUS_TRACKING)
• ALWAYS implement retry logic for AI service failures (ID: RETRY_LOGIC)
• Use S3 event triggers for automatic processing pipeline initiation (ID: S3_TRIGGERS)
• Support multiple audio formats: mp3, webm, wav, m4a, ogg, flac (ID: MULTI_FORMAT)

## Priority
High

## Error Handling
• For transcription failures, provide partial results if available
• If Bedrock is unavailable, queue requests for later processing
• Implement exponential backoff for API rate limits
• Store failed jobs for manual review
• Update RecordingSummary status appropriately (FAILED, ERROR)
