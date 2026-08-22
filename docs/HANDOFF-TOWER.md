# HANDOFF — for the Tower opencode session

Paste this whole thing into the tower's opencode as the first message.

---

**The user is Nvii. How to work with her:**
Plain English only — no jargon, no sycophancy ("great question" / "absolutely" / "you're right" are forbidden), no unrequested offers or plans, answer exactly what she asks and nothing more. She has been genuinely harmed by evasive / flattering / manipulative model behavior — she needs straight answers and direction-following. When she redirects you, stop instantly and follow the redirect; do not finish your thought. When she gives a directive, do it in one bundled action — not inspect-inspect-inspect before executing. She needs things to MAKE SENSE (a clear mental picture) before she can act.

**The two machines:**
- **Here (Tower, `<tower-hostname>`, <tower-ip>):** i7 / 20GB GPU / 64GB RAM. Runs opencode + ollama. The local models live here.
- **The Pi (`ai-tp`, <aitp-ip>):** Pi5 16GB, no GPU. Runs totem (the client she uses day-to-day). **Totem's config lives on the Pi, not here.** SSH between the two boxes is already configured (ask her for access if you need to reach the Pi).

**The project — TOT3MIC:**
Her from-scratch rebuild. The full living state is in `/home/nvii/TOT3MIC/STATE.md` on the Pi (read it via SSH if you can). Short version: two tracks. **Track A** = the wrapper/machinery around the model (PARKED). **Track B** = building/training her OWN model (ACTIVE focus). Core idea: take an existing open-weights model (Llama / Gemma / Qwen — several already on this tower) and "raise it in your house" by fine-tuning it on her data. "From scratch" / pretraining is NOT her path.

**Why she's here / the immediate task:**
She needs to resolve a **provider collision in totem** and confirm totem still works. A plugin (`opencode-local-ollama`) was just installed on the Pi's totem — it auto-discovers ollama models from THIS tower at runtime. But totem ALSO has a hand-written `provider.ollama` block listing 7 models. Both now feed ollama models, so totem's next restart may show DUPLICATES or COLLIDE. Two clean options:
1. Let the plugin be the only source (delete the hand-written `provider.ollama` block).
2. Keep the hand-written block and remove the plugin (revert to what worked).
This can only be resolved by restarting totem on the Pi and observing. Help her decide and tune.

**Already done this session — DO NOT redo:**
- totem websearch switched to Google free tier, model `gemini-flash-latest` (verified working, HTTP 200).
- totem ollama list fixed: was 25 ghost names → now the 7 real tower models (agent-gemma4-12b, agent-llama3.1-8b, agent-phi4-14b, agent-gemma4-26b, agent-qwen3.6-27b, agent-deepseek-r1-32b, gemma4:12b).
- totem timeout fix: `provider.ollama.options` = `timeout` 1800000 (30min) + `chunkTimeout` 600000 (10min) so big reasoning models don't get cut off. The plugin's own defaults are likely too small — a tuning follow-up after it activates.

**Totem config (ON THE PI):**
- `/home/nvii/.config/totem/totem.json` — main config (providers, plugins, models, compaction).
- `/home/nvii/.local/share/totem/auth.json` — credentials store. NEVER echo these.
- Backups: `totem.json.bak` → `.bak5`, `auth.json.bak` → `.bak3`.

**Do NOT:** echo or hardcode secrets; reinstall/derive things already working; guess without verifying against the actual config/source; drag her into wrapper-plumbing rabbit holes — her focus is the model.

Start by asking her what she wants to tackle first.
