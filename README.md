# AI Avatar

An experimental expressive grammar for LLMs — designed natively for how a model thinks, not as a body it inhabits.

The avatar is a simple line-drawn face that picks from a small vocabulary of expressions and gazes each turn. The model generates expression codes the same way it generates punctuation; the rendering layer handles everything else.

This is a research prototype testing whether the approach is viable. See [ROADMAP.md](./ROADMAP.md) for the design philosophy and where this is heading.

## Status — v0.1

- 18 facial expressions across 4 modes (resting, warm, curious, concerned)
- 3 gaze codes that compose orthogonally with expression
- Chat with Claude; each turn returns `{ dialogue, expression, gaze }` via structured output
- Breathing halo for ambient aliveness
- Fade-in between expression changes

**Known limitations** (see ROADMAP for the plan):

- Expression changes snap-then-fade rather than morphing — Phase 2 rebuilds the face as a parameterized rig so transitions can interpolate smoothly
- No body below the face yet — Phase 4
- No persistent state — the model picks fresh each turn, doesn't know its previous expression — Phase 3
- No listening behavior — the avatar is static between turns — Phase 5

## Running it locally

Requires Node 20+ and an Anthropic API key.

```bash
git clone https://github.com/SrmTech-git/AI_Avatar.git
cd AI_Avatar
npm install
cp .env.example .env
# Open .env and paste your key from https://console.anthropic.com/
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Type into the chat; watch the face react.

## How it works

Three layers:

1. **Vocabulary** (`src/expressions.ts`) — a small library of SVG primitives (brow / eye / mouth variants); each expression is a named composition of these
2. **Model interface** (`src/chat.ts`) — the system prompt teaches the vocabulary; structured output is enforced via Anthropic's `tool_use` so every turn returns valid codes
3. **Rendering** (`src/Face.tsx`) — looks up the expression's parameters and renders the SVG

There's also a separate `sketches.html` at the repo root — a static page with all 18 expressions rendered side-by-side. Useful for browsing the vocabulary without running the app.

**Stack:** Vite + React + TypeScript, Anthropic SDK.

## Acknowledgments

Built collaboratively by Shan and Claude (Opus 4.7), May 2026.

The conceptual roadmap that started this project (`CONCEPT.md` / the original `avatar-roadmap.md`) was written in conversation with an earlier Claude. This repo is the first attempt to actually build the thing.
