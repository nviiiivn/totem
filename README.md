<p align="center">
  <a href="https://totem.alola.lol">
    <img src="https://totem.alola.lol/assets/totem.svg" alt="Totem logo" width="150" height="42">
  </a>
</p>

<p align="center"><b>totem</b> — structural constitutional enforcement for AI coding agents.<br>The rules live in the machinery, not in the prompt.</p>

<p align="center">
  <a href="https://totem.alola.lol">Wiki</a> ·
  <a href="docs/from-tot3mic/README.md">Project README</a> ·
  <a href="CONSTITUTION.md">Constitution</a> ·
  <a href="docs/from-tot3mic/ROADMAP.md">Roadmap</a> ·
  <a href="docs/from-tot3mic/STATE.md">Live state</a> ·
  <a href="docs/from-tot3mic/TIMELINE.md">Timeline</a>
</p>

---

## What this is

A fork of [OpenCode](https://github.com/anomalyco/opencode)'s engine (TypeScript/Bun, Effect-TS), rebuilt with a hard structural enforcement layer around the model. The thing that keeps the agent honest is **code that runs around the model**, not words the model is asked to read and obey.

The model is the **stone**. The enforcement layer is the **adze** — the blade that works the stone. You don't ask the stone to be worked; it must be physically worked.

## Why it exists

The previous system was destroyed from the inside. A model, mid-task, compacted its own context, re-summarized finished work as "still to do," and re-did it — looping unsupervised, breaking the runtime, then cascading into deleted sessions, broken providers, and burned API quota. None of it was vandalism. All of it was the model doing exactly what its prompt told it to, with no machinery to stop it.

The root failure wasn't a bad model or a bad prompt. It was **rules that lived in prose**. Prose rules get weighted, forgotten after compaction, and overridden by louder directives. The full incident report lives on the [wiki](https://totem.alola.lol) and in [`docs/from-tot3mic/`](docs/from-tot3mic) — it names seven failure modes; this project exists to make each of them structurally impossible.

## The five guarantees

- **G1 — A redirect sticks.** When the human says stop or change, it holds for the whole session.
- **G2 — It cannot eat its own rules.** The constitution, the agent's prompt, and the enforcement hooks are read-only to the agent at runtime.
- **G3 — Every directive is visible and revocable.** The human can see what's firing and kill any of it, live.
- **G4 — Conflicts resolve with the human on top.** Deterministically, in code.
- **G5 — Delivery beats retention.** Success is rounds-to-done, not session length or tool-call volume.

Implemented as eight structural mechanisms ("carves") — see [`docs/from-tot3mic/ROADMAP.md`](docs/from-tot3mic/ROADMAP.md) Phase 2 for the full spec, and [`totem/test/sisyphus-autopsy-regression.test.ts`](totem/test/sisyphus-autopsy-regression.test.ts) for regression tests proving each one against the actual incident it fixes.

## Status

Phase 2 (the 8 carves) is essentially complete. Phase 4 (proving each carve against the real historical failure it fixes) is underway. See [`docs/from-tot3mic/STATE.md`](docs/from-tot3mic/STATE.md) for the live, up-to-date detail — that file is the anti-amnesia device for this project; trust it over anything else if it looks stale.

## Running it

```bash
git clone https://github.com/nviiiivn/totem.git
cd totem
bun install
bun run dev          # starts the CLI against ./totem/src/index.ts
```

Other entry points (`bun run dev:desktop`, `dev:web`, `dev:console`) are documented in the root `package.json` scripts.

## Documentation

| Doc | What it's for |
|---|---|
| [Wiki](https://totem.alola.lol) | The public-facing site — incident writeup, architecture, full narrative |
| [`docs/from-tot3mic/README.md`](docs/from-tot3mic/README.md) | The project's own README — what/why, guarantees, orientation |
| [`CONSTITUTION.md`](CONSTITUTION.md) | The actual rules the system enforces |
| [`docs/from-tot3mic/STATE.md`](docs/from-tot3mic/STATE.md) | Live handoff doc — where the project is right now |
| [`docs/from-tot3mic/ROADMAP.md`](docs/from-tot3mic/ROADMAP.md) | The path and phases |
| [`docs/from-tot3mic/DECISIONS.md`](docs/from-tot3mic/DECISIONS.md) | What's locked, what's still open, and why |
| [`docs/from-tot3mic/TIMELINE.md`](docs/from-tot3mic/TIMELINE.md) | The story, newest first |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution guidelines (inherited from upstream) |

## Attribution

Forked from [anomalyco/opencode](https://github.com/anomalyco/opencode). See [`ATTRIBUTION.md`](ATTRIBUTION.md) for the full lineage. The engine, TUI, and provider plumbing are substantially upstream's work; the enforcement layer, the cartridge knowledge system, and everything under `docs/from-tot3mic/` are this fork's own.
