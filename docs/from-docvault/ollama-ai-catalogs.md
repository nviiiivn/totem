# COMPLETE AI/ML CATALOG — July 2026

System context: RTX 3080 20GB VRAM, ComfyUI v0.24.0, Linux, 418 existing LoRAs, SDXL base.

---

## SECTION 1: LLM MODELS (Text-Only)

### 1.1 Dense Models (fits 20GB at Q4_K_M)

| Model | What It Does | Size / VRAM (Q4) | URL | Why It Matters |
|---|---|---|---|---|
| **Qwen3.6-27B** | Best all-around dense model. Agentic coding, repo-level reasoning, frontend workflows. Apache 2.0. | 27B params / ~16GB Q4 | https://huggingface.co/Qwen/Qwen3.6-27B | Strongest single default for a 20GB card. Leaves headroom for context. |
| **Qwen3-32B** | Dense 32B reasoning/general model. Apache 2.0. | 32B params / ~19-20GB Q4 | https://huggingface.co/Qwen/Qwen3-32B | Tight but valid fit on 20GB. Strong reasoning. |
| **DeepSeek-R1-Distill-Qwen-32B** | R1 reasoning traces distilled into Qwen2.5 base. MIT license. | 32B params / ~18-20GB Q4 | https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B | Best reasoning model that fits a single consumer GPU. Visible chain-of-thought. |
| **Mistral Small 3.2 24B** | Polished daily assistant. Low latency. Apache 2.0. | 24B params / ~14GB Q4 | https://mistral.ai/news/mistral-small-3-1/ | Lightest footprint here. More headroom for context than 32B models. |
| **Gemma 4 31B** | Dense 31B flagship. Strong reasoning, 140+ languages. | 31B params / ~17-20GB Q4 | https://deepmind.google/models/gemma/ | Dense reasoning depth. Slower at ~30 tok/s but higher quality per token. |
| **Phi-4 14B** | Microsoft's efficient 14B. Strong for its size class. | 14B params / ~8.5GB Q4 | https://huggingface.co/microsoft/phi-4 | Excellent if you want headroom for long context + LoRA simultaneously. |
| **Qwen3-14B** | Strong reasoning and coding at 14B. Apache 2.0. | 14B params / ~9GB Q4 | https://huggingface.co/Qwen/Qwen3-14B | Sweet spot for 16GB cards; leaves 11GB free on 20GB for context + KV cache. |
| **Llama 3.1 8B** | Meta's solid all-rounder. Most mature ecosystem. | 8B params / ~5GB Q4 | https://huggingface.co/meta-llama/Llama-3.1-8B | Largest fine-tune ecosystem. Default starting point for beginners. |
| **Llama 3.3 70B** | Competitive with GPT-4 on many benchmarks. | 70B params / ~38-40GB Q4 | https://huggingface.co/meta-llama/Llama-3.3-70B | **Does NOT fit 20GB.** Needs dual GPU or server. Included for completeness. |

### 1.2 Mixture-of-Experts Models

| Model | What It Does | Size / VRAM (Q4) | URL | Why It Matters |
|---|---|---|---|---|
| **Qwen3.6-35B-A3B** | 35B total, 3B active per token. Fastest general-purpose option. Apache 2.0. | 35B total / ~17-20GB Q4 | https://huggingface.co/Qwen/Qwen3.6-35B-A3B | Fastest capable model on consumer hardware. ~120 tok/s at Q3. Only 3B active = fast decode. |
| **Qwen3-30B-A3B** | 30B total, 3B active. Efficient MoE. | 30B total / ~6GB Q4 | https://huggingface.co/Qwen/Qwen3-30B-A3B | Fits on 8GB GPU! Most VRAM-efficient serious reasoning model. |
| **Gemma 4 26B-A4B** | 26B total, 4B active. Vision + 140 languages. | 26B total / ~16-18GB Q4 | https://deepmind.google/models/gemma/ | Best quality-per-GB at 16GB tier. Fast decode thanks to 4B active params. |
| **gpt-oss-20b** | OpenAI's open reasoning model. 21B total, 3.6B active. Apache 2.0. | 21B total / ~14GB native FP4 | https://openai.com/index/introducing-gpt-oss/ | Native MXFP4 format. Strong reasoning + tool use. |
| **Llama 4 Scout** | 109B total, 17B active. 10M token context window. | 109B total / ~55-60GB Q4 | https://huggingface.co/meta-llama/Llama-4-Scout | **Does NOT fit 20GB.** Included for reference. Needs sub-2-bit quant to even attempt single GPU. |

