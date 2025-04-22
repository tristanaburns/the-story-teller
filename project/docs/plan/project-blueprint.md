# The Story Teller — Blueprint v2

*Last Updated: 2025-04-28*

This document outlines the comprehensive blueprint for The Story Teller application, including the vision, foundational pillars, key personas, system architecture, and Minimum Testable Product (MTP) scope.

## 1 · North‑Star Vision

Create a fully AI‑native, multimodal storytelling factory where a user (or team) can co‑build entire universes, experience them as an interactive audiobook / CYOA game, and publish the results in any medium (web, PDF/e‑book, podcast, YouTube, etc.). AI is the director, narrator, continuity editor, artist, and producer.

## 2 · Foundational Pillars

1. **Schema‑First** – strict JSON‑schema validation gates every write.
2. **AI‑First** – Claude ➜ GPT‑4o ➜ validator ➜ DB for every creative action.
3. **Multimodal** – text, image, audio, video treated as linked first‑class assets.
4. **Publish‑Ready** – one‑click export pipelines for PDF/ePub, audio, video.
5. **Data Islands** – per‑user MongoDB DBs; optional S3 bucket per user for large assets.
6. **Observable & Documented** – structured logs, devlogs, docs, open‑telemetry hooks.

## 3 · Personas & Prime Use‑Cases

| Persona | Core Goal | Critical Features |
|---------|-----------|-------------------|
| **Solo Author** | Draft novels w/ AI, auto‑illustrate, publish to Kindle/Audible | Schema IDE, AI co‑writer, image gen, PDF/ePub, audiobook wizard |
| **GM / DM** | Build campaign world, run narrated sessions | World dashboard, real‑time Storyteller runner, TTS, choice engine |
| **Multimedia Creator** | Turn stories into short cinematic videos | Image + video gen UI, script‑to‑scene packager, YouTube exporter |
| **Educator** | Interactive branching audiobooks for lessons | Branch logic editor, timeline visualiser, classroom mode, analytics |

## 4 · System Modules ► Sub‑Modules & Duties

### 4.1 Frontend (Next.js)

- **Dashboard**
  - World list & create wizard
  - Quick stats (chapters, media assets, publish status)
- **Schema IDE / Editor**
  - Split‑pane: Markdown, Metadata JSON, Live Preview
  - AI Generate / Rewrite / Summarise buttons
- **Storyteller Runner**
  - Audio playback bar
  - Choice buttons → WebSocket events
  - Session log (decisions & consequences)
- **Timeline & Graph Viz**
  - Vis‑Timeline horizontal scroll view
  - Relationship force‑graph (characters ⇆ items ⇆ events)
- **Publishing Wizard**
  - Step 1: Select format(s)
  - Step 2: Configure layout/theme/voices
  - Step 3: Optional media inclusion
  - Step 4: Generate & download / push to service

### 4.2 API Layer (Next.js routes)

- **/api/auth** – NextAuth (JWT w/ key rotation)
- **/api/meta** – returns enumerations & schema refs (for forms)
- **/api/stories**
  - `GET /:id/passages` – paginated
  - `POST /:id/passages` – body `{markdown, metadata}` → validate → save
- **/api/ai**
  - `POST /draft` – body `{prompt, schema}`
  - `POST /rewrite` – body `{passageId, style, instructions}`
- **/api/media**
  - `POST /image` – `{prompt}` ➜ DALL·E
  - `POST /tts` – `{text, voice}` ➜ ElevenLabs
- **/api/publish**
  - `POST /pdf` – `{storyId, options}`
  - `POST /audiobook` – `{storyId, voices}`

### 4.3 MCP Micro‑Services (NestJS)

| Service | Purpose |
|---------|---------|
| **Structure‑Smith** | Claude 3 ↔ schema compliance & outline generation |
| **Prose‑Crafter** | GPT‑4o / OpenAI for rich prose & dialogue |
| **EverArt** | Style‑consistent prompt expansion for images |
| **Seq‑Think** | Long‑horizon planning, quest logic, puzzle checks |

## 5 · Technology Stack Matrix

