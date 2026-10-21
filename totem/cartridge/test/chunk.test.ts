import { describe, expect, test } from "bun:test"
import { chunkMarkdown, countTokens } from "../src/chunk"

describe("chunkMarkdown", () => {
  test("small document under chunk_size stays a single chunk", () => {
    const chunks = chunkMarkdown("# Title\n\nJust a short paragraph.", { chunkSize: 500, overlap: 50 })
    expect(chunks.length).toBe(1)
    expect(chunks[0].section).toBe("Title")
  })

  test("splits on heading boundaries and tracks section per chunk", () => {
    const md = "# A\n\nContent for A.\n\n# B\n\nContent for B."
    const chunks = chunkMarkdown(md, { chunkSize: 500, overlap: 0 })
    expect(chunks.map((c) => c.section)).toEqual(["A", "B"])
  })

  test("large section gets split into multiple chunks under chunk_size", () => {
    const paragraph = "This is a sentence about networking. ".repeat(200)
    const md = `# Big Section\n\n${paragraph}`
    const chunks = chunkMarkdown(md, { chunkSize: 100, overlap: 10 })
    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) {
      expect(countTokens(chunk.text)).toBeLessThanOrEqual(120) // small slack for overlap carryover
    }
  })

  test("no heading document falls back to a single unnamed section", () => {
    const chunks = chunkMarkdown("Just plain text, no headings at all.", { chunkSize: 500, overlap: 0 })
    expect(chunks.length).toBe(1)
    expect(chunks[0].section).toBeUndefined()
  })

  test("consecutive chunks from a split share overlapping trailing content", () => {
    const paragraphs = Array.from({ length: 6 }, (_, i) => `Paragraph number ${i} with some extra padding words here.`)
    const md = `# Section\n\n${paragraphs.join("\n\n")}`
    const chunks = chunkMarkdown(md, { chunkSize: 30, overlap: 15 })
    expect(chunks.length).toBeGreaterThan(1)
    // last paragraph carried into first chunk should also appear at the start of the next
    const firstChunkTail = chunks[0].text.split("\n\n").pop()
    expect(chunks[1].text).toContain(firstChunkTail!)
  })
})
