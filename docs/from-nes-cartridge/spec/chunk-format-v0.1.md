# NES Cartridge — Chunk Format Specification v0.1

## Directory Structure

```
cartridge.nescart/
├── cartridge.yaml              # Manifest (validated against schema)
├── chunks/
│   ├── 000001.md               # Chunk files (markdown, UTF-8)
│   ├── 000002.md
│   └── ...
├── embeddings/
│   ├── nomic-v1.5/
│   │   ├── vectors.f32.npy     # Raw vectors: (n_chunks, dim) float32
│   │   ├── index.hnsw          # HNSW index (hnswlib format)
│   │   └── metadata.json       # Chunk ID → vector row mapping
│   └── bge-large-v1.5/
│       ├── vectors.f32.npy
│       ├── index.hnsw
│       └── metadata.json
├── media/                      # Optional original assets
│   ├── source.pdf
│   └── audio.wav
└── distillates/                # Optional derived knowledge
    ├── entities.json           # {chunk_id: [entities]}
    ├── relationships.jsonl     # {subject, predicate, object, chunk_ids}
    ├── summaries.json          # Hierarchical summaries
    └── graph.gml               # NetworkX-compatible graph
```

## Chunk File Format (`chunks/XXXXXX.md`)

Each chunk is a **Markdown file** with frontmatter:

```markdown
---
chunk_id: "000042"
source: "tcpip_guide.pdf"
source_page: 143
section: "TCP Connection Establishment"
token_count: 487
char_count: 1923
hash: "sha256:a1b2c3d4..."
---

# TCP Connection Establishment

The three-way handshake is the procedure used to establish a TCP connection...
```

**Frontmatter fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `chunk_id` | ✅ | Zero-padded 6-digit string |
| `source` | ✅ | Original filename |
| `source_page` | ⚠️ | Page number (if applicable) |
| `section` | ⚠️ | Document section heading |
| `token_count` | ✅ | Tokens per manifest's tokenizer |
| `char_count` | ✅ | UTF-8 character count |
| `hash` | ✅ | SHA256 of chunk content (no frontmatter) |

## Embedding Index Format

### `vectors.f32.npy`
NumPy `.npy` file, shape `(n_chunks, dim)`, dtype `float32`, row-major.
Row `i` corresponds to chunk `chunks/{i+1:06d}.md`.

### `index.hnsw`
HNSW index saved via `hnswlib.Index.save_index()`.
**Must be queryable with the same embedding model.**

### `metadata.json`
```json
{
  "model": "nomic-ai/nomic-embed-text-v1.5",
  "dim": 768,
  "index_type": "hnsw",
  "space": "cosine",
  "params": { "M": 16, "ef_construction": 200 },
  "chunk_count": 12450,
  "chunk_id_to_row": { "000001": 0, "000002": 1, ... }
}
```

## Distillate Formats

### `entities.json`
```json
{
  "000042": ["TCP", "three-way handshake", "SYN", "ACK", "sequence number"],
  "000043": ["TCP", "connection termination", "FIN", "TIME_WAIT"]
}
```

### `relationships.jsonl` (one per line)
```json
{"subject": "TCP", "predicate": "uses", "object": "three-way handshake", "chunk_ids": ["000042"], "confidence": 0.95}
{"subject": "three-way handshake", "predicate": "establishes", "object": "TCP connection", "chunk_ids": ["000042"], "confidence": 0.92}
```

### `summaries.json`
```json
{
  "document": "tcpip_guide.pdf",
  "levels": {
    "section": {
      "TCP Connection Establishment": "Describes the three-way handshake (SYN, SYN-ACK, ACK) used to establish reliable TCP connections..."
    },
    "chapter": {
      "Transport Layer Protocols": "Covers TCP and UDP, including connection management, flow control, congestion control..."
    }
  }
}
```

## Validation Rules

1. **Chunk IDs** must be sequential from `000001` with no gaps
2. **Embedding row count** must equal chunk count
3. **Manifest `source_hashes`** must match actual media files (if present)
4. **All embeddings** listed in manifest must have valid index directories
5. **Token counts** must match manifest's tokenizer (verified on load)

## Compression (Optional)

Cartridges **may** be distributed as `.nescart.zst` (zstd compressed tar):
```bash
tar --zstd -cf cartridge.nescart.zst cartridge.nescart/
# Extract:
tar --zstd -xf cartridge.nescart.zst
```