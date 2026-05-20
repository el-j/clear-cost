---
name: claude-workflow
description: "Use when planning, implementing, reviewing, or validating changes in this React/Vite calculator app; covers workflow, component boundaries, and calculation logic."
argument-hint: "Task or change description"
user-invocable: true
disable-model-invocation: false
---

# Claude Workflow

## When to Use
- Rebuild the calculator from the HTML example.
- Make focused UI or pricing logic changes in this repository.
- Validate a finished slice before moving on.

## Workflow
1. Read the requested change and the relevant source files.
2. Separate pure calculation logic from presentational React code.
3. Implement the smallest coherent slice first.
4. Keep the UI responsive, accessible, and visually deliberate.
5. Verify the result with the repository build command.

## Core Rules
- Do not copy imperative DOM code into React components.
- Do not mix formatting helpers into JSX when they can live in `src/lib/`.
- Do not widen scope before the current slice is working.

## References
- [Project instructions](../../copilot-instructions.md)
- [Example HTML](../../../index_example.html)
