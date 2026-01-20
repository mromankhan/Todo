---
name: spec-feature
description: Generate feature specifications for Spec-Driven Development. Use this skill when you need to create a new feature specification file following the Spec-Kit Plus methodology. Triggers on requests like "create spec for X", "write specification for feature Y", "generate spec file", or when implementing new features that require specifications first.
---

# Spec Feature Generator

Generate comprehensive feature specifications following Spec-Kit Plus methodology for the Todo application.

## Workflow

1. Gather feature requirements from user
2. Create specification directory structure
3. Generate spec.md with full feature specification
4. Generate plan.md with implementation plan
5. Generate tasks.md with actionable task checklist

## Specification Structure

Create specs in `/specs/<feature-number>-<feature-name>/`:

```
specs/
└── 001-auth/
    ├── spec.md      # Feature specification
    ├── plan.md      # Implementation plan
    └── tasks.md     # Task checklist
```

## spec.md Template

```markdown
# Feature: [Feature Name]

## Overview
[1-2 sentence description of the feature]

## User Stories
- As a [user type], I want to [action] so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Requirements

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/... | Description |

### Data Models
[Define required data structures]

### UI Components
[List required frontend components]

## Security Considerations
[Authentication, authorization, validation requirements]

## Dependencies
[List any dependencies on other features or systems]
```

## plan.md Template

```markdown
# Implementation Plan: [Feature Name]

## Phase 1: Backend
1. Create database models
2. Implement API endpoints
3. Add authentication middleware

## Phase 2: Frontend
1. Create UI components
2. Integrate with API
3. Add form validation

## Phase 3: Testing
1. Unit tests
2. Integration tests
3. E2E tests
```

## tasks.md Template

```markdown
# Tasks: [Feature Name]

## Backend Tasks
- [ ] Create SQLModel schema
- [ ] Implement CRUD endpoints
- [ ] Add JWT middleware

## Frontend Tasks
- [ ] Create React components
- [ ] Implement API client
- [ ] Style with Tailwind CSS

## Testing Tasks
- [ ] Write unit tests
- [ ] Write E2E tests
```

## Usage Example

When user says: "Create a spec for the task management feature"

1. Create directory: `specs/002-task-management/`
2. Generate `spec.md` with:
   - CRUD operations for tasks
   - Task properties (title, description, status, priority, due_date)
   - API endpoints for all operations
   - UI components needed
3. Generate `plan.md` with phased approach
4. Generate `tasks.md` with checkbox items
