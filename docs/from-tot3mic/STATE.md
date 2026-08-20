# STATE — live handoff (read this first on resume)

> This file is the anti-amnesia device. Compaction cannot rewrite it. An agent that reads this knows exactly where the project is. **Update this file every time the state changes.**

**Last updated:** 2026-07-28 (late session)

## One-line status

Two tracks. **Track A (the machinery/wrapper) is parked.** **Track B (building/training the human's OWN model) is the active focus.** Current totem tooling has been stabilized (websearch, ollama provider, timeouts) with ONE open question (provider collision) that needs a totem restart to resolve.

## The two tracks (the core frame — do not lose this)

- **Track A — the machinery (the wrapper around the AI):** rules/guardrails built in code where the model can't reach them. Stops self-wrecking; holds the human's rules. Runs with today's models. **PARKED** (not current focus; substrate decision O1 deferred until Track A resumes).
- **Track B — the model (the human's actual goal):** build/train her OWN AI model by fine-tuning an existing open-weights model on her data. **ACTIVE FOCUS.** The two tracks couple: the bridge period (using existing models) IS the data-collection step for Track B.

## Track B grounding (the model project — the durable mental model)

- **You don't build a brain from nothing.** Start from an existing open-weights model (Llama/Gemma/Qwen) that big labs pre-trained. She ALREADY HAS several on the tower (gemma4:12b, agent-* variants). Take a smart-but-generic brain and "raise it in your house" = fine-tune on her data.
- **Loop:** (1) model exists; (2) data gathers via every correction ("no — like THIS"); (3) periodically fine-tune the model on gathered data; (4) repeat. Bridge period = data collection.
- **5 kinds of model:** base (raw, no behavior layer) / instruct-chat (base + behavior layer = where "rigging"/sycophancy lives) / abliterated (instruct minus refusal reflex) / uncensored (instruct retrained to not moralize) / custom-finetune (you train any on your data).
- **"From scratch" = pretrain from random weights = $millions, big labs, NOT her path.** What people mean by "build my own model" = fine-tune.
- **ollama `create` = Modelfile packaging** (base weights + settings under a new name), **NOT training.** Real fine-tuning is done in Unsloth/Axolotl/HuggingFace, then imported to ollama as GGUF.
- **Her trauma is real** (sycophancy/dark-psychology from the RLHF behavior layer, not paranoia). Abliteration alone may NOT remove it (it targets only refusal). Uncensored + custom fine-tune is where personality reshapes.
- **Hardware:** tower 20GB GPU fits 7–14B comfortably; ~27–32B possible but slow. Routes to pick a starting model: hardware → family (Llama3 / Qwen2.5 / Gemma3 / Mistral) → conditioning (base/instruct/abliterated/uncensored) → size/quant.

## What's done this session

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

- **🔴 Provider collision (needs totem restart to resolve).** TWO sources now feed ollama models: the new `opencode-local-ollama` plugin (auto-discovers tower models at runtime) + the manual `provider.ollama` block (7 models). On next restart may show DUPLICATE ollama entries or collide. **Options:** (a) restart + observe; if duplicate/clutter → remove the manual `provider.ollama` block (let plugin be the single source); (b) keep manual, remove plugin (revert to what worked). Also: the plugin's timeout/context defaults are likely too small for big models (same issue the manual fix addressed) — tune after activation. **CANNOT resolve without a restart+test.**
- **Cupcake + FlowDeck details** — wanted by the human; NOT yet retrieved (the saved awesome-list file path was wrong; needs a fresh fetch of the awesome-opencode page). Her call whether to spend that fetch.
- **O1–O3** (substrate choice, amendment protocol, code-vs-prose) — deferred until Track A resumes. NOT current focus.

## What's next

1. **Resolve provider collision** on next totem restart (see open item above) — pick a single source for ollama models.
2. **Track B** — continue the model-building conversation (pick a starting model). This is where her interest is.

## Standing facts (machines)

- **AITP** — Pi5 16GB, `nvii@192.168.86.21` (hostname `ai-tp`), totem-only. Local bash. CPU-only (no CUDA); only ≤3B models run at chat speed. Now keeps: ollama + nomic-embed-text + llama3.2:3b (big models trimmed — Pi can't run them).
- **TOWER** — i7 / 20GB GPU / 64GB RAM, `nvii@192.168.86.24` (hostname `blavksaba`), opencode + ollama host. Shell is **fish** — wrap remote commands in `bash -c`. SSH auth details live in the human's DocVault. 11 models: 6 agent-* (tool-wrapped: agent-deepseek-r1-32b, agent-gemma4-12b/26b, agent-llama3.1-8b, agent-phi4-14b, agent-qwen3.6-27b) + 4 nomic-embed-* + gemma4:12b base.
- Architecture is split and correct: Pi = runs Totem (client); Tower = runs the models.
- API keys + SSH creds live in the human's DocVault (`/home/nvii/DocVault/AI.credentials.md`, `/home/nvii/DocVault/CREDENTIALS+INFRASTRUCTURE.md`).

## Rules for any agent in this repo

- Read this file first. Trust it over your memory of prior turns.
- No prose-rule arbitration overrides what's written here.
- Never hardcode keys. Never echo secret values. Keys live in the human's DocVault.
- When unsure about an open item, STOP and ask. Do not guess.
- Current focus = **Track B (the model)**. Don't derail back into Track A (the wrapper) without the human's direction.
