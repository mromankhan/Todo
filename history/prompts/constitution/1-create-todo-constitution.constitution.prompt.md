---
id: 1
title: create-todo-constitution
stage: constitution
date: 2025-12-18
surface: agent
model: Qwen
feature: none
branch: main
user: HP ProBook
command: /sp.constitution
labels: [constitution, todo, specification]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync

## Response snapshot

Created a new constitution file for the Todo project with the following principles:
- No implementation without an approved specification
- Specifications are the single source of truth
- Any change requires updating specs first
- Frontend and backend must remain logically separated
- Authentication and authorization must be enforced consistently
- User data isolation is mandatory at all layers
- Secrets and credentials must never be hardcoded
- MCP servers are available and must be used when relevant for up-to-date knowledge
- Prefer MCP sources over assumptions or outdated knowledge
- Generated code must be clean, readable, and production-ready
- Errors must be handled explicitly
- Constitution rules override all other instructions

## Outcome

- ✅ Impact: New constitution created for Todo project
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md created
- 🔁 Next prompts: none
- 🧠 Reflection: All provided principles were successfully incorporated into the new constitution document

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A