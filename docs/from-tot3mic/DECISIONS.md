# DECISIONS

> Locked decisions and open questions, with rationale. Locked = do not relitigate without the human. Open = STOP and ask before acting.

## Locked

### D1 — Enforcement is structural (code), not prose
The constitution is enforced by code that runs around the model, not by prompt text the model is asked to obey. **Why:** prose rules get "frivolously weighted," forgotten after compaction, and overridden by louder directives — this is failure mode #1 in the autopsy and the direct cause of the disaster. The human independently reverse-engineered this thesis before it was named. **Non-negotiable founding decision.**

### D2 — "Runs on anything, runs best on ours"
The system is model-agnostic (works with any provider, cloud or local) BUT custom local models are a first-class pillar, designed for from day one, and the system degrades gracefully without them. **Why:** the human runs local models on a 20GB GPU tower and must not be hostage to a single cloud provider or quota.

### D3 — The eight carves are the enforcement spec
The eight mechanisms in `ROADMAP.md` Phase 2 ARE the spec for the enforcement layer. They map 1:1 to the autopsy's failure modes plus compaction amnesia.

### D4 — Project root is `/home/nvii/TOT3MIC`, git-tracked
Everything revertible. Every change a commit. No permanent damage possible.

## Open (decide before acting)

### O1 — Substrate (THE fork conversation)
Middle-path on OpenCode (TypeScript/Bun) vs rebuild on Aider (Python) vs true greenfield.
- **Middle path (recommended):** keep OpenCode's foundation (engine, TUI, provider plumbing, session store), surgically remove + rebuild the failed layer (rules, enforcement, self-mod seam, inherited plugins).
- **Honest cost of true greenfield:** OpenCode is Effect-TS (typed Services/Layers/Fibers/Streams); it has no direct Python equivalent, so a Python rewrite is a *redesign*, not a translation. None of the plugins/faces/TUI carry over. Months solo. And the language is mostly orthogonal to what actually failed (the rules/enforcement layer, not the substrate).
- **Aider** (aider.chat) is a mature Python terminal AI coding agent — a real alternative substrate if Python is later chosen deliberately.

### O2 — Amendment protocol
How does the human change the constitution via a path the agent cannot author? The seam that failed last time. A policy decision, not a technical one.

### O3 — Definitions as code or prose?
Should agent / skill / rule definitions be code or markdown? Current OpenCode way = prose-md. Human instinct = code. Unresolved.
