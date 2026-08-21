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

## Locked (continued)

### O1 — Substrate: middle path on OpenCode (TypeScript/Bun) — locked 2026-08-21
Decided by what was actually built, not a fresh deliberation: `totem`/`tot3m` kept OpenCode's foundation (Effect-TS engine, TUI, provider plumbing, session store) and surgically rebuilt the failed layer on top (the 8 carves — see Phase 2). True greenfield (Aider/Python or otherwise) was never pursued; the language was correctly identified up front as orthogonal to what actually failed. Formally locking the decision the codebase already reflects.

## Open (decide before acting)

### O2 — Amendment protocol
How does the human change the constitution via a path the agent cannot author? The seam that failed last time. A policy decision, not a technical one.

### O3 — Definitions as code or prose?
Should agent / skill / rule definitions be code or markdown? Current OpenCode way = prose-md. Human instinct = code. Unresolved.