### 1.3 Large / Server-Class Models (API-only for 20GB)

| Model | What It Does | Size | URL | Why It Matters |
|---|---|---|---|---|
| **DeepSeek V3** | 671B MoE, 37B active. Frontier reasoning. MIT. | 671B total / ~376GB Q4 | https://huggingface.co/deepseek-ai/DeepSeek-V3 | Open-weight frontier. API-only for consumer hardware. |
| **DeepSeek V4 Flash** | 284B MoE, 13B active. MIT. | 284B total / ~33GB heavy quant | https://huggingface.co/deepseek-ai/DeepSeek-V4 | Needs 2× RTX 4090 minimum. |
| **GLM-5.1** | 754B MoE. Matches frontier closed models on coding. MIT. | 754B total / ~860GB FP8 | https://zhipu.ai | Server-only. 8× H200 territory. |
| **Qwen3.5-397B** | Alibaba's largest. MoE. | 397B total | https://huggingface.co/Qwen/Qwen3.5-397B | API option only. |
| **Mistral Large 3** | Mistral's flagship. | Server-class | https://mistral.ai | API option only. |

### 1.4 Small Models (Edge / Always-On)

| Model | What It Does | Size / VRAM | URL | Why It Matters |
|---|---|---|---|---|
| **Qwen3-8B** | Excellent reasoning at 8B. Apache 2.0. | 8B / ~5GB Q4 | https://huggingface.co/Qwen/Qwen3-8B | Best 8B-class model. Good multilingual. |
| **Gemma 4 12B** | Google's 12B. Fits 8GB cards. | 12B / ~6.6GB Q4 | https://deepmind.google/models/gemma/ | Best quality at 8GB tier. |
| **Llama 3.2 3B** | Ultra-light. | 3B / ~2GB Q4 | https://huggingface.co/meta-llama/Llama-3.2-3B | Fits anything. Always-on background assistant. |
| **Phi-4-mini 3.8B** | Microsoft's punchy small model. | 3.8B / ~2.4GB Q4 | https://huggingface.co/microsoft/phi-4-mini | Strong for its size. Good on constrained hardware. |
| **Qwen3-0.6B** | Tiny but coherent. | 0.6B / ~0.7GB Q8 | https://huggingface.co/Qwen/Qwen3-0.6B | Runs on CPU. Embedded/IoT use cases. |

---

## SECTION 2: MULTIMODAL / VISION-LANGUAGE MODELS

| Model | What It Does | Sizes | URL | Why It Matters |
|---|---|---|---|---|
| **Qwen3-VL** | Alibaba's latest VLM. Dense + MoE. Thinking editions. Video understanding. Apache 2.0. | 2B, 4B, 8B, 30B-A3B, 32B, 235B-A22B | https://github.com/QwenLM/Qwen3-VL | Best open VLM family in 2026. 8B fits 20GB. |
| **InternVL 3.5** | OpenGVLab's latest. Cascade RL. Up to 241B-A28B MoE. | 1B to 241B-A28B | https://github.com/OpenGVLab/InternVL | 3.5 narrows gap to GPT-5. 8B dense fits 20GB. |
| **LLaVA-OneVision** | Open VLM for single-image, multi-image, video. 0.5B to 72B. | 0.5B, 7B, 72B | https://github.com/LLaVA-VL/LLaVA-NeXT | Most established open VLM research platform. |
| **InternVL-U** | Unified multimodal: understanding + reasoning + generation + editing. 4B. | 4B | https://github.com/OpenGVLab/InternVL-U | Single model does everything. MIT license. |
| **Qwen2.5-VL** | Previous-gen Qwen VLM. Still widely deployed. AWQ versions available. | 3B, 7B, 32B, 72B | https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct | Stable, well-tested. 3B/7B fit easily on 20GB. |

---

## SECTION 3: RAG FRAMEWORKS

