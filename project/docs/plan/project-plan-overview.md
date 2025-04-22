# The Story Teller: Project Plan Overview

*Last Updated: 2025-04-28*

## Vision

**The StoryTeller** is a platform where AI doesn't just help — **AI is the co-creator**. It assists users in building entire story worlds, writing immersive and stylistically varied narratives, and generating rich multimedia (images, video, audio) that supports those worlds.

The platform uses a **feedback loop** between story content and structured metadata, ensuring AI never loses track of the world, characters, events, and timeline. This creates a fully AI-native, multimodal storytelling factory where users can co-build entire universes, experience them as interactive audiobooks or CYOA games, and publish the results in various media formats.

## Core Concept

**The StoryTeller is a real-time, schema-enforced, AI-orchestrated universe creator.** It combines writing, worldbuilding, illustration, audio, and branching interaction to deliver something more than a book, more than a game — a living, evolving **AI-powered narrative world**.

## Functional Overview

1. **World-Building Engine**
   * Users or AI create persistent universes: characters, lore, locations, tech, factions
   * Fully schema-driven and connected to central metadata repositories
   * AI enforces consistency and relationship tracking

2. **Narrative Development Lifecycle**
   * Each story has multiple parts and passages:
     * `concept` → `draft` → `final`
   * Each passage is written in Markdown with an attached `metadata.json`
   * AI validates, updates, and enriches schema data with each new passage

3. **Timeline & Event Engine**
   * Tracks in-universe chronology with branching potential
   * AI uses this to keep cause-and-effect chains intact
   * User choices or AI-generated outcomes update the master timeline

4. **AI-Orchestrated Storytelling Modes**
   * **Writer Mode**: Co-write with AI or solo, leveraging structured suggestions
   * **Reader Mode**: Explore AI-generated content as a guided experience
   * **Storyteller Mode**: AI acts as a dynamic narrator, giving choices and reacting in real time
   * **Interactive Audiobook Mode**: Text-to-speech with scene transitions, choices read aloud

5. **Multimodal Content Generation**
   * **Image Generation**:
     * Character portraits
     * Scene illustrations
     * Artifacts (weapons, maps, insignias)
   * **Video Snippets** (AI tools like RunwayML, Pika, or Sora-style in future):
     * Short cinematic story moments
     * Animated lore sequences
   * **Audio FX & Music**:
     * Ambient backgrounds for story segments
     * AI-generated voiceovers (e.g. ElevenLabs)

All media is linked directly to its corresponding passage, scene, or world object via metadata and ID references.

## Foundational Pillars

1. **Schema-First** – strict JSON-schema validation gates every write
2. **AI-First** – Claude ➜ GPT-4o ➜ validator ➜ DB for every creative action
3. **Multimodal** – text, image, audio, video treated as linked first-class assets
4. **Publish-Ready** – one-click export pipelines for PDF/ePub, audio, video
5. **Data Islands** – per-user MongoDB DBs; optional S3 bucket per user for large assets
6. **Observable & Documented** – structured logs, devlogs, docs, open-telemetry hooks

## System Architecture

### Frontend (Next.js)
* Modular world/story explorer
* Passage editor with live schema feedback
* Story runner with voice, images, and video snippets
* Choice engine with timeline-aware branching
* Media viewer/gallery per story world

### Backend (MongoDB)
* Multi-tenant structure:
  * `Users` → `Worlds` → `Stories` → `Passages`, `Characters`, `Events`, etc.
* Embedded JSON data using comprehensive schemas
* Hook system to update cross-linked elements automatically

### AI Layer
* **Claude** via MCP Services:
  * Structure, timeline logic, schema enforcement
* **OpenAI GPT**:
  * Prose generation, dialogue, variation
* **AI Image Tools** (via API integration):
  * DALLE, StabilityAI, Midjourney proxy, etc.
* **AI Video Tools** (eventual):
  * RunwayML, Pika, Sora (future-phase)
* **TTS Tools**:
  * ElevenLabs or Play.ht

## Creative Workflow Loop

`User or AI creates → AI validates → Metadata updates → Media generated → Story evolves → AI re-reads → Continues world/storyline`

## Shadow Team Chronicles (Flagship Narrative)

The Shadow Team Chronicles serves as our proof-of-concept implementation, demonstrating:
* The full passage lifecycle: from raw concept to AI-polished draft to finalized story prose
* Full schema binding — all metadata tied to the master timeline, characters, and world
* Media element attachment and generation for each segment
* Interactive storytelling capabilities with branching narratives

## Development Approach

The project follows a phased development approach, starting with the Minimum Testable Product (MTP) that focuses on core editor functionality, AI generation, and schema validation. Subsequent phases will implement the interactive storyteller runner, media generation, publishing capabilities, advanced AI features, and mobile support.

For detailed information about the development phases and timeline, please refer to the [Project Roadmap](../planning/project-roadmap.md) and [Project Blueprint](./project-blueprint.md).

## Relation to Other Documentation

This plan overview connects to:
- **Project Blueprint**: For detailed MTP specifications and phased roadmap
- **Project Milestones**: For specific development targets and deadlines
- **Requirements Documentation**: For detailed feature specifications
- **Status Documentation**: For current implementation status
