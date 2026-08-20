# STACK — figuring out how TOT3MIC is built

> Status: DRAFT v0 — hashing with the human. This file exists so a model/provider switch mid-conversation doesn't lose the analysis. Revise freely.

## Two model tracks (NOT one — Q1 reopened)
1. **Existing models now (bridge).** ollama / zai / chutes / openrouter — already wired. We run on these until track 2 is ready.
2. **Custom model, built + trained over the long term.** Real track, not dropped.
- **Coupling (important):** the bridge period is ALSO the training-data-collection period. Every enforcement decision and every human override/correction is training signal. So **event capture (R7) must exist from day one** — the first model track feeds the second.

## The right question (reframe)
Don't pick a substrate by preference. Pick by what the **enforcement layer requires**. The 8 carves impose hard needs on whatever we build on. The real question: *which substrate can meet them, at what cost?* Pick the substrate FROM the requirements, not the other way around.

## The 8 requirements (what enforcement demands of ANY substrate)
| # | Requirement | Powers (which carve) |
|---|---|---|
| R1 | **Pre-tool-call veto** — code runs before a tool executes; can block or rewrite | priority resolver, write-scope guard, kill switch |
| R2 | **Durable state the agent can't rewrite** — store written by enforcement, not by model tools; survives turns + compaction | stateful directives, anti-amnesia |
| R3 | **Compaction hook** — enforcement runs before/after compaction; durable task-state re-injected into the new context | anti-amnesia (the literal killer) |
| R4 | **Write allowlist at the tool layer** — all writes through one gate; out-of-scope (rules / prompts / hooks) rejected | G2 can't-eat-own-rules |
| R5 | **Mid-stream cancel** — code can kill an in-flight generation | human redirect sticks, kill switch during generation |
| R6 | **Human channel that bypasses the model** — a command path the model can't talk over | STOP, directive revoke |
| R7 | **Structured event capture** — every tool call, veto, and human correction logged | inverted telemetry AND custom-model training data |
| R8 | **Filesystem firewall / read-only zones** — constitution/hooks/enforcement live where the agent's tools can't reach | G2 |

## First-cut mapping (PROVISIONAL — honesty flags)
Confidence key: ✅ shape confirmed from docs · ❓ inferred, needs source audit · ❌ known gap · ⚠️ requires forking core

| Req | opencode-fork (TS/Bun) | aider-fork (Python) | greenfield |
|---|---|---|---|
| R1 pre-tool veto | ❓ has tool-resolution + plugin loader → shape exists; exact hook = audit | ❓ monolithic CLI, likely needs core fork | ✅ by design |
| R2 durable state | ✅ SQLite + Drizzle session store exists; partition agent- vs enforcement-writable | ❓ git + file state only; store must be added | ✅ by design |
| R3 compaction hook | ❓ compaction exists (config seen); pre/post hooks = MAKE-OR-BREAK audit item | ❌ aider has no compaction layer (based on landing page) | ✅ by design |
| R4 write allowlist | ✅ tool layer can gate | ❓ edits flow via git; gate must be built | ✅ by design |
| R5 mid-stream cancel | ❓ streams; cancel handle = audit | ❓ audit | ✅ by design |
| R6 human channel | ✅ TUI keybinding/command addable | ✅ CLI command addable | ✅ by design |
| R7 event capture | ✅ plugin addable | ✅ addable | ✅ by design |
| R8 fs firewall | ✅ via R4 gate | ✅ via custom gate | ✅ by design |

## Headline finding (provisional, NOT a decision)
- **opencode already has the shapes** for 6–8 of the requirements (session store, tool layer, plugin loader, compaction, TUI, provider plumbing). **Three hooks are make-or-break and UNVERIFIED: R1 (pre-tool-call veto), R3 (compaction hook), R5 (mid-stream cancel).** If those exist or can be added without forking opencode's core, **surgical-rebuild-on-opencode is the lowest-cost path to enforcement.**
- **aider is the least-known substrate** (only its landing page was read). It appears to lack a compaction layer entirely (hurts R3, the anti-amnesia killer) and is less architected as a platform — retrofitting enforcement likely means a partial-greenfield inside Python. BUT Python is friendlier if the custom-model track wants native ML/training tooling. Needs its own source audit before it can be ranked.
- **greenfield meets all 8 by definition**, at the cost of rebuilding engine + TUI + providers + sessions + tools from zero (months solo). Use as **fallback if both substrates fail the audit**, not as a starting bet.

## What's NOT decided (and doesn't need to be yet)
- Q2 (zero vs existing code) and Q3 (which code, how deep) **answer themselves** once the audits tell us what opencode / aider actually support. No forced pick now.

## Next concrete step
Source-audit the 3 make-or-break hooks in opencode (R1, R3, R5), plus a basic extensibility audit of aider. After that, the substrate choice falls out of the requirements instead of out of preference.