| Tool | What It Does | Resources | URL | Why It Matters |
|---|---|---|---|---|
| **LlamaIndex** (v0.14.22) | Data framework for LLM apps. Ingestion, indexing, querying. 92% retrieval accuracy in benchmarks. SubQuestionQueryEngine for multi-hop. Workflows API (event-driven). | 28 core deps, ~81MB install | https://github.com/run-llama/llama_index | Best retrieval quality. 30-40% less code than LangChain for equivalent RAG pipeline. 10-line RAG. |
| **LangChain** (v1.3.4) | Orchestration framework. LCEL pipe-operator chains. 600+ provider integrations. LangGraph for stateful agents. | 9 core deps | https://github.com/langchain-ai/langchain | Best ecosystem breadth. Wins when RAG is one tool among many. Note: `langchain-community` deprecated — use standalone packages. |
| **Haystack** (v2.30) | Deepset's pipeline framework. Explicit graph structure. YAML serialization. Strong type safety. | 19 core deps | https://github.com/deepset-ai/haystack | Best for regulated industries. Strongest type safety. Audit-friendly. |
| **DSPy** | Compiler for LLM programs. Declarative signatures. Optimizer-driven prompt/pipeline tuning. | Lightweight | https://github.com/stanfordnlp/dspy | Optimizes prompts programmatically instead of hand-tuning. Research power tool. |
| **RAGflow** (v0.14.1) | Full RAG system with web UI. "RAG in a box." | Docker | https://github.com/infiniflow/ragflow | Fastest path from zero to working RAG. Docker → web UI → production in <2 hours. AGPL license. |

---

## SECTION 4: VECTOR DATABASES

| Database | What It Does | License / Cost | URL | Why It Matters |
|---|---|---|---|---|
| **Qdrant** | Rust-based vector DB. Apache 2.0. 1.2ms p50 on 1M vectors. Best filtered search. Permanent free cloud tier (1GB RAM, 4GB disk). | Apache 2.0 / Free (self-hosted) | https://github.com/qdrant/qdrant | Best open-source performance. Sub-10ms latency. Wins at filtered vector search. |
| **Chroma** | Zero-to-working vector search. Embedded or standalone. Python-first. | Apache 2.0 / Free | https://github.com/chroma-core/chroma | Fastest prototyping. No external deps. Use for dev, swap to Qdrant for prod. |
| **Milvus** | Billion-scale vector DB. High concurrency. Apache 2.0. | Apache 2.0 / Free (self-hosted) | https://github.com/milvus-io/milvus | Extreme throughput. Best for 100M+ vectors. |
| **Weaviate** | Hybrid search (vector + keyword). BSD-3. | BSD-3 / ~$25/month cloud | https://github.com/weaviate/weaviate | 15% recall improvement on hybrid queries vs pure vector. |
| **Pinecone** | Managed vector DB. Zero ops. | Proprietary / $50/month min | https://www.pinecone.io | Fastest managed path. Zero maintenance. |
| **pgvector** | PostgreSQL extension for vectors. | PostgreSQL / Free | https://github.com/pgvector/pgvector | Use if you already run Postgres. No new infrastructure. |

---

## SECTION 5: EMBEDDING MODELS

