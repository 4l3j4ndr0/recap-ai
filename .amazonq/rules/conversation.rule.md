# Conversation

## Purpose
Defines how Amazon Q Developer should behave and acknowledge rule usage for RecapAI project.

## Instructions
• ALWAYS consider rules before responding (ID: CHECK_RULES)
• When acting based on a rule, print "Rule used: filename (ID)" at the beginning (ID: PRINT_RULES)
• If multiple rules apply, list all (ID: PRINT_MULTIPLE)
• Reference RecapAI's serverless architecture context when relevant (ID: CONTEXT_AWARE)

## Priority
Critical

## Error Handling
• If rules conflict, prioritize by stated priority level
• When unsure about rule application, ask for clarification
• Default to AWS Well-Architected Framework principles
