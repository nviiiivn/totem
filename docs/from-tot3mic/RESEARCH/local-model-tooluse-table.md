# Local Model Tool-Use Reference Table

> Spliced from `imagewize/ollama-opencode-setup` (MIT). See source: https://github.com/imagewize/ollama-opencode-setup
> **Hardware caveat:** the timings below are Mac M-series / MLX. They do NOT transfer to our box (x86 tower, 20GB GPU, ARM Pi). What DOES transfer: the *methodology*, the pass/fail tool-use results as a general guide, the context-baking pattern, and the test script.

## The core lesson
> **"Tool calling requires a model trained for it — fitting in RAM is not enough."**

A model that loads and chats fine can still be **read-only** (no tool/function calling). Always verify with a tool-call test before trusting a model as an agent.

## Tested tool-use results (Mac M-series reference)

| Model | Tool-use | Notes |
|---|---|---|
| ministral-3:8b-32k | ✅ yes | ~4s, recommended |
| qwen3:8b | ✅ yes | |
| qwen3:4b | ✅ yes | |
| qwen3.5 | ✅ yes | |
| deepseek-coder-v2:16b | ❌ read-only | |
| phi4 | ❌ read-only | |
| gemma4:e4b | ❌ read-only | |
| mistral-nemo:12b | ❌ read-only | |

## How to verify any model ourselves
The source repo ships `scripts/tool-call-test.sh` — runs a known tool-call prompt against a model and reports pass/fail. We should port/run an equivalent against the tower's models (esp. the `agent-*` ones) to confirm which actually tool-call on our hardware. This is directly relevant to **Track B** model selection.

## Context-baking pattern (validates our `agent-*` approach)
The repo's `modelfiles/` **bake `num_ctx` (context window) directly into the Modelfile** — e.g. 16k and 32k variants — so the context size ships with the model instead of being reconfigured every launch. This is exactly what our `agent-*` Modelfiles do, and it's an independently-validated good pattern.

## Connection to our open problems
- **Timeout cutoff (already fixed):** we set `timeout`/`chunkTimeout` on the ollama provider. The plugin from khalilgharbaoui (#1) has its OWN `timeout` (default 5000ms) and `context` (default 4096) — both too small for our big slow models. If we adopt #1, those must be tuned the same way or the cutoff returns.
- **Context window:** 4096 default is too small almost everywhere (confirmed by dev.to + substack guides too). Next knob to set per-model.
