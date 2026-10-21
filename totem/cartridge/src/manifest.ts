export interface SourceHash {
  algorithm: "sha256" | "blake3"
  hash: string
  path: string
  size_bytes?: number
}

export interface EmbeddingEntry {
  model: string
  dim: number
  index_type: "hnsw" | "ivf" | "flat" | "lsh"
  path: string
  index_params?: Record<string, unknown>
  quantization?: "none" | "fp16" | "int8" | "binary"
}

export interface Manifest {
  spec_version: "0.1"
  id: string
  title: string
  description?: string
  license?: string
  created?: string
  updated?: string
  version?: string
  tags?: string[]
  source_hashes?: SourceHash[]
  chunking: {
    strategy: "recursive" | "semantic" | "markdown" | "fixed" | "custom"
    chunk_size: number
    overlap: number
    tokenizer: string
    custom_plugin?: string
  }
  embeddings: EmbeddingEntry[]
}

const CARTRIDGE_ID_PATTERN = /^urn:cartridge:[a-z0-9-]+:[a-z0-9-]+:v\d+(\.\d+)*$/

export interface ManifestIssue {
  field: string
  message: string
}

export function validateManifest(manifest: Manifest): ManifestIssue[] {
  const issues: ManifestIssue[] = []

  if (manifest.spec_version !== "0.1") {
    issues.push({ field: "spec_version", message: `must be "0.1", got ${JSON.stringify(manifest.spec_version)}` })
  }
  if (!CARTRIDGE_ID_PATTERN.test(manifest.id)) {
    issues.push({ field: "id", message: `must match urn:cartridge:<name>:<variant>:v<version>, got ${JSON.stringify(manifest.id)}` })
  }
  if (!manifest.title || manifest.title.length === 0) {
    issues.push({ field: "title", message: "required, non-empty" })
  }
  if (manifest.title && manifest.title.length > 200) {
    issues.push({ field: "title", message: "must be <= 200 chars" })
  }

  const c = manifest.chunking
  if (!c) {
    issues.push({ field: "chunking", message: "required" })
  } else {
    if (c.chunk_size < 64 || c.chunk_size > 8192) issues.push({ field: "chunking.chunk_size", message: "must be 64-8192" })
    if (c.overlap < 0 || c.overlap > 1024) issues.push({ field: "chunking.overlap", message: "must be 0-1024" })
    if (!c.tokenizer) issues.push({ field: "chunking.tokenizer", message: "required" })
  }

  if (!manifest.embeddings || manifest.embeddings.length === 0) {
    issues.push({ field: "embeddings", message: "at least one embedding entry required" })
  } else {
    for (const [i, e] of manifest.embeddings.entries()) {
      if (!e.model) issues.push({ field: `embeddings[${i}].model`, message: "required" })
      if (e.dim < 64 || e.dim > 4096) issues.push({ field: `embeddings[${i}].dim`, message: "must be 64-4096" })
      if (!e.path) issues.push({ field: `embeddings[${i}].path`, message: "required" })
    }
  }

  return issues
}
