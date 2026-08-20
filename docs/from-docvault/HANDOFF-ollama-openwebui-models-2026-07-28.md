# HANDOFF — Open WebUI "models not found" (Ollama / Tower)

**Date:** 2026-07-28
**Status:** Diagnosed, root cause confirmed. NOT YET FIXED (no changes applied — fix pending user direction).
**Machines:** Open WebUI on AITP (192.168.86.21, Docker :8901) ↔ Ollama on Tower (192.168.86.24, blavksaba, :11434)
**Severity:** Functional break, not a crash. Ollama + network are healthy.

---

## TL;DR

Open WebUI and Ollama **are connected and working**. The "models not found" errors are caused by **stale model names** — the models on Tower were deleted and replaced ~29 hours before this session. Open WebUI chats, Open WebUI defaults, and Umbreality (`umb-api`) all still reference the old model names (`dolphin3:8b`, `gemma4:26b`, `starling-lm:7b`), which no longer exist → Ollama returns `HTTP 404 {"error":"model 'X' not found"}`.

**Fix is one command:** `ollama pull dolphin3:8b` on Tower. See [Recommended Fix](#recommended-fix-step-by-step).

---

## SYMPTOM

- Open WebUI (https://ai.alola.lol → AITP:8901) reports "models not found."
- Was working ~2 days before 2026-07-28.

---

## ROOT CAUSE (CONFIRMED WITH EVIDENCE)

### 1. The Tower model set changed ~29h before diagnosis
Old documented models are **gone**: `dolphin3:8b`, `qwen3:14b`, `qwen3.5:9b`, `deepseek-r1:14b/8b`, `deepseek-coder-v2:16b`, `qwen2.5-coder:14b/7b`, `llama3.2-vision:11b`, `coser-8b`, `gemma4/3`, `deepseek-r1-finance:14b`, `starling-lm:7b`, `gemma4:26b` (plain).

Current Tower models (2026-07-28):
```
agent-gemma4-12b:latest        7.6 GB
agent-llama3.1-8b:latest       4.9 GB
agent-phi4-14b:latest          9.1 GB
agent-gemma4-26b:latest         17 GB
agent-qwen3.6-27b:latest        17 GB
agent-deepseek-r1-32b:latest    19 GB
vishalraj/nomic-embed-code     49 MB
nomic-embed-text:latest        274 MB
nomic-embed-text:137m-v1.5-fp16 274 MB
nomic-embed-text-v2-moe:latest 957 MB
gemma4:12b                     7.6 GB
```

### 2. The swap was MANUAL, not automated
- **No cron, no systemd timer, no automation** is re-pulling models. A fix will not be reverted.
- Evidence — user's fish history on Tower shows the deletes and pulls:
  ```
  ollama rm starling-lm:7b
  ollama rm neural-chat:7b  mistral-nemo:12b
  ollama rm yi-coder:9b qwen3-coder:30b nous-hermes2-mixtral:latest llama3.2-vision:11b
  ollama rm gemma4:31b freehuntx/qwen3-coder:14b devstral-small-2:24b
  ollama rm agent-qwen-coder-30b:latest agent-qwen27b:latest
  ollama rm agent-devstral24b:latest
  ollama pull gemma4:26b
  ollama pull qwen3.6:27b
  agent-0 / agent-zero   (← Agent Zero framework setup)
  ```
- Conclusion: user deleted the old models and pulled `agent-*` variants while setting up **Agent Zero**. The default models wired into Open WebUI chats and Umbreality were never updated, so they now 404.

### 3. Proof the 404 is "model missing," not a connection failure
Direct test on Tower:
```
$ curl -w "HTTP %{http_code}\n" http://localhost:11434/api/chat \
    -d '{"model":"dolphin3:8b","messages":[{"role":"user","content":"hi"}],"stream":false}'
HTTP 404
{"error":"model 'dolphin3:8b' not found"}
```
Ollama returns 404 with that body for any non-existent model name.

---

## WHAT IS HEALTHY (DO NOT TOUCH)

| Component | State | Evidence |
|---|---|---|
| `ollama.service` on Tower | active, enabled, up 1d5h | `systemctl is-active ollama` → active |
| Ollama bind | `0.0.0.0:11434` (reachable LAN-wide) | `ss -tln` + systemd override `OLLAMA_HOST=0.0.0.0:11434` |
| Network AITP → Tower | working | Tower ollama logs show `POST /api/chat` from `192.168.86.21` arriving |
| Open WebUI container | running, `:8901->8080` | `docker ps` |
| Open WebUI model polling | working | `GET /api/models → 200` in container logs |
| Tower disk | 351 GB free on `/home` | `df -h` (82% used, not a blocker) |
| Ollama version | 0.30.6 (client 0.30.7) | `ollama --version` |

---

## KNOWN SECONDARY ISSUES

### A. Dead first entry in `OLLAMA_BASE_URLS` (harmless noise, optional cleanup)
Open WebUI container env:
```
OLLAMA_BASE_URLS=http://host.docker.internal:11434;http://192.168.86.24:11434
```
`host.docker.internal` **does not resolve on Linux Docker** by default. Container logs repeat:
```
ERROR open_webui.routers.ollama - Connection error: Cannot connect to host host.docker.internal:11434 ... [Name or service not known]
```
This is **non-fatal** — Open WebUI falls back to the second URL (`192.168.86.24:11434`) which works. But it spams the logs and slows model refresh. Fix: either drop the first entry or add `extra_hosts: ["host.docker.internal:host-gateway"]` to the compose.

### B. Umbreality `umb-api` is part of the 404 spam
`UAI_MODEL=dolphin3:8b` in `/home/nvii/UMBREALITY/umbreality-ai/docker-compose.yml` (and `CREDENTIALS+INFRASTRUCTURE.md`). Since `dolphin3:8b` is gone, umb-api requests also 404 against Tower. Fixing the model fixes this too. If you switch umb-api to a different default, update both files.

---

## RECOMMENDED FIX (STEP BY STEP)

Restores "working like 2 days ago" with the least effort. ~5 GB pull, ~2–5 min.

### Step 1 — Re-pull the default model on Tower
```bash
ssh nvii@192.168.86.24      # password: okioki  (or key auth)
ollama pull dolphin3:8b
ollama list | grep dolphin3   # confirm present
```

### Step 2 — Verify Ollama serves it
```bash
# on Tower
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:11434/api/chat \
  -d '{"model":"dolphin3:8b","messages":[{"role":"user","content":"hi"}],"stream":false}'
# expect: HTTP 200
```

### Step 3 — Confirm Open WebUI sees it
- Open https://ai.alola.lol
- Admin Settings → Connections → Ollama should show green.
- Refresh model list; `dolphin3:8b` appears in the picker.
- Existing chats pinned to `dolphin3:8b` now work again.

### Step 4 (optional) — Clear the harmless log noise
Edit Open WebUI's compose env to drop the dead URL, or add `host-gateway`. If the compose lives at the standard Open WebUI path, set:
```
OLLAMA_BASE_URLS=http://192.168.86.24:11434
```
Then `docker compose up -d open-webui` (or `docker restart open-webui`).

### What this does NOT fix
- Chats pinned to other deleted models (`starling-lm:7b`, `gemma4:26b` plain, `qwen3:14b`, etc.) will still 404 until those models are re-pulled or those chats are re-pointed to an existing model (e.g. `agent-gemma4-12b:latest`, `gemma4:12b`).

---

## ALTERNATIVE FIXES (if you choose differently)

### Alt 1 — Re-pull the full documented set
Restores every model from `CREDENTIALS+INFRASTRUCTURE.md` §MODELS:
```bash
ollama pull dolphin3:8b qwen3:14b deepseek-r1:14b deepseek-r1:8b \
  deepseek-coder-v2:16b qwen2.5-coder:14b qwen2.5-coder:7b \
  llama3.2-vision:11b gemma4:26b starling-lm:7b
```
Cost: large download (~80–120 GB), longer. Disk is fine (351 GB free). Tower has 16 GB RAM / RTX 3070 8 GB VRAM — can't run them all at once, but storage is fine.

### Alt 2 — Switch defaults to existing agent-* models (no downloads)
Point Umbreality and Open WebUI defaults to what's already on Tower. Update:
- `/home/nvii/UMBREALITY/umbreality-ai/docker-compose.yml`: `UAI_MODEL=agent-gemma4-12b:latest` (or `gemma4:12b`)
- `DocVault/CREDENTIALS+INFRASTRUCTURE.md`: Umbreality § + MODELS § to match
- In Open WebUI: set a new default model in Admin Settings / per-workspace.
Old chats still reference deleted names and must be re-pointed individually.

---

## VERIFICATION CHECKLIST (after any fix)

```bash
# 1. Model exists on Tower
ssh nvii@192.168.86.24 'ollama list | grep -E "dolphin3|<chosen-model>"'

# 2. Ollama serves it
ssh nvii@192.168.86.24 'curl -s -o /dev/null -w "%{http_code}\n" http://localhost:11434/api/chat -d "{\"model\":\"dolphin3:8b\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}],\"stream\":false}"'
# expect 200

# 3. Open WebUI log noise stopped (if you cleaned OLLAMA_BASE_URLS)
docker logs open-webui --tail 20 2>&1 | grep -i "host.docker.internal"
# expect: no new lines

# 4. No more 404 spam from .21 in Tower ollama logs
ssh nvii@192.168.86.24 'journalctl -u ollama --since "2 min ago" --no-pager | grep "404"'
# expect: empty (after a real chat with a valid model)
```

---

## ACCESS / COMMANDS REFERENCE (from CREDENTIALS+INFRASTRUCTURE.md)

- Tower SSH: `nvii@192.168.86.24` (key auth; password `okioki` via sshpass works)
- AITP (this box): `nvii@192.168.86.21`
- Open WebUI: Docker container `open-webui`, host port `8901`, domain `ai.alola.lol` (Caddy 1 → :8901)
- Ollama URL used by both Open WebUI and umb-api: `http://192.168.86.24:11434`
- Umbreality API: Docker container `umb-api`, host port `8910`, default model env `UAI_MODEL`
- sshpass one-liner for Tower from any box:
  ```bash
  SSHPASS=okioki sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null nvii@192.168.86.24 '<cmd>'
  ```

---

## DIAGNOSIS ARTIFACTS (for the record)

- Tower ollama journal (live 404s from .21): `journalctl -u ollama --since "1 hour ago" | grep 404`
- Open WebUI container errors: `docker logs open-webui --tail 200 2>&1 | grep -iE "not found|error"`
- Model swap evidence: Tower `~/.local/share/fish/fish_history` (search `ollama rm` / `ollama pull`)
- No automation found: `systemctl list-timers` (none match ollama/agent/model); `crontab -l` empty.

---

## OPEN QUESTIONS FOR NEXT SESSION

1. Do you want the full old model set back (Alt 1), or just `dolphin3:8b` (recommended), or switch defaults to `agent-*` (Alt 2)?
2. Should Open WebUI's dead `host.docker.internal` URL be cleaned up? (recommended, low risk)
3. Agent Zero setup on Tower — intentional/kept, or should it be rolled back? (out of scope for this fix, but it's the root of the model churn)