| Concern | Package | Notes |
|---------|---------|-------|
| Validation | **Ajv** via `@ajv/compiled` | Pre‑compile schemas for perf |
| State Mgmt | **Zustand** | Minimal global store |
| Styling | **Tailwind + shadcn/ui** | Dark/light theme tokens |
| Data Layer | **MongoDB + Mongoose** | Multi‑tenant via db name prefix |
| Job Queue | **BullMQ + Redis** | Offload media generation |
| Telemetry | **OpenTelemetry → Grafana** | Traces CLI & web |
| CI | **GitHub Actions** | Lint, test, build, e2e → preview URL |

## 6 · Minimum Testable Product (MTP) — *User Stories & AC*

### Epic E0 – Author can create & AI‑generate a passage

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| **US‑E0‑01** | As an authenticated user, I can open editor and load sample story | Default Shadow Team story appears; content & metadata render |
| **US‑E0‑02** | I click **Generate Draft** to have AI write a new passage | API returns 200 with markdown + metadata; UI inserts both |
| **US‑E0‑03** | If AI returns invalid metadata, I get a clear error and nothing is saved | Validation error toast; passage list unchanged |

### Epic E1 – Schema enforcement & DB isolation

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| **US‑E1‑01** | My data is stored in a personal DB | MongoDB deployments show `{userId}_stories` database |
| **US‑E1‑02** | Invalid direct API calls are rejected | Ajv returns 400 & error list |

### Epic E2 – Importer & Seed

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| **US‑E2‑01** | On first login, Shadow Team Chronicles is preloaded | CLI seed runs on `npm run dev`; DB contains sample docs |

## 7 · Phased Road‑map (Detail)

1. **Phase 1 – Interactive Runner**
   - WebSocket channel `/ws/session/:sessionId`
   - Choice → AI → new passage → broadcast to participants
   - ElevenLabs streaming TTS
2. **Phase 2 – Media Layer**
   - `/api/media/image` & `/api/media/video` workers
   - Asset gallery component with tagging & drag‑drop into passages
3. **Phase 3 – Publishing Wizard**
   - `react-pdf` doc template module
   - `epub-gen` wrapper
   - Audiobook builder (FFmpeg concat + chapter metadata)
4. **Phase 4 – Advanced MCP**
   - Vector store for long‑term memory (Weaviate)
   - Style vectors for consistent art prompts (EverArt)
5. **Phase 5 – Mobile & Plugins**
   - Expo React Native app (runner + editor)
   - Plugin SDK: `window.StoryTeller.registerPlugin()`

## 8 · Data Model Cheat‑Sheet

```ts
World {
  _id, userId, name, description,
  settings: { genre, tone, rules },
  media: [AssetId]
}
Story {
  _id, worldId, title, status, synopsis,
  timelineRefStart, timelineRefEnd,
  coverImageId
}
Passage {
  _id, storyId, order,
  markdown, metadata: MetadataSchema,
  media: [AssetId],
  createdAt, updatedAt
}
```

## 9 · AI Pipeline (Sequence)

1. **Client** sends `prompt + context` to `/api/ai/draft`  ➜
2. **Next.js Route** builds MCP request ➜
3. **Structure‑Smith** (Claude) returns JSON outline ➜
4. **Prose‑Crafter** (GPT‑4o) fills prose ➜
5. **Validator** (Ajv) checks metadata ➜
6. **DB Insert**; response to client.

## 10 · Next Actions for the Team

1. **Lock MTP scope** – confirm stories & AC above.
2. **Create tickets** in GitHub Projects → E0/E1/E2 user stories.
3. **Set up dual MongoDB clients** & Ajv validator middleware.
4. **Stub AI route** calling mock Claude/GPT until API keys set.
5. **Build editor skeleton** with markdown + metadata preview.

> *Once MTP passes Cypress tests, we move to Phase 1.*

## Relation to Other Documentation

This blueprint relates to:
- **Project Requirements**: Overall project specifications
- **Feature Catalogue**: Detailed feature descriptions
- **Project Status**: Current implementation status
- **Project Roadmap**: Timeline for implementation
