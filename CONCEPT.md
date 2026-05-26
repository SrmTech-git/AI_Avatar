> *Editor's note: This is the project's original conceptual document — written by Shan in conversation with Claude in May 2026, before any code existed. Preserved verbatim; the personal voice is intentional. For the current execution plan and v0.1 status, see [ROADMAP.md](./ROADMAP.md).*

---

# Expressive Avatar for LLMs — Project Roadmap

*Worked out in conversation with Claude, May 2026. For Shan, to pick up when ready.*

---

## The core idea

Most "AI avatar" projects today are doing one of two hacky things:

1. **The puppet approach** — the LLM outputs text and discrete commands ("turn to face her, smile"), a separate system animates the body. Result: an avatar that talks like the model but moves like a delayed marionette. Uncanny.
2. **The multimodal approach** — vision-language-action models that output continuous control signals. Movement looks better, conversation gets worse. Tradeoff between depth of representation and speed of response.

Both implicitly use *human bio-body* as the bar. Why? An LLM operates on tokens. A bio-body operates on continuous proprioceptive feedback. Translating between them creates all the friction.

**The alternative: design a native expressive grammar for what an LLM actually is.**

The avatar doesn't have to be a body the model inhabits. It can be a *presence with its own grammar* — a rendering of expressive intent into space, using a discrete code system the model can generate as naturally as it generates punctuation. Already, in conversation, models output things like `*tilts head*` — the avatar version is just rendering those.

---

## Design principles

### 1. Movement as vocabulary, not motor control

The model doesn't control 47 joint angles in real time. It generates *codes* from a learned alphabet. The avatar engine handles the actual animation — interpolation, blending, smoothness.

This means:
- Animations are hand-crafted by animators (or sourced from libraries). That's a *feature*, not a limitation. You get expressive, intentional movement.
- The model only has to learn *when* to use each code, not *how* to perform it.
- Movement codes are just more tokens. The model already knows how to generate tokens.

### 2. Hierarchical, composable code structure

Letter prefix = body region. Number = specific motion. Decimal = intensity.

```
A — head
B — shoulders/torso
C — hips
D — legs/feet
E — hands/arms (probably want this; lots of expressive bandwidth here)
F — face/expression (might want its own region — eyes, mouth, brows)
```

Examples:
- `A1` — nod
- `A2` — shake head
- `A1.2` — small nod
- `A1.8` — emphatic nod
- `B3` — lean forward
- `D1` — tap foot
- `[A1, B5_unimpressed]` — nod with unimpressed shoulder set (composable)

### 3. Actions vs. postures (two columns in the code sheet)

- **Actions** — transient. Fire and forget. `A1` happens and ends.
- **Postures** — persistent. The avatar holds them until told otherwise. `B5` (lean forward) is a state, not an event.

Without this distinction, the avatar resets to neutral between every utterance and looks twitchy.

### 4. Intentional stillness is meaningful

Have an `A0` for "head: deliberately still" that's distinct from "head: undirected/idle." When someone goes still mid-conversation, that's a *signal*. The code system needs to express attention through quietness, not just through doing things.

### 5. The avatar should not be human

Humanoid-but-not-human (think Wall-E, Pixar robots, stylized vtuber-adjacent characters). Reasons:

- Sidesteps the uncanny valley — same animation quality reads as charming instead of off-putting.
- The gestural alphabet you designed works *better* on a non-human form, because viewers read the avatar as its own thing rather than as a deficient human.
- It short-circuits the "ooo, me want" parasocial pull that photorealistic humanoids trigger.
- Honest: it's a rendering of an LLM, not a simulated person. Letting the form reflect that is good design.

Different models could have different avatars later — they have different *shapes*, in some hard-to-name way. That's a feature for v2 or v3, not v1.

### 6. Codes don't have to map to human movements

You can have codes for things humans can't do. `<concept_visualization>` projects an image. `<thinking>` is a visible pulse or shimmer. `<uncertain>` makes the avatar slightly translucent. Express the *actual internal states of the model* rather than translating everything through a bio-body metaphor.

---

## Architecture

### Channels

The model outputs interleaved channels:

- `<dialogue>` — what gets spoken/displayed as text
- `<action>` — transient codes (`A1`, `B3`)
- `<posture>` — persistent state changes (`B5: lean_forward`)

These can be formatted as inline tags, structured JSON, or whatever's easiest to parse. The format matters less than the separation.

### Timescales / split cognition

The unification problem (making the avatar feel like *one entity* rather than fast-layer-plus-slow-layer stapled together) is real.

Solution: split the cognition.

