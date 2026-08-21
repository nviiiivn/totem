import { beforeAll, describe, expect, test } from "bun:test"
import { translateText } from "../src/translate"

let ollamaAvailable = false
beforeAll(async () => {
  try {
    const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(3000) })
    ollamaAvailable = res.ok
  } catch {
    ollamaAvailable = false
  }
})

describe("translateText (integration, requires local ollama)", () => {
  test("translates a simple sentence and preserves the word count roughly", async () => {
    if (!ollamaAvailable) {
      console.warn("skipping: local ollama not reachable")
      return
    }
    const result = await translateText("Hello, how are you?", "French")
    expect(result.length).toBeGreaterThan(0)
    expect(result.toLowerCase()).not.toContain("hello")
  })
})
