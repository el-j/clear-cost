# Project Guidelines

## Workflow
- Use the `claude-workflow` skill when planning, implementing, reviewing, or validating repo changes.
- Keep changes small and typed; separate pure calculation logic from React UI.
- Treat [index_example.html](../index_example.html) as the source of truth for copied behavior.
- Validate code changes with `npm run build` before finishing.

## Stack
- React + TypeScript + Vite.
- Prefer pure functions for pricing, quote generation, and formatting logic.
- Keep UI copy in German unless the user asks otherwise.

## Conventions
- Put business logic in `src/lib/` and UI state in `src/App.tsx`.
- Favor reusable components for repeated form groups and summary rows.
- Keep clipboard-copy behavior resilient with a browser API fallback.
- Preserve responsive layouts and accessible labels for every input.