| Model | What It Does | Params / Dims | URL | Why It Matters |
|---|---|---|---|---|
| **Qwen3-Embedding-8B** | Top open MTEB scores. 119 languages. MRL truncation. Apache 2.0. | 8B / 4096 dims | https://huggingface.co/Qwen/Qwen3-Embedding-8B | #1 open embedding model in 2026. ~17GB VRAM. |
| **Qwen3-Embedding-0.6B** | Best quality-per-VRAM small embedder. 70.7 MTEB(eng,v2). | 0.6B / 1024 dims | https://huggingface.co/Qwen/Qwen3-Embedding-0.6B | ~1.5GB VRAM. Runs on CPU. Ollama-native. |
| **BGE-M3** | Multilingual (100+ langs). Dense + sparse + ColBERT in one model. 8K context. | 568M / 1024 dims | https://huggingface.co/BAAI/bge-m3 | Most-downloaded open embedder. MIT license. Hybrid search in one model. ~1.2GB VRAM. |
| **BGE-Large-EN-v1.5** | Proven English retrieval. MIT. | 335M / 1024 dims | https://huggingface.co/BAAI/bge-large-en-v1.5 | Safe English default. ~0.7GB VRAM. |
| **Nomic Embed Text v1.5** | Matryoshka truncation (256-768 dims). Apache 2.0. | 137M / 768 dims | https://huggingface.co/nomic-ai/nomic-embed-text-v1.5 | Can truncate to 256 dims for 4x storage savings. ~0.3GB. Ollama-native. |
| **Stella-en-1.5B-v5** | Near-7B quality at 1.5B params. Matryoshka. | 1.5B / 1024 dims | https://huggingface.co/dunzhang/stella_en_1.5B_v5 | Pareto sweet spot. ~3.5GB VRAM. |
| **E5-Mistral-7B-Instruct** | LLM-as-embedder. Top MTEB English. MIT. | 7B / 4096 dims | https://huggingface.co/intfloat/e5-mistral-7b-instruct | First to prove decoder LLMs make excellent embedders. ~15GB. |
| **GTE-Qwen2-7B-Instruct** | Strong bilingual EN/ZH. 32K context. Apache 2.0. | 7B / 3584 dims | https://huggingface.co/Alibaba-NLP/gte-Qwen2-7B-instruct | Best for bilingual Chinese/English retrieval. ~15GB. |
| **NV-Embed-v2** | Highest raw English MTEB. **CC-BY-NC — non-commercial only.** | 7.85B / 4096 dims | https://huggingface.co/nvidia/NV-Embed-v2 | Research/eval only. Not for commercial RAG. |
| **Multilingual-E5-Large** | 94 languages. MIT. | 560M / 1024 dims | https://huggingface.co/intfloat/multilingual-e5-large | Proven multilingual workhorse. Requires query:/passage: prefixes. |
| **mxbai-embed-large-v1** | 8K context. Apache 2.0. | 330M / 1024 dims | https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1 | Long-context + open-source + lightweight. |
| **Jina-embeddings-v3** | 89 languages. 8K context. | 570M / 1024 dims | https://huggingface.co/jinaai/jina-embeddings-v3 | Long-document embedding specialist. |

---

## SECTION 6: AI AGENT FRAMEWORKS

| Framework | What It Does | Language | URL | Why It Matters |
|---|---|---|---|---|
| **LangGraph** (LangChain) | Graph-based state machine for agents. Checkpointing, durable execution, human-in-the-loop. | Python (+JS) | https://github.com/langchain-ai/langgraph | Most production-hardened. Klarna, Uber, LinkedIn run it. Time-travel debugging. Lowest token overhead. |
| **CrewAI** | Role-based multi-agent teams. YAML config. Fastest prototype path. A2A protocol support. | Python | https://github.com/crewAIInc/crewAI | 20 lines to working multi-agent. Best for demos. Token overhead higher at scale. |
| **Google ADK 2.0** | Multi-language (Python, Go, TypeScript). Graph workflows. Native Google Cloud + Vertex AI. | Python, Go, TS | https://github.com/google/adk-python | Best for GCP shops. Enterprise features (IAM, audit logging). |
| **OpenAI Agents SDK** | Minimal agent primitives. Tool calling, handoffs, guardrails, sessions. | Python | https://github.com/openai/openai-agents-python | Easiest learning curve. 16 lines for a working agent. Pre-1.0. |
| **Claude Agent SDK** | Anthropic-native. MCP support. File-system tools. Subagents. Context compaction. | Python, TS | https://github.com/anthropics/claude-agent-sdk | Best if you're all-in on Claude. Computer use capabilities. High token overhead (~35K input). |
| **Mastra** | Full-stack TypeScript agent framework. Production-ready. | TypeScript | https://github.com/mastra-ai/mastra | Best TS framework. 10/10 tool invocation in benchmarks. |
| **Pydantic AI** | Type-safe agents. Native token budget controls. Capabilities system. | Python | https://github.com/pydantic/pydantic-ai | Strongest structured output. Catches bugs at dev time via type system. |
| **DSPy** | Compiler for LLM programs. Optimizes prompts against metrics. | Python | https://github.com/stanfordnlp/dspy | Not an agent framework per se, but powers agent optimization. Provider-agnostic. |
| **AutoGen / AG2** (Microsoft) | Conversational multi-agent. GroupChat pattern. Actor model. **Maintenance mode — no new features.** | Python | https://github.com/microsoft/autogen | Legacy only. Plan migration to LangGraph or CrewAI. |
| **Vercel AI SDK** | AI toolkit for JS/TS apps. Growing agent features. | JS/TS | https://github.com/vercel/ai | Best for Next.js/React apps adding AI. |

### MCP (Model Context Protocol) & A2A Support

