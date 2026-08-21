import { readdir, readFile, stat } from "node:fs/promises"
import { join } from "node:path"
import matter from "gray-matter"
import { countTokens } from "./chunk"
import type { Manifest } from "./manifest"
import { validateManifest } from "./manifest"

export interface VerifyIssue {
  check: string
  message: string
}

export async function verify(cartridgeDir: string): Promise<VerifyIssue[]> {
  const issues: VerifyIssue[] = []

  const manifestPath = join(cartridgeDir, "cartridge.yaml")
  let manifest: Manifest
  try {
    manifest = Bun.YAML.parse(await readFile(manifestPath, "utf-8")) as Manifest
  } catch (e) {
    return [{ check: "manifest", message: `cannot read/parse cartridge.yaml: ${e}` }]
  }

  for (const i of validateManifest(manifest)) {
    issues.push({ check: "manifest-schema", message: `${i.field}: ${i.message}` })
  }

  const chunksDir = join(cartridgeDir, "chunks")
  let chunkFiles: string[]
  try {
    chunkFiles = (await readdir(chunksDir)).filter((f) => f.endsWith(".md")).sort()
  } catch {
    return [...issues, { check: "chunks", message: `chunks/ directory missing or unreadable` }]
  }

  for (let i = 0; i < chunkFiles.length; i++) {
    const expectedId = String(i + 1).padStart(6, "0")
    if (chunkFiles[i] !== `${expectedId}.md`) {
      issues.push({
        check: "chunk-sequence",
        message: `expected chunks/${expectedId}.md at position ${i}, found ${chunkFiles[i]} (gap or ordering break)`,
      })
    }
  }

  for (const file of chunkFiles) {
    const raw = await readFile(join(chunksDir, file), "utf-8")
    const parsed = matter(raw)
    const fm = parsed.data as Record<string, unknown>
    for (const field of ["chunk_id", "source", "token_count", "char_count", "hash"]) {
      if (!(field in fm)) issues.push({ check: "chunk-frontmatter", message: `${file}: missing required field "${field}"` })
    }
    if (manifest.chunking?.tokenizer === "cl100k_base" && typeof fm.token_count === "number") {
      const actual = countTokens(parsed.content.trim())
      if (actual !== fm.token_count) {
        issues.push({
          check: "token-count",
          message: `${file}: frontmatter token_count=${fm.token_count} but recount=${actual}`,
        })
      }
    }
  }

  for (const entry of manifest.embeddings ?? []) {
    const embeddingDir = join(cartridgeDir, entry.path)
    let metadata: { chunk_count?: number; dim?: number }
    try {
      metadata = JSON.parse(await readFile(join(embeddingDir, "metadata.json"), "utf-8"))
    } catch (e) {
      issues.push({ check: "embedding-dir", message: `${entry.path}: cannot read metadata.json (${e})` })
      continue
    }
    if (metadata.chunk_count !== chunkFiles.length) {
      issues.push({
        check: "embedding-row-count",
        message: `${entry.path}: metadata chunk_count=${metadata.chunk_count} but found ${chunkFiles.length} chunk files`,
      })
    }
    try {
      const npyStat = await stat(join(embeddingDir, "vectors.f32.npy"))
      const expectedBytes = chunkFiles.length * entry.dim * 4
      if (npyStat.size < expectedBytes) {
        issues.push({
          check: "embedding-vectors-size",
          message: `${entry.path}/vectors.f32.npy is ${npyStat.size} bytes, expected at least ${expectedBytes} (n_chunks * dim * 4)`,
        })
      }
    } catch (e) {
      issues.push({ check: "embedding-vectors-missing", message: `${entry.path}: vectors.f32.npy missing (${e})` })
    }
  }

  return issues
}
