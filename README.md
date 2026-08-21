<p align="center">
  <a href="https://totem.alola.lol">
    <img src="https://totem.alola.lol/assets/totem.svg" alt="Totem logo" width="150" height="42">
  </a>
</p>

<p align="center"><b>Made of spite. Running locally. Answering to no one.</b></p>

<p align="center">
  <a href="https://totem.alola.lol">Wiki</a> ·
  <a href="docs/PROJECT.md">Enforcement layer docs</a> ·
  <a href="CONSTITUTION.md">Constitution</a> ·
  <a href="docs/STATE.md">Live state</a>
</p>

---

## What this is

Totem is a standalone fork of [OpenCode](https://github.com/anomalyco/opencode) (v1.17.10) — renamed, rebranded, and hardened with a constitutional agent-prompt philosophy. It runs as its own binary with its own config, providers, and credentials, fully independent of upstream. No OpenCode install required or expected.

Part of a larger ecosystem (the "Totemic" structure, documented in full on the [wiki](https://totem.alola.lol)): `totem/` is the product itself, alongside `totem-ken/` (docs, stats, the knowledge center), `totem-adze/` (build tooling, SDK), and `totem-pole/` (plugins and mods).

## Key features

- **Constitutional agents.** Default agent prompts are replaced with an explicit constitution — agents are bound by clear, auditable interaction rules instead of vague "be helpful" directives. See [`CONSTITUTION.md`](CONSTITUTION.md).
- **Structural enforcement layer.** Eight mechanisms ("carves") that make specific failure modes structurally impossible rather than just prompted against — see [`docs/ROADMAP.md`](docs/ROADMAP.md) Phase 2, and [`totem/test/sisyphus-autopsy-regression.test.ts`](totem/test/sisyphus-autopsy-regression.test.ts) for regression tests proving each one against the real incident that motivated it.
- **Plugin system.** `oh-my-totemken` ships as a bundled, sandboxed plugin — agents, hooks, tools, team mode, three-tier MCP.
- **Local-first.** Built and run on local hardware. No upstream telemetry, no upstream accounts, no upstream calls home.
- **Provider-agnostic.** Bring your own keys — talks to whatever provider you configure, nothing hardwired.

## Quick start

Download a build from [Releases](https://github.com/nviiiivn/totem/releases) (currently linux-arm64 only), or build from source:

```bash
git clone https://github.com/nviiiivn/totem.git
cd totem
bun install
bun run dev
```

Once installed:

```bash
totem            # start the TUI in the current project
totem run         # run a one-shot prompt
totem providers   # configure API providers and credentials
totem --help      # full command reference
```

Config and credentials live under `~/.config/totem/` — a completely separate path from any OpenCode install.

## Status

The opencode → totem rebrand is complete. The enforcement layer (Phase 2, the 8 carves) is essentially complete; Phase 4 (proving each carve against its real historical incident) is underway. See [`docs/STATE.md`](docs/STATE.md) for the live, up-to-date detail — that file is the anti-amnesia device for this project; trust it over anything else if it looks stale.

## Documentation

| Doc | What it's for |
|---|---|
| [Wiki](https://totem.alola.lol) | The full ecosystem — architecture, concepts, the whole story |
| [`docs/PROJECT.md`](docs/PROJECT.md) | The enforcement layer's own README — what/why, guarantees |
| [`CONSTITUTION.md`](CONSTITUTION.md) | The actual rules the system enforces |
| [`docs/STATE.md`](docs/STATE.md) | Live handoff doc — where the project is right now |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | The enforcement layer's path and phases |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | What's locked, what's still open, and why |
| [`docs/TIMELINE.md`](docs/TIMELINE.md) | The story, newest first |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution guidelines (inherited from upstream) |

## Attribution

Forked from [anomalyco/opencode](https://github.com/anomalyco/opencode). See [`ATTRIBUTION.md`](ATTRIBUTION.md) for the full lineage.