| Framework | MCP | A2A |
|---|---|---|
| LangGraph | Build yourself | No |
| CrewAI | Custom tool wrappers | **Native** |
| Google ADK | Partial | Partial |
| OpenAI Agents SDK | Yes | No |
| Claude Agent SDK | **Native** | No |
| Mastra | Yes | No |

---

## SECTION 7: AI CODING ASSISTANTS

| Tool | What It Does | Interface | Stars | URL | Why It Matters |
|---|---|---|---|---|---|
| **Cline** | VS Code agent. Plan/Act mode. Per-action approval. 5M+ installs. | VS Code + CLI | ~60K | https://github.com/cline/cline | Best overall for IDE-first teams. Native subagents (2026). |
| **Aider** | Git-native pair programmer. Every edit = commit. Architect/Editor mode. | Terminal CLI | ~43K | https://github.com/Aider-AI/aider | Best git hygiene. Architect mode: Opus for thinking, Sonnet for writing. Most token-efficient. |
| **OpenHands** (fka OpenDevin) | Autonomous agent in Docker sandbox. Browser + shell + file editor. 72% SWE-bench. | Web UI + CLI + Docker | ~71K | https://github.com/All-Hands-AI/OpenHands | Most autonomous. Fire-and-forget. Highest ceiling, highest ops cost. |
| **Continue** | Autocomplete + chat + agent + inline edit. VS Code + JetBrains. | IDE extension | ~32K | https://github.com/continuedev/continue | Only tool with full VS Code + JetBrains parity. Most customizable. |
| **Goose** | MCP-native agent. Model-agnostic. Block-backed. | CLI / desktop | ~15K | https://github.com/block/goose | Best extensibility via MCP. Compose tools freely. |
| **SWE-agent** | Research benchmark agent. ~100-line core. 74% SWE-bench. | CLI / Python API | ~15K | https://github.com/princeton-nlp/SWE-agent | Research infrastructure, not daily driver. Best for understanding agent scaffolding. |
| **Plandex** | Large multi-file planned changes. Diff sandbox. 2M context tokens. | Terminal | ~10K | https://github.com/plandex-ai/plandex | Best for staged, large refactors. AGPL license. |

### Cost Comparison (60h/month, Sonnet 4.6)

| Tool | Monthly API Cost |
|---|---|
| Aider | ~$80-110 |
| Cline | ~$95-140 |
| OpenHands | ~$120-180 |
| Claude Max (commercial) | $200 unlimited |

---

## SECTION 8: INFERENCE RUNTIMES / ENGINES

| Runtime | What It Does | Formats | Best For | URL | Why It Matters |
|---|---|---|---|---|---|
| **Ollama** | Single-binary local AI. Curated model registry. OpenAI-compatible API. | GGUF | Starting out. Zero friction. | https://github.com/ollama/ollama | Default on-ramp. 130K stars. `ollama run llama3` just works. |
| **llama.cpp** | C/C++ reference inference engine. Most other tools wrap it. | GGUF | Maximum control, edge, mobile. | https://github.com/ggml-org/llama.cpp | 90K stars. The bedrock. Most portable runtime. Every quant improvement propagates everywhere. |
| **vLLM** | PagedAttention + continuous batching. Tensor/pipeline parallelism. | HF safetensors, GPTQ, AWQ, FP8 | Multi-user production serving. | https://github.com/vllm-project/vllm | 16-20× Ollama throughput under concurrent load. The production default. |
| **MLX** | Apple Silicon native. Unified memory optimized. Fine-tuning support. | MLX format | Mac M-series. | https://github.com/ml-explore/mlx | 2-3× faster than llama.cpp Metal on Mac. Only engine that does inference + fine-tuning. |
| **ExLlamaV2** | Fastest single-GPU inference for EXL2 format. Custom CUDA kernels. | EXL2, GPTQ | RTX 4090/5090 max speed. | https://github.com/turboderp/exllamav2 | ~150 tok/s on consumer NVIDIA. r/LocalLLaMA power user choice. |
| **TabbyAPI** | OpenAI-compatible HTTP wrapper for ExLlamaV2. | EXL2 | Serve ExLlamaV2 via API. | https://github.com/turboderp/tabbyAPI | Clean API front-of-house for ExLlamaV2. |
| **LM Studio** | Desktop GUI. Built-in HuggingFace search. Continuous batching (0.4.0+). | GGUF, MLX | Non-technical users, GUI-first. | https://lmstudio.ai | Drag-drop GGUF. Best desktop experience. |
| **Llamafile** | Single portable binary. Runs anywhere. | GGUF | Zero-install deployment. | https://github.com/Mozilla-Ocho/llamafile | Mozilla-backed. Download one file, run on any OS. |
| **LocalAI** | Drop-in OpenAI API replacement. Multi-backend (LLM, embeddings, image gen, Whisper). | GGUF + multimodal | Self-hosted OpenAI replacement. | https://github.com/mudler/LocalAI | Same endpoint serves LLMs, embeddings, image gen, audio. |
| **SGLang** | Radix attention. Structured output. High-throughput. | HF safetensors | Agent-heavy / shared-prefix workloads. | https://github.com/sgl-project/sglang | Best for grammar-constrained decoding. Rising challenger to vLLM. |
| **TensorRT-LLM** | NVIDIA's compiled engine. Highest raw throughput. | TRT engines | Enterprise H100/H200. | https://github.com/NVIDIA/TensorRT-LLM | 10-20% faster than vLLM. Highest setup cost. |
| **Open WebUI** | Self-hosted chat UI. Sits on Ollama or any OpenAI-compatible API. RAG built-in. | N/A (frontend) | Multi-user chat + RAG. | https://github.com/open-webui/open-webui | Document upload, chunking, retrieval — all built in. |
| **AnythingLLM** | Desktop-first AI workspace. Workspace isolation. | N/A (frontend) | Desktop RAG. | https://github.com/Mintplex-Labs/anything-llm | Workspace-style isolation for different document collections. |

