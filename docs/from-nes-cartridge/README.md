# NES Cartridge — Knowledge Cartridge Specification & Reference Implementation

> **"It's not a database. It's a cartridge."**

Portable, versioned, multi-tool knowledge packages. Like Docker images for LLM context.

## Vision

```
┌─────────────────────────────────────────────────────────────┐
│  NES CARTRIDGE (.nescart)                                    │
├─────────────────────────────────────────────────────────────┤
│  cartridge.yaml          # manifest (schema v0.1)           │
│  chunks/                 # raw text segments (markdown)     │
│  embeddings/             # pre-computed vectors (per model) │
│    ├── nomic-v1.5/                                         
│    └── bge-large-v1.5/                                     
│  media/                  # original assets (optional)       │
│  distillates/            # derived knowledge (optional)     │
│    ├── entities.json                                       
│    ├── relationships.jsonl                                 
│    └── summaries.json                                      
└─────────────────────────────────────────────────────────────┘
```

## Cartridge Tiers

| Tier | Name | Contents |
|------|------|----------|
| **Game Boy** | Minimal | Chunks only (re-embed on load) |
| **NES** | Standard | Chunks + 1-2 embedding indexes + manifest |
| **Super NES** | Enriched | NES + distillates (KG, summaries, FAQs) |
| **N64** | Multi-modal | Super NES + image/audio embeddings |

## Quickstart

```bash
# Install packager
pip install -e ./packager

# Pack a knowledge cartridge from PDFs/markdown
nes pack ./my_books/ --output ./networking.nescart

# Verify
nes verify ./networking.nescart

# Query from CLI
nes ask "tcp three-way handshake" --cartridge ./networking.nescart

# Use in Python
from nes import Cartridge
cart = Cartridge.load("./networking.nescart")
context = cart.query("subnet mask calculation", budget=4000)
```

## Architecture

```
┌─────────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────────┐
│  INGEST     │──▶│  EXTRACT     │──▶│  CHUNK      │──▶│  EMBED       │
│  (raw files)│   │  (plugins)   │   │  (strategy) │   │  (multi-model)│
└─────────────┘   └──────────────┘   └─────────────┘   └──────────────┘
                                                          │
                                                          ▼
┌─────────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────────┐
│  PACKAGE    │◀──│  DISTILL     │◀──│  ENRICH     │◀──│  INDEX       │
│  (.nescart) │   │  (LLM passes)│   │  (entities, │   │  (HNSW/IVF)  │
└─────────────┘   └──────────────┘   │  relations) │   └──────────────┘
                                     └─────────────┘
```

## Integrations (Planned)

- **OpenWebUI**: "Import Cartridge" button
- **opencode**: Built-in `cartridge` tool
- **Claude Code**: MCP server
- **AnythingLLM**: Workspace connector
- **Custom agents**: Python/TypeScript SDK

## Spec Status

- [ ] v0.1 Draft (manifest schema, chunk format, embedding index format)
- [ ] Reference packager CLI
- [ ] Python client SDK
- [ ] Test corpus validation

## License

MIT — Build cartridges. Share cartridges. Run cartridges anywhere.