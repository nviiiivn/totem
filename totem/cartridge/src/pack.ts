import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join, relative } from "node:path"
import matter from "gray-matter"
import { chunkMarkdown, countTokens } from "./chunk"
import { embedAll } from "./embed"
import type { Manifest } from "./manifest"
import { validateManifest } from "./manifest"
import { writeNpyFloat32 } from "./npy"

export interface PackOptions {
  inputDir: string
  outputDir: string
  id: string
  title: string
  description?: string
  chunkSize?: number
  overlap?: number
  embeddingModel?: string
  ollamaBaseUrl?: string
}

export interface PackResult {
  manifest: Manifest
  chunkCount: number
  outputDir: string
}

const DEFAULT_CHUNK_SIZE = 1000
const DEFAULT_OVERLAP = 100
const DEFAULT_EMBEDDING_MODEL = "nomic-embed-text"
const SOURCE_EXTENSIONS = ["md", "markdown", "txt"]

export async function pack(options: PackOptions): Promise<PackResult> {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE
  const overlap = options.overlap ?? DEFAULT_OVERLAP
  const embeddingModel = options.embeddingModel ?? DEFAULT_EMBEDDING_MODEL

  const glob = new Bun.Glob(`**/*.{${SOURCE_EXTENSIONS.join(",")}}`)
  const sourceFiles = (await Array.fromAsync(glob.scan({ cwd: options.inputDir }))).sort()
  if (sourceFiles.length === 0) {
    throw new Error(`no ${SOURCE_EXTENSIONS.join("/")} files found under ${options.inputDir}`)
  }

  const chunksDir = join(options.outputDir, "chunks")
  await mkdir(chunksDir, { recursive: true })

  const sourceHashes: Manifest["source_hashes"] = []
  const chunkTexts: string[] = []
  let seq = 1

  for (const relPath of sourceFiles) {
    const absPath = join(options.inputDir, relPath)
    const content = await readFile(absPath, "utf-8")
    const hasher = new Bun.CryptoHasher("sha256")
    hasher.update(content)
    sourceHashes.push({
      algorithm: "sha256",
      hash: hasher.digest("hex"),
      path: relPath,
      size_bytes: Buffer.byteLength(content, "utf-8"),
    })

    // Files staged by the extractor (extract.ts) carry their own frontmatter
    // (source, source_page) — pick that up instead of chunking it as body text,
    // so page numbers survive from PDF extraction through to chunk metadata.
    const parsed = matter(content)
    const source = typeof parsed.data.source === "string" ? parsed.data.source : relPath
    const sourcePage = typeof parsed.data.source_page === "number" ? parsed.data.source_page : undefined

    const rawChunks = chunkMarkdown(parsed.content, { chunkSize, overlap })
    for (const raw of rawChunks) {
      const chunkId = String(seq).padStart(6, "0")
      const contentHasher = new Bun.CryptoHasher("sha256")
      contentHasher.update(raw.text)

      const frontmatter: Record<string, unknown> = {
        chunk_id: chunkId,
        source,
        token_count: countTokens(raw.text),
        char_count: raw.text.length,
        hash: `sha256:${contentHasher.digest("hex")}`,
      }
      if (raw.section) frontmatter.section = raw.section
      if (sourcePage !== undefined) frontmatter.source_page = sourcePage

      const fileContents = matter.stringify(raw.text, frontmatter)
      await writeFile(join(chunksDir, `${chunkId}.md`), fileContents, "utf-8")

      chunkTexts.push(raw.text)
      seq++
    }
  }

  const chunkCount = chunkTexts.length

  const vectors = await embedAll(chunkTexts, { model: embeddingModel, baseUrl: options.ollamaBaseUrl })
  const dim = vectors[0]?.length ?? 0
  if (vectors.some((v) => v.length !== dim)) {
    throw new Error(`embedding model ${embeddingModel} returned inconsistent vector dimensions`)
  }

  const embeddingDirName = embeddingModel.replace(/[^a-zA-Z0-9._-]/g, "-")
  const embeddingDir = join(options.outputDir, "embeddings", embeddingDirName)
  await mkdir(embeddingDir, { recursive: true })

  const npyBuffer = writeNpyFloat32(
    vectors.map((v) => Float32Array.from(v)),
    dim,
  )
  await writeFile(join(embeddingDir, "vectors.f32.npy"), npyBuffer)

  const chunkIdToRow: Record<string, number> = {}
  for (let i = 0; i < chunkCount; i++) chunkIdToRow[String(i + 1).padStart(6, "0")] = i

  await writeFile(
    join(embeddingDir, "metadata.json"),
    JSON.stringify(
      {
        model: embeddingModel,
        dim,
        index_type: "flat",
        space: "cosine",
        chunk_count: chunkCount,
        chunk_id_to_row: chunkIdToRow,
      },
      null,
      2,
    ),
    "utf-8",
  )

  const manifest: Manifest = {
    spec_version: "0.1",
    id: options.id,
    title: options.title,
    description: options.description,
    created: new Date().toISOString(),
    source_hashes: sourceHashes,
    chunking: {
      strategy: "recursive",
      chunk_size: chunkSize,
      overlap,
      tokenizer: "cl100k_base",
    },
    embeddings: [
      {
        model: embeddingModel,
        dim,
        index_type: "flat",
        path: relative(options.outputDir, embeddingDir),
      },
    ],
  }

  const issues = validateManifest(manifest)
  if (issues.length > 0) {
    throw new Error(`generated manifest failed validation:\n${issues.map((i) => `  ${i.field}: ${i.message}`).join("\n")}`)
  }

  await writeFile(join(options.outputDir, "cartridge.yaml"), Bun.YAML.stringify(manifest), "utf-8")

  return { manifest, chunkCount, outputDir: options.outputDir }
}