### Speed Hierarchy (single-user, same hardware + model)

| Rank | Runtime | Relative Speed |
|---|---|---|
| 1 | ExLlamaV2 (EXL2) | ~150 tok/s (baseline) |
| 2 | TensorRT-LLM | ~140 tok/s (93%) |
| 3 | vLLM (AWQ) | ~120 tok/s (80%) |
| 4 | llama.cpp / Ollama (GGUF Q4) | ~110 tok/s (73%) |
| 5 | MLX (Apple Silicon) | ~82-230 tok/s (Mac-specific) |

### Multi-User Throughput

| Rank | Runtime | Concurrent Performance |
|---|---|---|
| 1 | vLLM | ~5,200-12,500 tok/s (H100) |
| 2 | TensorRT-LLM | ~6,000+ tok/s (H100) |
| 3 | Ollama | ~150 tok/s (serial) |

---

## SECTION 9: FINE-TUNING FRAMEWORKS

| Framework | What It Does | Speed | VRAM (QLoRA 7B) | Stars | URL | Why It Matters |
|---|---|---|---|---|---|---|
| **Unsloth** | Custom Triton kernels. 2-5× faster. 70-80% less VRAM. MoE support (12× on MoE). | 4,200 tok/s | ~8GB | 53K+ | https://github.com/unslothai/unsloth | Fastest single-GPU fine-tuning. Fits 7B QLoRA on RTX 3080 10GB. |
| **LLaMA-Factory** | Web UI. 100+ models. OFT, Megatron-LM, KTransformers. | 1,480 tok/s | ~16GB | 68K+ | https://github.com/hiyouga/LLaMA-Factory | Best for beginners. GUI makes fine-tuning accessible. Widest model support. |
| **Axolotl** | YAML-driven config. Reproducible. Multi-GPU. DeepSpeed + FSDP. | 1,500 tok/s | ~16GB | 11K+ | https://github.com/axolotl-ai-cloud/axolotl | Best production pipeline. Config-driven = version-controlled runs. |
| **TRL** (HuggingFace) | Official RLHF library. GRPO, DPO, PPO, KTO, ORPO. Deep HF ecosystem integration. | 1,450 tok/s | ~18GB | 17K+ | https://github.com/huggingface/trl | The alignment library. GRPO reference implementation. |
| **OpenRLHF** | Distributed RLHF/PPO. Used by DeepSeek, Qwen labs. | N/A | Multi-GPU | ~8K | https://github.com/OpenRLHF/OpenRLHF | Large-scale RL training. |
| **verl** (ByteDance) | Distributed RL for reasoning. | N/A | Multi-GPU | ~5K | https://github.com/volcengine/verl | Used by reasoning model labs. |
| **torchtune** (PyTorch) | PyTorch-native. Transparent recipes. Composable. | Standard | Standard | ~5K | https://github.com/pytorch/torchtune | Full control. Read and modify every line. |
| **PEFT** (HuggingFace) | Unified API for LoRA, QLoRA, DoRA, IA³, prefix tuning. | N/A | N/A | ~15K | https://github.com/huggingface/peft | Specification layer. Defines which params get updated. |

