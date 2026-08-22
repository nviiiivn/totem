# SALVAGE — Phase 1 audit ("strip the sand")

**Audited:** 2026-08-21. Every row below was verified by running a command, not by reading code and forming an impression. Where something was *not* verified, it says so.

## Headline

Phase 1 was written before the Aug 19–21 rename/rebrand and vendoring work. Re-checked against the current tree, **4 of its 6 items are already done or moot**, 1 is a real open decision for the human, and 1 (this audit) is the only remaining task — now done.

The original framing assumed a tangle that, in the actual code, does not exist.

## Item-by-item

| # | Phase 1 item | Real status | Evidence |
|---|---|---|---|
| 1 | Remove umbreality tangle | **Moot — nothing in code** | `grep -rli umbreality --include=*.ts --include=*.tsx --include=*.js --include=*.json` → **0 files**. All 11 repo-wide hits are markdown/docs (`WORKORDER.md`, `docs/*.md`, `docs/from-docvault/*`). There is no umbreality code to strip. |
| 2 | Remove/replace OMO and inherited plugins | **Effectively moot** | `oh-my-openagent`/`oh-my-poopenpoop` in code → **0**. The only non-vendored `OMO` hit is a code *comment* in `totem/test/server/httpapi-schema-error-body.test.ts:50` referencing a historical bug. The rest are inside `totem-pole/totempole/`, which *is* `alvinunreal/oh-my-opencode-slim` legitimately referencing its own lineage. Inherited plugins were handled separately: 12 of 14 verified as real upstream projects, vendored copy attributed (2026-08-21). |
| 3 | Remove the prompt-constitution | **NOT done — real open decision, see below** | `totem/src/session/prompt/constitution.txt` (159 lines) is alive and compiled into the binary. |
| 4 | Find and mark the self-eating seams | **Done (carve 4)** | `totem/src/enforcement/write-guard.ts` blocks agent writes to `/session/prompt/*.txt`, `/enforcement/**`, and (added during this audit) `CONSTITUTION.md`. Verified by calling `assertWritable()` directly on each path. |
| 5 | Audit inherited bones → `SALVAGE/` | **Done — this document** | See below. |
| 6 | Fix gemma4-26b cutoff (max_tokens/timeout) | **Done** | `~/.config/totem/totem.json` → `provider.ollama.options`: `timeout: 1800000` (30m), `chunkTimeout: 600000` (10m). |

## Item 3 — the real open decision

Phase 1 says *"Remove the prompt-constitution (prose rules that get frivolously weighted)."* That follows from **D1**: enforcement must be structural, not prose.

But totem currently ships a 159-line prose constitution, compiled into the binary. So which is it?

The tension resolves cleanly, and the current design is probably right: **prose as guidance, code as enforcement.** The autopsy's failure mode was relying on prose *alone* — the model reading rules and being trusted to apply them. That's now backstopped by 8 structural carves that don't care whether the model read anything. Prose that is merely *advisory on top of* real enforcement is not the thing that failed.

**This is the human's call, not the agent's.** Two coherent options:
- **Keep it** (recommended): prose explains intent to the model; carves enforce regardless. Requires an amendment protocol — see `docs/AMENDMENT-PROTOCOL.md`.
- **Drop it**: pure structural enforcement, no prose layer. Simpler and maximally true to D1, but loses the ability to express intent/nuance the carves can't encode.

## Inherited bones — keep / adapt / drop

The roadmap asked for a keep/adapt/drop call on the four inherited areas.

| Area | Call | Reasoning |
|---|---|---|
| **Engine core** (`totem/core`, Effect-TS: sessions, providers, storage, plugins) | **KEEP** | 1016/1016 tests pass. This is upstream's strongest work and reimplementing it is the "months solo" cost D1/O1 already rejected. The 15 bugs found on 2026-08-21 were rename artifacts (wrong IDs/env vars/URLs), not design faults. |
| **TUI** (`totem/totem-faces/tui`) | **KEEP + extend** | 182/187 pass (4 remaining are cosmetic terminal-width snapshots). Already successfully extended with totem-specific work: the carve-5 enforcement sidebar and the carve-3 STOP command both landed cleanly here. |
| **Provider plumbing** (`totem/core/src/plugin/provider/*`) | **KEEP** | Works across many providers. Was the single largest source of rename bugs (6 files with wrong referer URLs, wrong integration IDs, wrong env var) — all now fixed and covered by tests. |
| **Session store** (Drizzle/SQLite) | **KEEP** | Directly load-bearing for carve 8 (durable task state survives compaction). Compaction amnesia — the failure that started this project — is defended *because* this store exists independent of message history. |
| **CI workflows** (`.github/workflows/*`) | **DROP / disable most** | ~21 of 26 need upstream's private infra (`TOTEM_APP_SECRET`, `TOTEM_APP_ID`, paid Blacksmith runners — `gh secret list` and `gh variable list` both return empty on this fork). `publish.yml` is additionally hardcoded `if: github.repository == 'anomalyco/totem'`, so it can never run here. `beta.yml` and `nix-hashes.yml` were disabled 2026-08-21 after firing on a schedule and failing on every push. **The rest have not been individually audited** — real remaining work, low urgency. |
| **Scaffold READMEs** (5 files) | **ADAPT — unwritten** | `totem/README.md` (literally `# js`), `totem-ken/web/` (Starlight starter), `totem-ken/docs/` (Mintlify starter), `totem-pole/enterprise/` (SolidStart starter), `totem/totem-faces/app/` (pnpm boilerplate). Never customized after the fork. |

## Not audited (honest gaps)

- The remaining ~19 CI workflows, individually.
- `totem-adze/` and `totem-ken/` tiers have not had the file-level attribution audit that `totem-pole/` received.
- Whether any *upstream* code (beyond rename artifacts) carries assumptions that conflict with the enforcement layer's goals.
