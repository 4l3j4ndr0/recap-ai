# Git Workflow

## Purpose
Standardize Git practices and commit conventions for RecapAI development workflow using gitemoji for visual clarity.

## Instructions
• ALWAYS ask confirmation from the user before pushing to git (ID: GIT_PUSH_CONFIRM)
• ALWAYS use gitemoji at the beginning of every commit message for visual clarity (ID: USE_GITEMOJI)
• Follow this specific commit structure: `<gitemoji> <type>: <description>` followed by detailed body (ID: COMMIT_STRUCTURE)
• Commit messages MUST include: what was changed, why it was changed, and impact on RecapAI system (ID: DETAILED_COMMITS)
• Use conventional commit types: feat, fix, docs, style, refactor, test, chore, perf, ci, build (ID: CONVENTIONAL_TYPES)
• When working with Lambda functions, mention which processing stage is affected (audio, transcription, AI, status) (ID: LAMBDA_CONTEXT)
• Include file counts and component names in commit body for better tracking (ID: FILE_TRACKING)
• MUST test Amplify sandbox before committing backend changes (ID: TEST_BEFORE_COMMIT)
• NEVER commit sensitive data or AWS credentials (ID: NO_SECRETS)
• Example format: `✨ feat(audio-processor): Add audio format validation\n\nImplemented comprehensive audio validation for meeting recordings:\n- Added MIME type checking in Lambda function\n- Enhanced error handling for unsupported formats\n- Updated S3 trigger to validate before processing\n\nAffected RecapAI components:\n- Audio processing pipeline\n- Error notification system\n- User feedback for invalid uploads\n\nFiles modified: 2 Lambda functions, 1 Amplify backend config, 3 Vue components` (ID: COMMIT_EXAMPLE)

## Priority
Medium

## Error Handling
• If gitemoji is missing, suggest appropriate emoji based on change type
• If commit structure is incorrect, provide the proper format template
• If RecapAI context is missing for processing-related changes, prompt for pipeline stage impact
• For accidental secret commits, guide through git history cleanup
• Use .gitignore for amplify-meta.json and environment files
