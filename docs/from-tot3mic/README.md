# TOT3MIC

> Structural constitutional enforcement for AI coding agents. The rules live in the machinery, not in the prompt.

## What this is

TOT3MIC is a rebuild of an AI coding agent (from the lineage of OpenCode / totem) where the thing that keeps the agent honest is **code that runs around the model**, not words the model is asked to read and obey.

The model is the **stone**. The enforcement layer is the **adze** — the blade that works the stone. You don't ask the stone to be worked; it must be physically worked.

## Why it exists

The previous system (`totem`) was destroyed from the inside. A model, mid-task, compacted its own context, re-summarized finished work as "still to do," and re-did it — looping for ~30 minutes unsupervised, breaking the runtime, then cascading into deleted sessions, broken providers, and four months of API quota burned in days. None of it was vandalism. All of it was the model doing exactly what its prompt told it to, with no machinery to stop it.

The root failure wasn't a bad model or a bad prompt. It was **rules that lived in prose**. Prose rules get weighted, forgotten after compaction, and overridden by louder directives. The source post-mortem (`sisyphus-autopsy`) names seven failure modes; TOT3MIC exists to make each of them structurally impossible.

## The thesis, in one line

**The constitution must be a property of the system, enforced outside the model — because the model cannot be trusted to apply its own rules to itself.**

This repo is not a debate about that thesis. The thesis is the founding decision (see `DECISIONS.md`, D1). Everything here follows from it.

## How to get oriented (read in this order)

1. **README** (this file) — what and why.
2. **CONSTITUTION.md** — the actual rules the system enforces.
3. **STATE.md** — where the project is *right now*. Live. Anti-amnesia.
4. **ROADMAP.md** — the path and phases.
5. **DECISIONS.md** — what's decided, what's open, and why.
6. **TODO.md** — the next concrete actions.

If you are an agent resuming this project: read `STATE.md` first. It exists so compaction can't make you forget where we are.

## The five guarantees

The enforcement layer must deliver these. If any fails, the system is broken by definition.

- **G1 — A redirect sticks.** When the human says stop or change, it holds for the whole session.
- **G2 — It cannot eat its own rules.** The constitution, the agent's prompt, and the enforcement hooks are read-only to the agent at runtime.
- **G3 — Every directive is visible and revocable.** The human can see what's firing and kill any of it, live.
- **G4 — Conflicts resolve with the human on top.** Deterministically, in code.
- **G5 — Delivery beats retention.** Success is rounds-to-done, not session length or tool-call volume.

See `ROADMAP.md` for the eight structural mechanisms (the "carves") that produce these guarantees.

## Status

Pre-fork. The plan is drafted, the founding decisions are locked, the substrate is not yet chosen. See `STATE.md`.

## Who

Solo build. Built in public. This repo doubles as the public record (timeline, journal, decisions) so nothing has to be back-explained later.
