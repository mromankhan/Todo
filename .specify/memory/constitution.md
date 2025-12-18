<!-- SYNC IMPACT REPORT:
Version change: N/A (initial version) → 1.0.0
Modified principles: N/A
Added sections: All principles below
Removed sections: N/A
Templates requiring updates: N/A
Follow-up TODOs: None
-->
# Todo Constitution

## Core Principles

### No Implementation Without Approved Specification
Specifications are the single source of truth for all project development. Any changes to the codebase require an updated specification first, ensuring that all implementations align with documented requirements and project goals.

### Specifications as Single Source of Truth  
All specifications serve as the authoritative reference for project requirements, functionality, and architecture. All development, testing, and review activities must refer to these specifications as the definitive guide.

### Frontend and Backend Separation
The frontend and backend must remain logically separated to ensure scalability, maintainability, and independent development cycles. Clear API contracts define the interface between these components.

### Consistent Authentication and Authorization
Authentication and authorization mechanisms must be enforced consistently across all application layers. All access controls must follow uniform security standards and protocols.

### Mandatory User Data Isolation
User data isolation is mandatory at all layers of the application. Each user's data must be securely separated from others to ensure privacy and security compliance.

### No Hardcoded Secrets
Secrets and credentials must never be hardcoded in the source code. All sensitive information must be stored securely using appropriate configuration management and vault solutions.

### MCP Server Usage Requirement
MCP servers are available and must be utilized when relevant for up-to-date knowledge. All team members should leverage these resources for accurate and current project information.

### MCP Over Assumptions
Prefer MCP sources over assumptions or outdated knowledge when making development decisions. This ensures that all implementations are based on reliable and current information.

### Production-Ready Code Standards
Generated code must be clean, readable, and production-ready. All code must meet quality standards for maintainability, performance, and reliability.

### Explicit Error Handling
Errors must be handled explicitly in all parts of the application. Proper error reporting, logging, and recovery mechanisms must be implemented to ensure robust operation.

### Constitution Rules Override All Instructions
Constitution rules override all other instructions, guidelines, and practices. All team members must abide by these principles regardless of conflicting directives.

## Additional Constraints

All development must follow the established technology stack requirements, maintain consistent coding standards, and comply with security and deployment policies.

## Development Workflow

Code review requirements must verify constitution compliance, testing gates must validate all principles, and deployment approval processes must ensure adherence to all constitutional rules.

## Governance

This constitution supersedes all other development practices. Any amendments require proper documentation, approval, and migration planning. All PRs and reviews must verify compliance with these principles. Complexity must be justified with clear benefits to the project.

**Version**: 1.0.0 | **Ratified**: 2025-12-18 | **Last Amended**: 2025-12-18