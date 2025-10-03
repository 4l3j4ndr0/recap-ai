# Data Model Standards

## Purpose
Define data modeling patterns and schema standards for RecapAI's DynamoDB tables and Amplify Data models.

## Instructions
• ALWAYS use RecordingSummary model for meeting data with proper status tracking (ID: RECORDING_SUMMARY_MODEL)
• MUST include userId for proper data isolation and authorization (ID: USER_DATA_ISOLATION)
• Use enum status values: COMPLETED, FAILED, TRANSCRIBING, TRANSCRIBING_COMPLETED, GENERATING_SUMMARY, ERROR (ID: STATUS_ENUM)
• ALWAYS store both S3 URIs and processed content for audio and transcription (ID: DUAL_STORAGE)
• Include confidence scores and metadata for quality tracking (ID: QUALITY_METRICS)
• NEVER store sensitive data in plain text, use proper encryption (ID: DATA_ENCRYPTION)
• Use secondary indexes for efficient querying by userId (ID: SECONDARY_INDEXES)
• Store Mermaid diagrams and markdown summaries as separate fields (ID: CONTENT_SEPARATION)

## Priority
High

## Error Handling
• For schema changes, ensure backward compatibility
• Validate required fields before database operations
• Use proper error messages for constraint violations
• Implement data migration strategies for schema updates
