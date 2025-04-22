# The Story Teller: Sprint Planning

*Last Updated: 2025-04-28*

This document outlines the sprint planning process and current sprint details for The Story Teller project, prioritizing the Minimum Testable Product (MTP) as defined in the Blueprint.

## Sprint Methodology

The Story Teller project follows a modified Agile methodology with:

- **Sprint Duration**: 2 weeks
- **Planning Meetings**: Beginning of each sprint
- **Daily Standups**: 15-minute check-ins each morning
- **Sprint Reviews**: End of each sprint to demonstrate completed work
- **Retrospectives**: End of each sprint to identify improvements
- **Backlog Refinement**: Mid-sprint to prepare for upcoming sprints

## Current Sprint: Sprint 8 (April 15 - April 29, 2025)

### Revised Sprint Goals (Updated April 28, 2025)

1. **Begin implementation of MTP Epic E0**: Author can create & AI-generate a passage
2. **Start development of MTP Epic E1**: Schema enforcement & DB isolation
3. **Prepare for MTP Epic E2**: Importer & Seed
4. **Resolve critical bugs from previous sprint**
5. **Enhance technical infrastructure to support MTP**

### Updated Sprint Backlog

| Task ID | Description | Type | Assignee | Story Points | Status | Priority |
|---------|-------------|------|----------|--------------|--------|----------|
| ST-190 | Implement editor with sample story loading (US-E0-01) | Feature | Sarah | 8 | 🔄 In Progress | **HIGHEST** |
| ST-191 | Create AI Generate Draft button functionality (US-E0-02) | Feature | Michael | 5 | 🔄 In Progress | **HIGHEST** |
| ST-192 | Implement validation for AI-generated content (US-E0-03) | Feature | Jamie | 5 | 🔄 In Progress | **HIGHEST** |
| ST-193 | Set up per-user MongoDB databases (US-E1-01) | Feature | Alex | 8 | 🔄 In Progress | **HIGHEST** |
| ST-194 | Create Ajv validation middleware (US-E1-02) | Feature | Priya | 5 | ⏱️ To Do | **HIGHEST** |
| ST-195 | Develop CLI seed command structure | Feature | Jamie | 3 | ⏱️ To Do | **HIGHEST** |
| ST-196 | Create Shadow Team Chronicles sample data structure | Feature | Sarah | 5 | ⏱️ To Do | **HIGHEST** |
| ST-197 | Set up Cypress testing framework for MTP | Technical | Alex | 3 | ⏱️ To Do | **HIGHEST** |
| ST-198 | Implement error handling for editor and AI generation | Enhancement | Michael | 3 | ⏱️ To Do | **HIGHEST** |
| ST-199 | Create schema compilation pipeline | Technical | Priya | 5 | ⏱️ To Do | **HIGHEST** |

### Sprint Capacity

| Team Member | Role | Capacity (hours) | Allocated (hours) | Remaining (hours) |
|-------------|------|------------------|-------------------|-------------------|
| Sarah | Frontend Developer | 60 | 56 | 4 |
| Michael | Frontend Developer | 60 | 48 | 12 |
| Alex | Backend Developer | 60 | 56 | 4 |
| Jamie | Full-stack Developer | 60 | 48 | 12 |
| Priya | Backend Developer | 60 | 50 | 10 |

### Sprint Burndown

| Date | Points Remaining | Status |
|------|------------------|--------|
| April 15 | 50 | Sprint Start |
| April 18 | 45 | On Track |
| April 22 | 37 | On Track |
| April 25 | - | Projected: 22 |
| April 29 | - | Projected: 8 |

## Upcoming Sprint: Sprint 9 (April 30 - May 13, 2025)

### Revised Tentative Goals

1. **Complete MTP Epic E0**: Finish editor with AI generation capabilities
2. **Finalize MTP Epic E1**: Complete schema enforcement and DB isolation
3. **Implement MTP Epic E2**: Finish importer and seed functionality
4. **Run Cypress tests**: Validate MTP functionality
5. **Prepare for Phase 1**: Begin planning Interactive Runner implementation

