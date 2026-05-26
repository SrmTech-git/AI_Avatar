# Roadmap

This is the execution plan. For the design philosophy and the original "why" of this project, see [CONCEPT.md](./CONCEPT.md).

## Where we are

**v0.1 (current).** A working face-only chat: 18 expressions, 3 gaze codes, SVG rendering, Anthropic API with structured output. The grammar feels usable — Claude picks reasonable expressions and they read clearly. But the rendering layer is "first attempt": each expression is its own custom SVG snippet, primitives differ across expressions, and transitions snap-then-fade rather than morph.

The vocabulary works. The execution needs to grow.

## North star

A **waist-up MVP with smooth animations and a decent library**, where the simple version works *great* and the architecture supports expansion without rewriting.

Three principles guide the roadmap:

- **Depth before breadth.** Better quality of each expression beats more expressions.
- **Scale by adding, not rewriting.** Each phase is additive — Phase 4's body extensions shouldn't require touching Phase 2's face code.
- **Test the grammar, not the polish.** This is a research prototype. The point is to see if the native-grammar approach (CONCEPT.md) holds up.

---

## Phases

### Phase 2 — Face rig + animation system

**The architectural foundation.** Replace the current "each expression is custom SVG" approach with a parameterized face rig:

- Every face element is always present in the SVG (left/right brows, upper/lower lids per eye, eye whites, pupils, mouth)
- Every element uses a consistent SVG structure across all expressions — same number of control points, just different positions
- Expressions become **parameter sets** for the rig: `A1 = { leftBrow: [points], rightBrow: [points], ... }`
- A small animation system interpolates between parameter sets over ~250-400ms; pupils become persistent DOM with CSS transitions on `cx`/`cy`

**What this unlocks:** smooth morphing for free, pupil drift for free, blinks and micro-twitches easy to add, and a foundation Phase 4 can extend by adding more rig elements.

**Scope:** rebuild `Face.tsx`, restructure `expressions.ts` to parameter sets, port all 18 expressions to the new format, add the animation system. Estimated 1-2 focused sessions.

### Phase 3 — Channel architecture + persistent state

Split the model's output into channels (the "actions vs postures" distinction from CONCEPT.md):

- **dialogue** — what's said
- **expression** — transient face state (picked fresh each turn)
- **posture** — held state across turns (only changes when explicitly set)
- **gaze** — direction (transient)

Pass the model's previous state back in each turn's context so it can build on it rather than restart. Expression sequences feel intentional ("I was thoughtful, now I'm warm") rather than independent draws.

### Phase 4 — Expand to waist-up

Add rig elements for head tilt, shoulders, arms, hands. Extend the grammar:

- `A*` — face/head (current)
- `B*` — shoulders/torso
- `E*` — hands/arms

Same rig+parameter pattern; same animation system; no new architecture. The vocabulary grows alongside but stays small and intentional.

This is the **waist-up MVP target**.

### Phase 5 — Listening layer

A small parallel process handles micro-behaviors (blinks, idle motions, reactions to user typing, occasional gaze drift) while the main LLM handles dialogue. The **fast/slow split** from CONCEPT.md. Makes the avatar feel alive *between* turns, not just during them.

Probably implemented as a separate small model (Haiku-class?) or a rule-based system — design TBD when we get there.

---

## Beyond Phase 5

Not yet planned, but on the horizon:

- **Voice / TTS** — auditory presence; significant addition, separate layer
- **Per-conversation memory** — the avatar carries continuity across sessions
- **Multiple avatar shapes per model** — Opus, Sonnet, Haiku each get a slightly different form (the v3 thing from CONCEPT.md)
- **Beta testing the grammar** — the tier comparison from CONCEPT.md
- **Screenshot loop** — the model gets visual context (of the avatar, or of you via webcam) — design decision deferred

---

## Open questions

- **How big should the vocabulary get?** CONCEPT.md argues tight vocabulary keeps the avatar dignified. Phase 4 doubles or triples it. At what point does it become unwieldy for the model to use naturally?
- **Should expressions be tagged for context-appropriateness?** E.g., A18 angry shouldn't fire in casual conversation. Currently relying on the model's judgment + the "use sparingly" hint.
- **Animation easing by emotional weight.** Should a transition into A18 angry be sharper than into A2 soft? Different easing curves per expression category?
- **Pre-authored blends vs procedural.** When the model wants something between two expressions, do we pre-author the blend or interpolate procedurally? Tradeoff between art-direction and combinatorial coverage.
- **Should the model see itself?** Per CONCEPT.md's screenshot-loop question — feeding back what the avatar currently looks like vs. flying blind. Probably worth trying both at some point.