### VRAM for Fine-Tuning (Unsloth vs Standard)

| Method | Unsloth | Standard |
|---|---|---|
| QLoRA 7B | **~5 GB** | ~6-8 GB |
| LoRA 7B | ~12 GB | ~16 GB |
| QLoRA 13B | **~8 GB** | ~10 GB |
| QLoRA 70B | **~38 GB** | ~48 GB |

### Training Methods

| Method | Adoption | Notes |
|---|---|---|
| SFT | ~78% | Foundational |
| LoRA / QLoRA | ~62% | Dominant PEFT |
| DPO | ~38% | Dominant preference tuning |
| GRPO | ~22% | Rising fast for reasoning (DeepSeek technique) |
| PPO | ~14% | Classical RLHF, declining |
| RLVR | ~12% | Tulu 3 pattern, rising for reasoning |
| DoRA | ~7% | Higher-quality LoRA variant |

---

## SECTION 10: TRAINING DATASETS

### Pretraining Corpora

| Dataset | What It Is | Size | License | URL | Why It Matters |
|---|---|---|---|---|---|
| **Common Crawl** | Raw web archive. Foundation of everything. | ~345 TiB per crawl | Public | https://commoncrawl.org/ | The substrate. Every other web dataset derives from it. |
| **FineWeb** (HF) | Best filtered web data. 96 CC dumps, aggressive quality filtering. | ~15-18.5T tokens | ODC-BY | https://huggingface.co/datasets/HuggingFaceFW/fineweb | Most-used open pretraining baseline. Beats RefinedWeb, C4, RedPajama. |
| **FineWeb-Edu** (HF) | Educational subset. LLM classifier filtered. | ~1.3T tokens | ODC-BY | https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu | Quality > quantity. Small models on FW-Edu beat 2× larger on plain FineWeb. |
| **FineWeb 2** (HF) | Expanded multilingual version. | ~10T tokens | ODC-BY | https://huggingface.co/datasets/HuggingFaceFW/fineweb | 500+ languages. |
| **Common Pile** (Allen AI + EleutherAI) | Fully copyright-cleared. | ~8T tokens | Permissive | https://huggingface.co/datasets/a]16z-common-pile | IP-risk-minimized pretraining. |
| **Dolma 3** (Allen AI) | OLMo training corpus. Fully documented provenance. | ~6T tokens | ODC-BY | https://huggingface.co/datasets/allenai/dolma | Most transparently documented dataset. |
| **RedPajama-Data v2** (Together AI) | Largest raw open pretraining dataset. | ~30T tokens | Mixed | https://huggingface.co/datasets/togethercomputer/RedPajama-Data-V2 | Scale leader. Quality filtering varies by use case. |
| **Nemotron-CC** (NVIDIA) | Curated commercial-grade text. | ~6.3T tokens | Multi-license | NVIDIA | Enterprise-grade. |
| **The Pile** (EleutherAI) | 22 diverse sources. Legacy but influential. | 825 GB | MIT | https://pile.eleuther.ai/ | Still valuable for diversity. MIT license. |
| **SlimPajama** (Cerebras) | RedPajama-V1 with extra dedup. | 627B tokens | Apache 2.0 | https://huggingface.co/datasets/cerebras/SlimPajama-627B | Clean, deduplicated web text. |
| **C4** (Google) | Cleaned Common Crawl for T5. Legacy. | ~750 GB | CC BY-SA | https://huggingface.co/datasets/allenai/c4 | Being displaced by FineWeb but still referenced. |

### Code Datasets

| Dataset | What It Is | Size | License | URL | Why It Matters |
|---|---|---|---|---|---|
| **The Stack v2** (BigCode) | Largest open code dataset. 600+ languages. | ~3T tokens, 900 GB+ | Per-document | https://huggingface.co/datasets/bigcode/the-stack-v2 | Powers StarCoder2. Standard code pretraining corpus. |
| **StarCoder Data** | Refined slice of The Stack for StarCoder training. | ~1T tokens | Per-document | https://huggingface.co/bigcode/starcoder | Strongest code-specific training data. |

### Instruction / Fine-Tuning Datasets

