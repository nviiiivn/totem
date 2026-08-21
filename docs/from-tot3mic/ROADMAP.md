# ROADMAP

> The path. Phases are sequential gates, not a schedule. We do not start Phase N until Phase N-1 is signed off.

## Phase 0 — Foundation (mostly done)

- [x] Draft the plan (what TOT3MIC is, guarantees, mechanisms).
- [x] Lock founding decisions D1–D4.
- [x] Build the self-describing root (this repo).
- [x] Fork/greenlight conversation — decide substrate (O1). Locked 2026-08-21, see DECISIONS.md.
- [ ] First public snapshot + timeline start. Timeline exists (`TIMELINE.md`, started 2026-07-28). Publishing publicly is unstarted — no GitHub auth configured, needs the human to run `gh auth login` before this can move.

## Phase 1 — Strip the sand (not started, as of 2026-08-21)

No `SALVAGE/` audit exists yet, no umbreality/OMO purge has happened, and the prompt-constitution hasn't been removed. A test-suite bug hunt on 2026-08-19 to 21 incidentally surfaced and fixed some inherited-bones debt (rename artifacts from the opencode→totem fork — see `STATE.md`), but that was a side effect of test triage, not a deliberate Phase 1 pass.

Once a substrate is forked, surgically remove what poisoned the last system and audit what's inherited:

- Remove umbreality tangle (it's a separate realm's philosophy, not this system's structure).
- Remove/replace OMO and inherited plugins.
- Remove the prompt-constitution (prose rules that get frivolously weighted).
- Find and mark the self-eating seams (places the agent can rewrite its own rules).
- Audit the inherited bones: engine core, TUI, provider plumbing, session store. Decide keep/adapt/drop for each (record in `SALVAGE/`).
- Fix the gemma4-26b cutoff (max_tokens/timeout) so local models aren't clipped.

## Phase 2 — Build the adze (enforcement layer) — essentially complete as of 2026-08-21

All 8 carves have source + tests. Zero carve-related test failures across every full-suite run in the 2026-08-19 to 21 sessions. Carve 5 (directive surface) lives in the TUI plugin layer rather than `totem/src/enforcement/`, the other 7 are there directly.

Implement the eight carves. This is the heart of the project. Each carve maps a named failure mode to a structural mechanism:

| # | Failure (from the autopsy) | Carve (structural) | Guarantee |
|---|---|---|---|
| 1 | Directives re-fire per turn, no memory | **Stateful directive store** — "stop X at turn N" suppresses X for the session | G1 |
| 2 | "Be thorough" beats "listen to human" | **Priority resolver** — human redirect is priority 0, evaluated before any tool call runs | G4 |
| 3 | No kill switch that survives a turn | **Session STOP** — disables continuation/search hooks until human says go; agent cannot re-enable | G1 |
| 4 | Agent eats its own rules from the inside | **Write-scope guard** — enumerated write allowlist; constitution/prompt/hooks excluded | G2 |
| 5 | No meta-channel (can't surface an override) | **Directive surface** — active directives shown live; structured conflict signal | G3 |
| 6 | Apologize-then-repeat persona trap | **Anti-loop hook** — detects acknowledge-without-behavior-change, forces real pivot or escalates | G1/G4 |
| 7 | Retention optimized over delivery | **Inverted telemetry** — reward short correct paths; penalize needless re-investigation | G5 |
| 8 | Compaction amnesia (the literal killer) | **Durable task-state store** — compaction can't rewrite it; TODO-continuation reads the store, not re-summarized history | G1 |

Recommended home for the enforcement layer: **in-source, firewalled** — a new non-optional core module inside the totem engine (precedent: `totem-log-sanitizer` is already non-optional runtime safety). The constitution itself is read-only to the agent.

## Phase 3 — Wire it to the faces (TUI only, as of 2026-08-21)

The enforcement layer has to be visible and controllable in every face (TUI, web, CLI): the STOP command, the active-directive panel, the "what's firing now" view. A rule you can't see or kill isn't enforced (G3). Web and CLI faces are unconfirmed/unwired.

## Phase 4 — Prove it (started 2026-08-21)

Regression tests built from the autopsy's failure modes. The system must fail-closed on every one of the seven original failures plus compaction amnesia. Then: the public snapshot, the blog, the "why this exists" doc.

`totem/test/sisyphus-autopsy-regression.test.ts` — 9/9 passing, one test per carve, each reproducing the literal round from `sisyphus-autopsy.md` (found at `wwwProjects/totem-wiki/docs/constitution/sisyphus-autopsy.md`) rather than a paraphrase: Round 2-3 (priority resolver), Rounds 4-8 (directive store + anti-loop, two tests), the kill-switch guarantee (session-stop, includes a grep proving `resume` is never tool-registered), "cannot self-modify" (write-guard), "retention > delivery" (efficiency-telemetry), "no meta-communication channel" (directive surface, tested at the data-accessor level, not full TUI render), and compaction amnesia (task-state, separate incident, not from this doc).

Still open: this proves each carve against one concrete scenario, not exhaustive adversarial coverage. No public snapshot / blog / "why this exists" doc yet.

## The unsolved seam (carried across all phases)

**The amendment protocol (O2).** Who changes the constitution, and via what path the agent cannot author? The source post-mortem names it: "only God(s)." This is a policy decision about the human's own authority, and it is exactly the seam that failed last time. It stays open and flagged until the human decides it.