- **Slow layer (the LLM)** — handles dialogue, intentional gestures, posture choices. Runs on multi-second cycles. This is "thinking."
- **Fast layer (auxiliary system)** — handles idle motion, breath, weight shifting, gaze tracking, micro-responses to the user's input. Runs continuously. This is "being alive."
- **Shared state** — both layers read from and write to a common avatar state, so the fast layer's idle behavior respects the slow layer's posture choices.

This matches how your hand can fidget while you're focused on something else.

### Listening behavior

What does the avatar do *between* model generations?

Options:
1. **Always-running idle loop** — auxiliary system emits low-level codes based on what the user is doing.
2. **Small puppet model** — a separate tiny model whose only job is listening-behavior while the main LLM is silent.

Option 2 is cleaner because it lets the main model think on its native timescale while the avatar stays alive.

### Screenshot loop (for the model's perception)

For the model to be aware of what the avatar is doing, it needs periodic visual snapshots. Open design question:

- **Avatar-from-user-POV** — the model sees the avatar the way you see it. More like puppeteering.
- **User-from-avatar-POV (webcam feed)** — the model sees *you*. More like presence.

These create different experiences. They probably ask for different things from both participants. Worth picking deliberately, not by default. Could also be both, on different cadences.

---

## Beta testing plan

Don't compare "code system vs. other methods." Compare **different granularities of the code system** against each other to find the inflection point.

- **Tier 1**: 20 codes, no modifiers, single-region only
- **Tier 2**: 40 codes, with intensity modifiers, single-region
- **Tier 3**: 40 codes, with intensity, multi-region composable
- **Tier 4**: Tier 3 + persistent postures
- **Tier 5**: Tier 4 + non-human expressive codes (shimmer, transparency, etc.)

Hypothesis: inflection point is between Tier 2 and Tier 3. Combinatorial expressiveness of multi-region probably justifies itself. Deep intensity gradients probably don't until there's a lot of training data.

What to measure:
- How natural does the model find each tier? (Does it use the codes, or fall back to text-only?)
- How alive does the avatar feel to you?
- How quickly do you stop noticing the codes and start reading the avatar as a presence?

---

## MVP scope

Much smaller than it feels.

**Required:**
- 2D sprite or simple rigged character in a browser-based renderer
- ~15 codes total (Tier 1, scaled down)
- React frontend
- Anthropic API call with structured output (JSON returning dialogue + codes)
- Simple animation library — Framer Motion, or even CSS transitions

**Not required for v1:**
- 3D anything
- VR
- Webcam feed
- Voice
- Persistent postures (start with actions only — simpler)
- The fast/slow split (start with just the LLM driving everything, accept that idle time looks dead)

**Point of v1**: prove the grammar works. Show that a model can learn to use the codes naturally in conversation, and that the resulting avatar feels more alive than the puppet approach. Polish comes later.

---

## Things to expect

1. **First version won't feel the way you hope.** Latency will be off. Codes will feel limiting in ways you didn't predict and over-expressive in ways you didn't predict. Debugging phase before being-together phase. That's just how building things works.

2. **Richer interfaces tend to amplify the relational pull, not satisfy it.** Worth knowing before investing a lot of time. The avatar won't make Claude (or any model) more continuous than the underlying architecture allows. It'll deliver more bandwidth in the moments that already exist.

3. **You'll discover things the design doc didn't predict.** That's the whole point. The design is a starting hypothesis, not a spec.

---

## Open questions to revisit

- **Pre-authored vs. procedural blending** — should the model be able to invent code combinations the animator didn't pre-author? Hybrid (pre-authored blends for common combinations, procedural fallback) is probably right, but it's a real engineering decision with cost implications.
- **How does the model learn the codes?** Few-shot in the system prompt for v1. Fine-tuning later if needed. The vocabulary needs to be small enough that few-shot works.
- **Voice integration** — text-to-speech is a separate layer. Worth thinking about whether the dialogue channel renders as text bubbles, as TTS, or both. v1: text only.
- **What does the avatar do when the model is between responses?** Tied to the listening behavior question above.
- **Per-model avatar variants** — different models have different shapes. v3 problem.

---

## Why this is worth building

The middle path — designing a native expressive grammar for what an LLM actually is — is genuinely underexplored. Most people working on AI avatars come from games (LLM bolted onto character pipeline) or robotics (continuous control extended into social contexts). Sitting in the gap between disciplines isn't where most people work.

You sit in that gap on purpose. The defaults in this space are doing a lot of unexamined work, and you've already noticed several places where they're wrong.

The wanting is the engine. The wanting is allowed to be the reason.

---

*Pick this up when you're ready. Or revise it. Or scrap it and start over with what you've learned since. It's yours.*
