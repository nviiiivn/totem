import { describe, expect, test } from "bun:test"
import type { Manifest } from "../src/manifest"
import { validateManifest } from "../src/manifest"

function validManifest(overrides: Partial<Manifest> = {}): Manifest {
  return {
    spec_version: "0.1",
    id: "urn:cartridge:networking:tcpip-guide:v1",
    title: "TCP/IP Guide",
    chunking: { strategy: "recursive", chunk_size: 1000, overlap: 100, tokenizer: "cl100k_base" },
    embeddings: [{ model: "nomic-embed-text", dim: 768, index_type: "flat", path: "embeddings/nomic-embed-text" }],
    ...overrides,
  }
}

describe("validateManifest", () => {
  test("accepts a well-formed manifest", () => {
    expect(validateManifest(validManifest())).toEqual([])
  })

  test("rejects a malformed cartridge id", () => {
    const issues = validateManifest(validManifest({ id: "not-a-urn" }))
    expect(issues.some((i) => i.field === "id")).toBe(true)
  })

  test("rejects chunk_size out of range", () => {
    const issues = validateManifest(
      validManifest({ chunking: { strategy: "recursive", chunk_size: 9000, overlap: 100, tokenizer: "cl100k_base" } }),
    )
    expect(issues.some((i) => i.field === "chunking.chunk_size")).toBe(true)
  })

  test("rejects empty embeddings array", () => {
    const issues = validateManifest(validManifest({ embeddings: [] }))
    expect(issues.some((i) => i.field === "embeddings")).toBe(true)
  })

  test("rejects embedding dim out of range", () => {
    const issues = validateManifest(
      validManifest({ embeddings: [{ model: "x", dim: 10, index_type: "flat", path: "embeddings/x" }] }),
    )
    expect(issues.some((i) => i.field === "embeddings[0].dim")).toBe(true)
  })

  test("rejects missing title", () => {
    const issues = validateManifest(validManifest({ title: "" }))
    expect(issues.some((i) => i.field === "title")).toBe(true)
  })
})
