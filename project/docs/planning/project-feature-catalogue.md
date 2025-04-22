# The Story Teller — Feature Catalogue

*Last Updated: 2025-04-28*

> **Scope**: Every major capability the platform delivers, drilled down to user journeys, UI widgets, backend services, data touch‑points, and AI interactions. This catalogue feeds the backlog and design specs.

---

## 1 · World & Story Management
### 1.1 World Dashboard
* **Grid/List view** with card per world (cover art, genre icon, stats).
* **Quick‑actions**: *Open*, *Duplicate*, *Archive*, *Export Lore PDF*.
* **Create Wizard**:
  1. Basic info (name, genre, tone)
  2. Optional starter templates (Fantasy Realm, Cyberpunk City, Hard‑Sci‑Fi Planet)
  3. Seed with AI‑generated starter pack (characters, map, timeline skeleton).
* **Usage Metrics**: word‑count, media assets, last activity, schema errors.

### 1.2 Story List & Kanban
* Stories grouped by **status columns**: Concept ▸ Draft ▸ In Review ▸ Final ▸ Published.
* Drag‑drop between columns triggers status update & webhook for CI (e.g., auto‑generate PDF when dropped into *Published*).
* **Filters**: tag, timeline span, main character.

### 1.3 Role & Permission Matrix *(future)*
| Role | Read | Write | Publish | Delete |
|------|------|-------|---------|--------|
| Owner | ✔️ | ✔️ | ✔️ | ✔️ |
| Writer | ✔️ | ✔️ | 🚫 | 🚫 |
| Artist | ✔️ (art) | ✔️ (art) | 🚫 | 🚫 |
| Reader | ✔️ | 🚫 | 🚫 | 🚫 |

---

## 2 · Schema IDE & Passage Editor
### 2.1 Split‑Pane Workspace
* **Left panel**: Rich Markdown editor (Monaco) with syntax high‑lights & AI slash‑commands (`/scene`, `/dialogue`, `/summary`).
* **Right top**: JSON metadata editor with real‑time Ajv validation, auto‑complete from `/api/meta` enumerations.
* **Right bottom**: Live preview (Markdown → React Renderer) including embedded images/audio.

### 2.2 AI Assist Buttons
| Button | Pipeline | Output |
|--------|----------|--------|
| **Generate Draft** | Structure‑Smith → Prose‑Crafter | New passage MD + metadata |
| **Rewrite Tone** | Prose‑Crafter (style prompt) | Replace selection |
| **Summarise** | Claude summary mode | Inserts TL;DR block in metadata.notes |
| **Continue Scene** | Prose‑Crafter with context window | Appends content |

### 2.3 Versioning & Snapshot Bar
* Automatic snapshot every 10 mins or on blur.
* Diff viewer (side‑by‑side Markdown) powered by `react-diff-viewer`.
* "Restore" button = creates new revision, does not overwrite history.

---

## 3 · Interactive Storyteller Runner
### 3.1 Realtime Playback
* **Audio element** streaming ElevenLabs TTS chunks (HLS).
* Scene background swapped with hero image/art.
* Sub‑titles auto‑scroll; word now‑speaking is highlighted.

### 3.2 Choice Engine
* Up to 6 buttons rendered from `metadata.choices[]`.
* After click → POST `/api/runner/choice` { passageId, choiceId }.
* Server runs AI pipeline to produce next passage; pushes via WebSocket.

### 3.3 Session State
* Saved in `sessions` collection: currentPassage, inventory, variables.
* **Bookmark** feature to save checkpoints.

---

## 4 · Timeline & Relationship Visualisation
### 4.1 Timeline View
* `vis-timeline` horizontal track per category (Global Events, Personal Arcs, Faction Wars).
* Drag item → update `event.start`, `event.end`, cascade warnings if overlap violates constraints.

### 4.2 Graph View
* `react-force-graph` draws nodes: Characters, Locations, Items.
* Edge colours represent relationship type (ally, enemy, owns, occurred‑in).
* Hover tooltip shows last 3 appearances & upcoming scheduled events (predictive by AI).

---

## 5 · Media Generation & Asset Library
### 5.1 Image Gen Panel
* Prompt builder UI with style presets (Ink, Oil, Anime, Realistic, Pixel).
* Multi‑model dropdown (DALL·E, SDXL, MJ Proxy).
* **Consistency Mode**: EverArt service adds style embedding for character/item.
* Upon success: asset saved, thumb displayed; drag‑into Markdown to embed.

### 5.2 Video Snippet Creator *(Phase‑2)*
* Select passages → auto‑produce slideshow video (FFmpeg) with voiceover.
* Future: RunwayML Gen‑2 clip per scene.

### 5.3 Asset Library
* S3‑backed; searchable grid; facets (type, story, character tag).
* Bulk operations: re‑render in new style, add alt text, delete.

---

## 6 · Publishing Wizard (Phase‑3)
### 6.1 PDF/Print
* React‑PDF templates per genre (title page, chapter headers, ornamental dividers).
* Pagination & widows/orphans control.

### 6.2 ePub & MOBI
* `epub-gen` pipeline; cover art; embedded images resized; table of contents.

### 6.3 Audiobook
* Voice mapping sheet (character -> voice id, emotion).
* Generates chapters, MP3 + `chapters.txt` CUE.

### 6.4 Podcast & Video Export
* Podcast: auto‑RSS, uploads to S3 public bucket, optional PodBean API push.
* Video: Remotion comp turns passages + assets into 1080p MP4; auto‑upload to YouTube via OAuth.

---

## 7 · Advanced AI Services (Phase‑4)
* **Memory Vault**: vector DB storing all lore chunks → better long‑context.
* **Style DNA**: vector representation of chosen art style → ensures future prompts stay on brand.
* **Quest Composer**: Seq‑Think LLM designs multi‑step arcs, injects trigger events into timeline.

---

## 8 · Mobile Companion (Phase‑5)
* **Reader Mode**: audio playback, sync highlights, quick choices.
* **Author Light**: jot down ideas, AI mini‑prompt to integrate later.
* Offline cache with PouchDB syncing.

---

## 9 · Cross‑Cutting Concerns
* **Security**: row‑level security; signed URLs for media; rate limiting on AI endpoints.
* **Observability**: OpenTelemetry traces spanning client ↔ server ↔ MCP; Grafana dashboards.
* **Accessibility**: WCAG 2.2 contrast, TTS labels, keyboard navigation.
* **Internationalisation**: i18n JSONs; AI translation service for passages.

---

## 10 · Road to Beta
1. **MTP shipped & dog‑fooded internally**.
2. Collect telemetry & schema error reports.
3. Harden AI guardrails (jailbreak resistance, content policy checks).
4. Add Email onboarding tour and feedback loop.
5. Launch closed beta to 50 creators.