### Candidate Backlog Items

| Task ID | Description | Type | Priority | Story Points |
|---------|-------------|------|----------|--------------|
| ST-200 | Complete editor with sample story loading | Feature | **HIGHEST** | 5 |
| ST-201 | Finalize AI Generate Draft functionality | Feature | **HIGHEST** | 5 |
| ST-202 | Complete validation and error handling | Feature | **HIGHEST** | 3 |
| ST-203 | Finalize per-user MongoDB setup | Feature | **HIGHEST** | 3 |
| ST-204 | Complete Ajv validation middleware | Feature | **HIGHEST** | 5 |
| ST-205 | Implement first-login detection and seeding | Feature | **HIGHEST** | 5 |
| ST-206 | Finalize Shadow Team Chronicles sample data | Feature | **HIGHEST** | 5 |
| ST-207 | Create comprehensive Cypress tests for MTP | Technical | **HIGHEST** | 8 |
| ST-208 | Fix any issues found during MTP testing | Bug | **HIGHEST** | 5 |
| ST-209 | Begin planning Interactive Runner (Phase 1) | Planning | **HIGH** | 3 |
| ST-210 | Prepare WebSocket infrastructure for Phase 1 | Technical | **HIGH** | 5 |

## Sprint Backlog Management

The project backlog has been reprioritized according to these principles:

1. **MTP First**: Items aligned with the Minimum Testable Product receive highest priority
2. **Blueprint Alignment**: All work must align with the project blueprint
3. **Story Points**: Complexity is estimated using story points (Fibonacci: 1, 2, 3, 5, 8, 13)
4. **Definition of Ready**: Backlog items must have clear acceptance criteria and be properly sized
5. **Buffer**: Each sprint includes 15% capacity buffer for unexpected issues

## Sprint Planning Process

The sprint planning meeting follows this revised agenda:

1. **Review Blueprint**: Confirm alignment with MTP and phased roadmap
2. **Discuss Sprint Goals**: Agree on primary objectives for the sprint
3. **Capacity Planning**: Determine available team capacity
4. **Backlog Selection**: Choose items from the backlog based on MTP priorities
5. **Task Breakdown**: Break down selected items into specific tasks
6. **Assignment**: Assign tasks to team members based on expertise and availability
7. **Commitment**: Team commits to the sprint backlog

## Sprint Review Process

At the end of each sprint, the team conducts a review following this format:

1. **Blueprint Alignment**: Review how completed work aligns with the MTP and phased roadmap
2. **Demo**: Demonstration of completed features
3. **Progress Update**: Review of sprint goals achievement
4. **Metrics Review**: Velocity, completion rate, and quality metrics
5. **Stakeholder Feedback**: Collection of feedback on demonstrated features
6. **Backlog Impact**: Discussion of any changes needed to the backlog

## Sprint Retrospective Process

The retrospective follows this format:

1. **What Went Well**: Positive aspects to continue
2. **What Could Be Improved**: Areas for enhancement
3. **Action Items**: Specific improvements to implement
4. **Previous Action Review**: Follow-up on previous retrospective actions
5. **MTP Progress**: Assess how well the team is executing against the MTP requirements

## Sprint Artifacts

Each sprint maintains these artifacts:

1. **Sprint Backlog**: List of items selected for the sprint
2. **Sprint Burndown Chart**: Visual representation of progress
3. **MTP Alignment Matrix**: Mapping of sprint items to MTP user stories
4. **Sprint Review Notes**: Documentation of review outcomes
5. **Retrospective Action Items**: List of improvement actions
6. **Sprint Report**: Summary of accomplishments and metrics

## Relation to Other Documentation

This sprint planning document connects to:

- **Project Blueprint**: For MTP definition and phased roadmap
- **Project Status Overview**: For current implementation status
- **Feature Catalogue**: For broader feature context
- **Requirements Documentation**: For technical specifications
- **Resource Allocation**: For team capacity planning