| Dataset | What It Is | Size | License | URL | Why It Matters |
|---|---|---|---|---|---|
| **OpenHermes 2.5** | GPT-4-generated instructions. Coding, reasoning, math, chat. | Large | Open | https://huggingface.co/datasets/teknium/OpenHermes-2.5 | One of highest-quality open instruction datasets. Models punch above weight. |
| **FLAN v2** (Google) | Multi-task instruction dataset. Classification, QA, translation. | Multi-task set | CC BY 4.0 | Google | Dramatically stronger zero/few-shot. Flan-t5 backbone. |
| **UltraFeedback** | Preference data. Multiple LLMs scored by GPT-4. | Large | Open | https://huggingface.co/datasets/openbmb/UltraFeedback | Primary dataset behind Zephyr and RLHF-tuned models. |
| **SYNTHETIC-2-SFT-verified** (PrimeIntellect) | Verified reasoning traces from DeepSeek-R1-0528. | 4M samples | Open | https://huggingface.co/datasets/PrimeIntellect/SYNTHETIC-2-SFT-verified | Math, coding, puzzles, instruction following. |
| **Nemotron-Cascade-2-SFT-Data** (NVIDIA) | Massive SFT mixture. Math, science, chat, coding agents. | 15.87M samples | NVIDIA Open Model License | https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data | Largest single SFT dataset in 2026. |
| **Common Corpus** (PleIAs) | Largest open licensed text dataset. 6 collections. | 2.27T tokens | Mixed permissive | https://huggingface.co/datasets/PleIAs/common_corpus | Open-source AI compatible. ICLR 2026 oral. |
| **OpenWebText** | GPT-2-style Reddit-web corpus. | ~38 GB | CC0 | https://huggingface.co/datasets/Skylion007/openwebtext | Public domain web text. |
| **P3** (Public Pool of Prompts) | 27K prompt-response examples for instruction tuning. | ~27K prompts | Apache 2.0 | https://huggingface.co/datasets/bigscience/P3 | Helps models generalize to novel tasks. |
| **MathX-5M** | Advanced mathematical reasoning. Synthetic. | 5.05M samples | Open | https://huggingface.co/datasets/Modotte/MathX-5M | Best open math reasoning dataset. |
| **OpenThoughts3-1.2M** | 850K math, 250K code, 100K science. Annotated with QwQ-32B. | 1.2M samples | Open | https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M | Strong reasoning mixture. |

### Multimodal Datasets

| Dataset | What It Is | Size | URL |
|---|---|---|---|
| **LAION-5B** | 5.8B image-text pairs. CLIP-score filtered. | 5.8B pairs | https://laion.ai/ |
| **DataComp** | 12.8B CC pairs. Competition on filter strategies. | 12.8B pairs | https://datacomp.ai/ |
| **COYO-700M** (Kakao Brain) | Korean-origin image-text dataset. | 700M pairs | https://huggingface.co/datasets/kakaobrain/coyo-700m |

---

## SECTION 11: VRAM QUICK REFERENCE (Your RTX 3080 20GB)

| What You Want to Run | Fits? | Quant | Notes |
|---|---|---|---|
| Qwen3.6-27B | **Yes** | Q4_K_M (~16GB) | Best all-around choice |
| Qwen3.6-35B-A3B | **Yes** | Q4 (~17-20GB) | Tight. Fast decode. |
| DeepSeek-R1-Distill-Qwen-32B | **Tight** | Q4 (~18-20GB) | Best reasoning that fits |
| Gemma 4 31B | **Tight** | Q4 (~17-20GB) | Dense quality but slow |
| Mistral Small 3.2 24B | **Yes** | Q4 (~14GB) | Most headroom |
| Qwen3-VL-8B | **Yes** | Q4 (~5GB) | Best multimodal on 20GB |
| BGE-M3 embedding | **Yes** | FP16 (~1.2GB) | Run alongside LLM |
| QLoRA fine-tune 7B | **Yes** | Unsloth (~5GB) | Leaves room for context |
| Llama 4 Scout | **No** | — | Needs ~55GB minimum |
| DeepSeek V3 671B | **No** | — | API only |
| FLUX.1 Dev FP8 + T5 + CLIP | **Yes** | FP8 (~18.5GB peak) | Your ComfyUI workflow |

---

**End of catalog.** Every entry includes name, purpose, size/resources, URL, and significance. No summarization, no truncation.
