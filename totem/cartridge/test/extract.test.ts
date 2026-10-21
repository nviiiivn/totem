import { beforeAll, describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { extractImage, rasterizePdf, transcribeImageFile } from "../src/extract"

const VISION_URL = process.env.TOTEM_VISION_BASE_URL ?? "http://localhost:11434"

let visionAvailable = false
beforeAll(async () => {
  try {
    // Reachability alone isn't enough: localhost usually HAS ollama but not a
    // vision model, so these would run and fail instead of skipping. Require the
    // actual model to be present.
    const res = await fetch(`${VISION_URL}/api/tags`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error("unreachable")
    const body = (await res.json()) as { models?: { name?: string }[] }
    visionAvailable = (body.models ?? []).some((m) => (m.name ?? "").includes("deepseek-ocr"))
  } catch {
    visionAvailable = false
  }
})

describe("rasterizePdf", () => {
  test("fails with a clear error when pdftoppm is missing or input is bad", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cartridge-pdf-"))
    try {
      await expect(rasterizePdf(join(dir, "does-not-exist.pdf"), join(dir, "out"))).rejects.toThrow()
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe("transcribeImageFile + extractImage (integration, requires a vision-capable ollama server)", () => {
  let dir: string
  let imagePath: string

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "cartridge-vision-"))
    // 1x1 white PNG — real image bytes, not text-bearing, just proves the
    // request round-trips through ollama without erroring.
    const onePixelPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    )
    imagePath = join(dir, "pixel.png")
    await writeFile(imagePath, onePixelPng)
  })

  test("transcribeImageFile returns a string without throwing", async () => {
    if (!visionAvailable) {
      console.warn("skipping: vision ollama not reachable at " + VISION_URL)
      return
    }
    const text = await transcribeImageFile(imagePath)
    expect(typeof text).toBe("string")
  })

  test("extractImage writes a frontmattered markdown file with the source name", async () => {
    if (!visionAvailable) {
      console.warn("skipping: vision ollama not reachable at " + VISION_URL)
      return
    }
    const stagingDir = join(dir, "staging")
    const outPath = await extractImage(imagePath, stagingDir)
    const matter = (await import("gray-matter")).default
    const parsed = matter(await Bun.file(outPath).text())
    expect(parsed.data.source).toBe("pixel.png")
  })
})
