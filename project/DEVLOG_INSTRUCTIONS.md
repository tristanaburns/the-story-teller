# DEVLOG Instructions

## Purpose

The Development Log (DEVLOG.md) is a chronological record of all significant changes, decisions, challenges, and milestones throughout the project lifecycle. This document serves multiple purposes:

1. **Historical Record**: Maintains a complete history of the project's evolution
2. **Knowledge Transfer**: Helps new team members understand project decisions
3. **Issue Tracking**: Documents challenges and their solutions
4. **Progress Tracking**: Records milestone achievements and progress
5. **Decision Documentation**: Preserves the rationale behind technical choices

## Important Guidelines

### ⚠️ CRITICAL: DEVLOG Entry Preservation

1. **Never Delete Previous Entries**: All historical entries must be preserved - never delete or modify previous log entries
2. **Add New Entries Only**: Always add new entries at the TOP of the file (reverse chronological order)
3. **Complete Information**: Include all relevant details in each entry
4. **Date and Author**: Each entry must include date (YYYY-MM-DD format) and author
5. **Categorization**: Use consistent categories for entries

### Entry Format

```markdown
## YYYY-MM-DD - [Category] Brief Title

**Author:** Your Name

### Changes Made
- Detailed list of changes
- Be specific about files, features, or components

### Decisions
- Document important decisions made
- Include rationale behind choices

### Challenges
- Document any significant challenges encountered
- Describe solutions implemented or proposed

### Next Steps
- List planned next actions
- Include any dependencies or blockers

---
```

## Categories

Use consistent categories to help organize and search the log:

- **Feature**: New feature implementation
- **Fix**: Bug fix or issue resolution
- **Refactor**: Code restructuring without behavior change
- **Docs**: Documentation updates
- **Test**: Test addition or modification
- **Perf**: Performance improvement
- **DevOps**: CI/CD, deployment, build processes
- **Security**: Security-related changes
- **Database**: Database schema or query changes
- **UI**: User interface changes
- **API**: API-related changes
- **Dependency**: External dependency updates

## Example DEVLOG Entry

```markdown
## 2025-04-21 - [Feature] Implement User Authentication

**Author:** Jane Developer

### Changes Made
- Added NextAuth.js configuration in `app/api/auth/[...nextauth]/route.ts`
- Created sign-in page in `app/auth/signin/page.tsx`
- Added session provider in `app/providers/index.tsx`
- Created user database provisioning in `lib/user-db.ts`

### Decisions
- Selected NextAuth.js for authentication instead of a custom solution
  - Pros: Simplified OAuth integration, session management, token rotation
  - Cons: Less customization flexibility, additional dependency
- Chose Google and GitHub as initial OAuth providers based on target user demographics

### Challenges
- Encountered CORS issues with OAuth redirects
  - Solution: Added proper NextAuth.js callback URLs and configured CORS headers
- MongoDB connection issues in development environment
  - Solution: Implemented environment-specific connection handling

### Next Steps
- Implement protected routes middleware
- Add user profile management
- Create user settings page
- Add role-based authorization

---
```

## Best Practices

1. **Be Prompt**: Add entries as soon as significant changes are made
2. **Be Thorough**: Include all relevant details
3. **Be Clear**: Use simple, direct language
4. **Be Factual**: Focus on what happened, not opinions
5. **Link Related Entries**: Reference previous entries where relevant
6. **Include Resources**: Add links to external resources or references when applicable
7. **Capture Context**: Include enough context to understand the entry without requiring other knowledge

## Important Note on Version Control

While git commit history provides some project history, the DEVLOG serves a different purpose:

- **Git**: Tracks code changes at a granular level
- **DEVLOG**: Captures high-level changes, decisions, and context

Both are important and complementary. Use meaningful git commit messages, but reserve detailed explanations and decision rationale for the DEVLOG.

---

By following these guidelines, the DEVLOG will become an invaluable resource for current and future team members to understand the project's evolution and the reasoning behind key decisions.
