# Frontend Vue Quasar Standards

## Purpose
Enforce Vue.js 3 and Quasar Framework best practices for RecapAI's responsive meeting interface.

## Instructions
• ALWAYS use Composition API with `<script setup>` syntax (ID: COMPOSITION_API)
• MUST use Pinia for state management, not Vuex (ID: PINIA_STATE)
• Use Quasar components over custom HTML elements (ID: QUASAR_COMPONENTS)
• ALWAYS implement responsive design with Quasar's breakpoint system (ID: RESPONSIVE_DESIGN)
• Use TypeScript for type safety in components (ID: TYPESCRIPT_SAFETY)
• NEVER directly manipulate DOM, use Vue reactivity (ID: NO_DOM_MANIPULATION)
• Implement proper error boundaries for audio recording failures (ID: ERROR_BOUNDARIES)

## Priority
High

## Error Handling
• For audio recording issues, provide clear user feedback
• Implement graceful degradation for unsupported browsers
• Use Quasar's built-in loading and notification systems
