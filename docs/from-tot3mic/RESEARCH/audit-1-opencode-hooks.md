# Audit 1 — opencode/totem source: do the 3 make-or-break hooks exist?

**Date:** 2026-07-28
**Source read:** tower `/home/nvii/AITPBACKUP/nvii/totemic/totem/` (the totem fork of opencode v1.17.10)
**Raw evidence pulled:** `/tmp/totem/audit1.txt` (local)
**Scope:** the three hooks the enforcement layer cannot do without — pre-tool veto, compaction re-injection, mid-stream cancel.

## VERDICT: all three EXIST. The substrate supports the enforcement layer.

### R1 — pre-tool-call veto (block/rewrite a tool before it runs): EXISTS
- Tools are "materialized" with permissions and "settled" through a core-owned registry hook.
  - `core/src/session/runner/llm.ts`: `tools.materialize(agent.info?.permissions)` → on each `tool-call` event, `toolMaterialization.settle({...})` runs BEFORE side effects (the `Stream.runForEach` block, ~lines 962–990).
  - The runner's own design comment (~line 797): **"Authorize and execute recorded local calls through a core-owned registry hook."**
- A full permission subsystem exists: `src/permission/` (evaluate.ts, index.ts), `Permission.ask(...)`, rulesets merged via `Permission.merge(agent.permission, permission)`.
- The GitLab-workflow path (`src/session/llm.ts` ~461–517) shows a working approval gate (`approvalHandler` → `perm.ask`) that blocks tool execution until the human approves.
- **⇒ A programmatic pre-tool veto = extending the permission ruleset / registry hook. The seam is there.**

### R3 — compaction hook (re-inject task-state after every compaction): EXISTS + structured
- `core/src/session/compaction.ts` — full implementation.
  - Publishes `SessionEvent.Compaction.Started` / `Compaction.Ended` events (= hookable).
  - Produces a STRUCTURED "anchored summary" from a fixed template: **Goal, Constraints & Preferences, Progress (Done / In Progress / Blocked), Key Decisions, Next Steps, Critical Context, Relevant Files.**
  - `buildPrompt` updates the summary each pass: "Preserve still-true details, remove stale details, merge in the new facts."
  - The compacted summary persists as a "compaction" message and is re-injected next turn (runner's `ContinueAfterCompaction` transition "rebuilds the request from compacted history").
- **⇒ Re-injection works.** NOTE: the user's disaster (compaction re-summarizing "steps still need doing" → re-doing them) is a **SUMMARY-QUALITY / DIRECTIVE problem, NOT a missing-hook problem.** Fix = control what the summary contains + durable state (R2) the summary cannot override.

### R5 — mid-stream cancel (kill an in-flight generation): EXISTS (native)
- `src/session/llm.ts`: every stream wraps an `AbortController`; `streamText({ abortSignal })`; release aborts (~lines 669–693).
- `core/src/session/execution.ts`: explicit `interrupt(sessionID)` entry point — "Interrupt active work owned by this process."
- `core/src/session/runner/llm.ts`: built on Effect Fibers + `Effect.uninterruptibleMask` + `FiberSet.clear`; explicit "Provider turn interrupted" / "Tool execution interrupted" handling.

## Bonus findings (relevant to other requirements)

- **R2 (durable state agent can't rewrite):** the system is EVENT-SOURCED (EventV2, projectors, migration named `event_sourced_session_input`). History is a projection of persisted events; the agent does NOT write events directly — the system does, through the tool registry. Durable state is architecturally first-class.
- **R6 (human channel the model can't talk over):** there's a `SessionInput` "steer" mechanism — user steering promoted INTO an active turn (`promoteSteers`), plus a queued-input channel. A human can interject mid-run.
- **Loop prevention (the user's EXACT failure):** the runner's own TODO list explicitly flags as NOT-YET-DONE (~line 781): **"Bound provider retries and repeated identical tool calls."** ⇒ The repeat-until-done disaster is a KNOWN GAP in a KNOWN PLACE. Fixable by us, not a mystery.
- **Revert:** `src/session/revert.ts` exists.
- **CAVEAT:** the session runner is mid-refactor (v1 → v2 rewrite, in progress). The design TODO list (`llm.ts` ~771–816) marks many items `[ ]` unchecked. Bones are good; parts unfinished.

## What this means for the substrate decision (O1)
All three make-or-break hooks EXIST in opencode/totem. **Greenfield is NOT required to get enforcement seams.** This points toward the **middle path** (fork, surgically extend/guard the existing machinery) over either greenfield (months wasted re-building seams that already exist) or a full rebrand (inherits the rot). **Decision NOT locked** — one more slice (how hard to bend these hooks to our rules) + user weigh-in.

## Open / next
- Verify ease of extension: can a plugin/hook veto tools + inject durable state + shape the compaction summary WITHOUT forking the runner core? (read the plugin/registry/tool interfaces)
- Audit aider (Python alt-substrate) for R3 in particular — but its priority just dropped, since opencode already has all three.
