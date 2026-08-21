import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pack } from "../src/pack"
import { verify } from "../src/verify"

const OLLAMA_URL = "http://localhost:11434"

let ollamaAvailable = false
beforeAll(async () => {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`)
    ollamaAvailable = res.ok
  } catch {
    ollamaAvailable = false
  }
})

describe("pack + verify (integration, requires local ollama)", () => {
  let inputDir: string
  let outputDir: string

  beforeAll(async () => {
    inputDir = await mkdtemp(join(tmpdir(), "cartridge-fixture-"))
    outputDir = join(inputDir, "out.nescart")
    await writeFile(
      join(inputDir, "doc.md"),
      "# Intro\n\nSome introductory content about a topic.\n\n# Details\n\nMore detailed content follows here with extra words to pad it out.",
      "utf-8",
    )
  })

  afterAll(async () => {
    await rm(inputDir, { recursive: true, force: true })
  })

  test("packs a real cartridge and verify reports zero issues", async () => {
    if (!ollamaAvailable) {
      console.warn("skipping: ollama not reachable at " + OLLAMA_URL)
      return
    }
    const result = await pack({
      inputDir,
      outputDir,
      id: "urn:cartridge:test:fixture:v1",
      title: "Fixture Cartridge",
      chunkSize: 500,
      overlap: 50,
    })
    expect(result.chunkCount).toBeGreaterThan(0)
    expect(result.manifest.embeddings[0].dim).toBeGreaterThan(0)

    const issues = await verify(outputDir)
    expect(issues).toEqual([])
  })

  test("verify catches a corrupted chunk_id sequence", async () => {
    if (!ollamaAvailable) {
      console.warn("skipping: ollama not reachable at " + OLLAMA_URL)
      return
    }
    const { rename } = await import("node:fs/promises")
    const badDir = join(inputDir, "bad.nescart")
    await pack({ inputDir, outputDir: badDir, id: "urn:cartridge:test:bad:v1", title: "Bad", chunkSize: 500, overlap: 50 })
    await rename(join(badDir, "chunks", "000002.md"), join(badDir, "chunks", "000009.md"))

    const issues = await verify(badDir)
    expect(issues.some((i) => i.check === "chunk-sequence")).toBe(true)
  })
})
