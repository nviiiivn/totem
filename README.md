# Totem

**An AI coding agent whose rules live in the machinery, not the prompt.**

> **Demo-configured copy.** Every host, IP address, domain, username and credential in this repository is a placeholder: hosts are `demo-server` / `demo-laptop`, IPs are from the `192.0.2.0/24` documentation range (RFC 5737), domains are `example.com`, the user is `demo`. Nothing here points at a real machine or account. Replace the placeholders with your own values before relying on anything that talks to a network.

## What this is

Totem is a standalone fork of [OpenCode](https://github.com/anomalyco/opencode) (v1.17.10): a terminal (TUI) AI coding agent, plus a headless server, SDK, web/desktop front ends and a plugin system. It is renamed (`opencode` → `totem`), uses its own config and data paths, and does not need or talk to an OpenCode install.

What makes it different is an **enforcement layer**. Plain agents are told how to behave in their system prompt, and prompt rules get diluted, forgotten after context compaction, or overridden by louder instructions. Totem keeps the prompt-level rules (see [`CONSTITUTION.md`](CONSTITUTION.md)) but also enforces the critical ones in code that runs around the model:

| # | Failure mode | Structural fix (`totem/src/enforcement/`) |
|---|---|---|
| 1 | Directives re-fire every turn | `directive-store.ts`: "stop X" suppresses X for the rest of the session |
| 2 | "Be thorough" beats "listen to the human" | `priority-resolver.ts`: a human redirect is priority 0, evaluated before any tool call |
| 3 | No kill switch that survives a turn | `session-stop.ts`: STOP disables continuation hooks until the human says go |
| 4 | The agent can rewrite its own rules | `write-guard.ts`: the constitution, prompts and enforcement code are read-only to the agent |
| 5 | No way to see or cancel a directive | a TUI sidebar panel shows the active directives live (`totem-faces/tui/src/feature-plugins/sidebar/enforcement.tsx`) |
| 6 | Apologize-then-repeat loops | `anti-loop.ts`: detects acknowledgement without a change in behavior and forces a pivot |
| 7 | Rewarding long sessions over finished work | `efficiency-telemetry.ts`: rewards short correct paths, penalizes re-investigation |
| 8 | Compaction amnesia | `task-state.ts`: a durable task-state store that compaction cannot rewrite |
| 9 | Responses that break the constitution | `response-gate.ts` plus the `.totem/plugins/constitution-gate.ts` plugin |

`totem/test/sisyphus-autopsy-regression.test.ts` has one regression test per mechanism, each reproducing the incident that motivated it. More background is in [`docs/PROJECT.md`](docs/PROJECT.md), [`docs/ROADMAP.md`](docs/ROADMAP.md) and [`docs/DECISIONS.md`](docs/DECISIONS.md).

### Repository layout

| Path | What it is |
|---|---|
| `totem/` | The product: CLI/TUI (`totem/src`), core engine (`totem/core`), LLM layer, server, schema, the `cartridge` knowledge-packaging tool, and the front ends under `totem/totem-faces/` |
| `totem-adze/` | Build tooling, the JS SDK, the HTTP recorder used by tests, Storybook |
| `totem-ken/` | Documentation site and stats |
| `totem-pole/` | Plugins: vendored third-party plugins (see [`ATTRIBUTION.md`](ATTRIBUTION.md)) and the `lolcat` logo plugin |
| `.totem/` | This repo's own project config, agents, skills and plugins (loaded when you run totem inside the repo) |
| `examples/demo/` | Demo user config and environment file |

## Quick start (demo config)

Requirements: [Bun](https://bun.sh) 1.3.14 (see `packageManager` in `package.json`). Optional: [Ollama](https://ollama.com) on `localhost:11434` for a fully local setup.

```bash
# from the repository root
bun install

# Run the TUI with the demo config, without touching ~/.config/totem
TOTEM_CONFIG="$PWD/examples/nviiiivn/totem.example.jsonc" bun run dev
```

The demo config ([`examples/nviiiivn/totem.example.jsonc`](examples/nviiiivn/totem.example.jsonc)) defines three providers:

- `ollama-local`: Ollama on `localhost`. This one works as soon as you `ollama pull qwen3:8b`.
- `demo-server`: Ollama on `192.0.2.10`, a placeholder for a GPU box on your LAN. Change the IP to your own.
- `demo-cloud`: an OpenAI-compatible endpoint at `api.example.com` that reads its key from `DEMO_API_KEY`. Copy [`examples/demo/.env.example`](examples/demo/.env.example) to `.env` (git-ignored) and fill in real values.

To make it permanent, copy the file to `~/.config/totem/totem.jsonc` and edit it. Config, credentials and data live under `~/.config/totem/` and `~/.local/share/totem/`, separate from any OpenCode install.

Once built or installed:

```bash
totem             # start the TUI in the current project
totem run "..."   # run a one-shot prompt
totem providers   # configure API providers and credentials
totem --help      # full command reference
```

## Tests

Tests do not run from the repo root (a guard stops them). Run them per package, starting from the repository root:

```bash
(cd totem && bun test test/write-guard.test.ts test/sisyphus-autopsy-regression.test.ts)   # enforcement layer
(cd totem && bun test)            # full CLI/engine suite
(cd totem/core && bun test)
(cd totem/cartridge && bun test)  # tests that need a vision-capable Ollama skip when none is reachable
```

## Installing a release

`./install` downloads a release binary from GitHub. It defaults to the placeholder repo `nviiiivn/totem`; point it at wherever releases are actually published:

```bash
TOTEM_REPO=<owner>/<repo> ./install
./install --binary /path/to/totem   # or install a binary you built yourself
```

## License and attribution

MIT. See [`LICENSE`](LICENSE). Totem is forked from [anomalyco/opencode](https://github.com/anomalyco/opencode) (MIT), and the upstream copyright notice is kept. Vendored third-party plugins and skills keep their own licenses in their directories; [`ATTRIBUTION.md`](ATTRIBUTION.md) lists each one. [`CONTRIBUTING.md`](CONTRIBUTING.md) is inherited from upstream.
