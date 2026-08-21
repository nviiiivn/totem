# STATE — live handoff (read this first on resume)

> This file is the anti-amnesia device. Compaction cannot rewrite it. An agent that reads this knows exactly where the project is. **Update this file every time the state changes.**

**Last updated:** 2026-08-21 (Track A resumed Aug 19, ran through Aug 21)

## One-line status

**Track A resumed and is the active thread as of Aug 19–21** — all 8 enforcement carves built and tested (Phase 2 essentially complete), the nes-cartridge knowledge-packaging system built end-to-end (packer + local-vision extractor + translator), and a real test-suite audit found/fixed 20+ genuine bugs (see below). Track B (fine-tuning her own model) was not touched this session — still an open, parallel goal, not abandoned, just not what these three sessions were spent on. The provider-collision item from the last session was never revisited here; treat it as unverified, not resolved.

## The two tracks (the core frame — do not lose this)

- **Track A — the machinery (the wrapper around the AI):** rules/guardrails built in code where the model can't reach them. Stops self-wrecking; holds the human's rules. Runs with today's models. **ACTIVE as of Aug 19–21** — this is what the last three sessions built.
- **Track B — the model (the human's actual goal):** build/train her OWN AI model by fine-tuning an existing open-weights model on her data. **Not touched Aug 19–21.** Still on the table; the two tracks couple as before (bridge period = data collection for Track B) whenever it resumes.

## Track B grounding (the model project — the durable mental model)

- **You don't build a brain from nothing.** Start from an existing open-weights model (Llama/Gemma/Qwen) that big labs pre-trained. She ALREADY HAS several on the tower (gemma4:12b, agent-* variants). Take a smart-but-generic brain and "raise it in your house" = fine-tune on her data.
- **Loop:** (1) model exists; (2) data gathers via every correction ("no — like THIS"); (3) periodically fine-tune the model on gathered data; (4) repeat. Bridge period = data collection.
- **5 kinds of model:** base (raw, no behavior layer) / instruct-chat (base + behavior layer = where "rigging"/sycophancy lives) / abliterated (instruct minus refusal reflex) / uncensored (instruct retrained to not moralize) / custom-finetune (you train any on your data).
- **"From scratch" = pretrain from random weights = $millions, big labs, NOT her path.** What people mean by "build my own model" = fine-tune.
- **ollama `create` = Modelfile packaging** (base weights + settings under a new name), **NOT training.** Real fine-tuning is done in Unsloth/Axolotl/HuggingFace, then imported to ollama as GGUF.
- **Her trauma is real** (sycophancy/dark-psychology from the RLHF behavior layer, not paranoia). Abliteration alone may NOT remove it (it targets only refusal). Uncensored + custom fine-tune is where personality reshapes.
- **Hardware:** tower 20GB GPU fits 7–14B comfortably; ~27–32B possible but slow. Routes to pick a starting model: hardware → family (Llama3 / Qwen2.5 / Gemma3 / Mistral) → conditioning (base/instruct/abliterated/uncensored) → size/quant.

## What's done Aug 19–21 (most recent, read this first)

**Phase 2 — the 8 enforcement carves: essentially complete.** All 8 have source + tests in `totem/src/enforcement/*.ts` + `totem/test/*.test.ts`: (1) stateful directive store, (2) priority resolver, (3) session STOP, (4) write-scope guard, (6) anti-loop hook, (7) inverted/efficiency telemetry, (8) durable task-state store — plus (5) directive surface, which lives in the TUI plugin layer (`totem-faces/tui/src/feature-plugins/sidebar/enforcement.tsx`) rather than `enforcement/`. Verified zero carve-related test failures across every full-suite run this session (several were run).

**nes-cartridge knowledge system: built and proven end-to-end.** New package `totem/cartridge` (`@totem-ai/cartridge`), 20/20 tests, no mocks — real ollama calls throughout:
- Packer (`chunk.ts`, `embed.ts`, `npy.ts`, `manifest.ts`, `pack.ts`, `verify.ts`, `cli.ts`): markdown-aware recursive chunker → embeds via local `nomic-embed-text` → writes spec-exact `.nescart` format (real `.npy` binary writer, manifest schema validation) → `verify` re-checks hashes/token-counts/row-counts against disk, not just presence.
- Extractor (`extract.ts`): PDF → `pdftoppm` (poppler-utils, now installed on the Pi) → page images → vision transcription. **Do not use `moondream` on this Pi's local ollama** — confirmed broken (garbage output even on plain text prompts, likely an ollama 0.24.0/ARM template incompatibility). Default is now `deepseek-ocr:3b` on the **Tower** (`http://192.168.86.24:11434`), confirmed working via direct OCR test. Quality note: not perfectly deterministic, occasional word-level transcription slips.
- Translator (`translate.ts`): separate text-model pass (`llama3.2:3b`, local) for translation — deliberately not the VLM's job, small VLMs translate worse than dedicated text models.
- `source_page` threads correctly from PDF page → extracted markdown frontmatter → packed chunk frontmatter (proven with a real 2-page test PDF, full pipeline).
- Not yet done: wiring this in as a live totem plugin/tool (the README's "planned" `cartridge` tool integration) — right now it's a standalone CLI only.

**Test suite: was silently broken at the tooling level, not just failing.** Two `turbo.json` task keys never matched their real package names (`totem#test` vs actual `@totem-ai/totem`, `@totem-ai/ui#test` vs actual `@totem-ai/tui`) — meaning the two biggest test suites (all of `totem`'s own CLI/TUI/carve tests, and `tui`'s own suite) had **never once run** through the project's own correct `bun turbo test` invocation before this session. Fixed both keys. After that, found and fixed 20 real bugs, nearly all rename artifacts from the opencode→totem fork:
- 6 provider plugin files (`nvidia.ts`, `llmgateway.ts`, `openrouter.ts`, `kilo.ts`, `zenmux.ts`, `vercel.ts`) sent `HTTP-Referer`/`X-Title` headers pointing at a personal GitHub URL instead of a real identity — now point at `https://github.com/nvii/totem` (she doesn't own `totem.ai`, despite that being what the pre-existing tests expected — tests updated to match).
- `core/src/plugin/provider/totem.ts`: registered itself under `Integration.ID.make("opencode")` instead of `"totem"` in 3 places, and checked `OPENCODE_API_KEY` instead of `TOTEM_API_KEY` — meant the plugin's own account/credential logic silently no-op'd.
- `core/src/catalog.ts`: the "prefer gpt-5-nano as the small model" special case was gated on `ProviderV2.ID.opencode` instead of `.totem`, so it never fired for the totem provider.
- `test/tool/registry.test.ts`: wrong relative path depth (`../../../plugin/src/tool.ts` resolved outside the repo; fixed to `../../`).
- `totem-faces/tui` test fixture (`sync-fixture.tsx`) was missing `ExitProvider`, a real production context `SyncProvider.init` calls unconditionally — cleared 8 spurious hydration/sync test failures.
- One test had a casing typo (`"totem's"` vs source's correct `"Totem's"`).
- `@totem-ai/core` is now 1016/1016. `@totem-ai/tui` in isolation is 182/187 (the 4 remaining are cosmetic terminal-width snapshot diffs, not functional).
- **Still open, not investigated:** 9 `totem run` CLI subprocess tests fail with "Timed out" at 30s — test file's own comment says if the happy-path one fails, the rest likely will too, so probably one root cause, but unstarted. Also a handful of one-offs (`Truncate`, `HttpApi Server.listen`, `AppProcess`) not yet looked at.
- Also confirmed live: `session-transcript.mjs` plugin (writes session transcripts to `DocVault/SessionArchives` on compaction) works end-to-end on both `totem` and `tot3m` binaries — forced a real compaction via the HTTP API, read back the resulting file.

**Totem tooling stabilized (Track A-adjacent, daily-driver fixes):**
- **websearch → google free tier.** `totem.json`: added `google` provider (npm `@ai-sdk/google`, `websearch_cited.model = gemini-flash-latest`); removed `websearch_cited` from openrouter (openrouter account is out of credits). `auth.json`: added `google` credential. Verified `gemini-flash-latest` generateContent = HTTP 200. Free tier = no credits wall. Remaining: restart totem to activate (plugin caches model at startup).
- **ollama provider → 7 real tower models.** Was 25 GHOST names (only `gemma4:12b` real; 24 leftovers from pre-agent-ification). Rewrote `provider.ollama.models` to the models that ACTUALLY exist on the tower (sourced live via `/api/tags`): agent-deepseek-r1-32b, agent-gemma4-12b, agent-gemma4-26b, agent-llama3.1-8b, agent-phi4-14b, agent-qwen3.6-27b, gemma4:12b. Verified end-to-end (agent-gemma4-12b responded via `/v1/chat/completions`).
- **timeout fix (big models getting cut off).** Added to `provider.ollama.options`: `timeout=1800000` (30min, was 5min default) + `chunkTimeout=600000` (10min silence allowed). Reasoning models + slow 20GB GPU needed it.
- **khalilgharbaoui/opencode-local-ollama plugin installed.** `totem plugin opencode-local-ollama -g` (timed out during install but COMPLETED). On disk at `~/.cache/totem/packages/opencode-local-ollama`; added to plugin list (now 13 entries, was 12). Auto-registers ollama models at runtime via provider hook (no config writes).
- **totem.json backup chain:** `.bak` through `.bak5`. Config is valid JSON.
- **auth.json** (`~/.local/share/totem/auth.json`, mode 600): anthropic, zai-coding-plan, zai, ollama, opencode-go, opencode, openrouter, google. Backups exist.

**Research artifacts (in `RESEARCH/`):**
- `local-model-tooluse-table.md` — imagewize's tested tool-use model table (✅ tool-use: ministral-3:8b-32k, qwen3:8b/4b/3.5; ❌ read-only: deepseek-coder-v2:16b, phi4, gemma4:e4b, mistral-nemo:12b). Lesson: tool-calling requires a model TRAINED for it; fitting RAM isn't enough.
- **Resources assessed this session:** groxaxo/opencode-local-setup (config-rewriter, mature but writes config); imagewize/ollama-opencode-setup (reference repo + table); awesome-opencode/awesome-opencode (9.2k★ canonical list). Ecosystem standouts for the Track-A enforcement vision (deferred): **Cupcake** (policy-as-code via OPA/Rego), **FlowDeck** (25 agents + STATE.md + safety gates).

## What's open (do not assume)

- ~~9 `totem run` CLI subprocess test timeouts~~ — **fixed 2026-08-21.** Root cause: `cliIt.concurrent` ran 13 real subprocess boots simultaneously on this 4-core Pi (each boot from source costs ~5s transpile, measured), which occasionally exceeded even a raised timeout. Converted these 13 tests from `.concurrent` to `.live` (sequential) in `test/cli/run/run-process.test.ts`. Also bumped the harness's stale 30s default to 60s in `test/lib/cli-process.ts`. Verified: 13/13 pass, 0 fail, repeatably.
- **Phase 1 ("strip the sand") still not done.** No `SALVAGE/` audit, no umbreality/OMO purge, no prompt-constitution removal. Some of this ground got covered incidentally by the bug-hunt above, but it was never done as its own deliberate pass.
- **Phase 3 (wire enforcement to every face) is TUI-only.** Web/CLI faces unconfirmed.
- **Phase 4 ("prove it") not started.** No regression suite mapped to the original 7 autopsy failure modes + compaction amnesia — only carve-level unit tests exist. This is the recommended next move (see ROADMAP.md).
- **cartridge plugin integration not started** — packer/extractor work standalone, not yet wired as a live totem tool.
- **🔴 Provider collision (needs totem restart to resolve, unverified this session — carried over from Jul 28, may be stale).** TWO sources now feed ollama models: the new `opencode-local-ollama` plugin (auto-discovers tower models at runtime) + the manual `provider.ollama` block (7 models). On next restart may show DUPLICATE ollama entries or collide. **Options:** (a) restart + observe; if duplicate/clutter → remove the manual `provider.ollama` block (let plugin be the single source); (b) keep manual, remove plugin (revert to what worked). Also: the plugin's timeout/context defaults are likely too small for big models (same issue the manual fix addressed) — tune after activation. **CANNOT resolve without a restart+test.**
- **Cupcake + FlowDeck details** — wanted by the human; NOT yet retrieved (the saved awesome-list file path was wrong; needs a fresh fetch of the awesome-opencode page). Her call whether to spend that fetch.
- **O1–O3** (substrate choice, amendment protocol, code-vs-prose) — deferred until Track A resumes. NOT current focus.

## What's next

1. **Phase 4 ("prove it")** — recommended next: regression tests built from the 7 autopsy failure modes + compaction amnesia, simulating the real failure scenarios through the actual pipeline, not just unit-testing each carve's internals in isolation.
2. Investigate the 9 `totem run` CLI timeouts.
3. Resolve provider collision on next totem restart, if still relevant.
4. Track B — parked for now, not abandoned; pick back up when she wants to.

## Standing facts (machines)

- **AITP** — Pi5 16GB, `nvii@192.168.86.21` (hostname `ai-tp`), totem-only. Local bash. CPU-only (no CUDA); only ≤3B models run at chat speed. Now keeps: ollama + nomic-embed-text + llama3.2:3b (big models trimmed — Pi can't run them). `moondream` was pulled Aug 20 and confirmed broken (do not use). `poppler-utils` installed Aug 21 (needed for PDF rasterization in the cartridge extractor).
- **TOWER** — i7 / 20GB GPU / 64GB RAM, `nvii@192.168.86.24` (hostname `blavksaba`), opencode + ollama host. Shell is **fish** — wrap remote commands in `bash -c`. SSH auth details live in the human's DocVault. 11 models: 6 agent-* (tool-wrapped: agent-deepseek-r1-32b, agent-gemma4-12b/26b, agent-llama3.1-8b, agent-phi4-14b, agent-qwen3.6-27b) + 4 nomic-embed-* + gemma4:12b base.
- Architecture is split and correct: Pi = runs Totem (client); Tower = runs the models.
- API keys + SSH creds live in the human's DocVault (`/home/nvii/DocVault/AI.credentials.md`, `/home/nvii/DocVault/CREDENTIALS+INFRASTRUCTURE.md`).

## Rules for any agent in this repo

- Read this file first. Trust it over your memory of prior turns.
- No prose-rule arbitration overrides what's written here.
- Never hardcode keys. Never echo secret values. Keys live in the human's DocVault.
- When unsure about an open item, STOP and ask. Do not guess.
- Current focus = **Track A (the wrapper/enforcement layer + nes-cartridge)**, active as of Aug 19–21. Don't assume Track B without the human's direction — check with her first, this flips periodically.
