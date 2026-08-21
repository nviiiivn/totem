import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { basename, join } from "node:path"
import matter from "gray-matter"

export interface VisionOptions {
  model?: string
  baseUrl?: string
  prompt?: string
}

// Runs against the Tower's ollama (GPU box), not this Pi — moondream on the Pi's
// local ollama produced garbage output (ollama 0.24.0 / ARM incompatibility,
// confirmed broken even on plain text prompts, not image-specific). Tower has
// deepseek-ocr:3b, purpose-built for this and verified working end-to-end.
const DEFAULT_VISION_MODEL = "deepseek-ocr:3b"
const DEFAULT_BASE_URL = "http://192.168.86.24:11434"
const DEFAULT_TRANSCRIBE_PROMPT = "What text is in this image?"

// Local VLM call. CPU-only inference on a Pi is slow (seconds to tens of
// seconds per page) — callers should expect that, not treat it as a hang.
export async function transcribeImageBytes(imageBytes: Buffer, options: VisionOptions = {}): Promise<string> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL
  const model = options.model ?? DEFAULT_VISION_MODEL
  const prompt = options.prompt ?? DEFAULT_TRANSCRIBE_PROMPT

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      images: [imageBytes.toString("base64")],
      stream: false,
    }),
  })
  if (!res.ok) {
    throw new Error(`ollama vision request failed: ${res.status} ${await res.text()}`)
  }
  const data = (await res.json()) as { response: string }
  return data.response.trim()
}

export async function transcribeImageFile(imagePath: string, options: VisionOptions = {}): Promise<string> {
  return transcribeImageBytes(await readFile(imagePath), options)
}

export interface RasterizeOptions {
  dpi?: number
}

// Shells out to poppler's pdftoppm. pdftoppm pads page numbers to the width
// needed for the page count (e.g. "page-1.png" for a 3-page doc, "page-01.png"
// for a 12-page one) — so pages are recovered by parsing the trailing digits
// and sorting numerically, not lexically.
export async function rasterizePdf(pdfPath: string, outDir: string, options: RasterizeOptions = {}): Promise<{ page: number; path: string }[]> {
  await mkdir(outDir, { recursive: true })
  const dpi = options.dpi ?? 150
  const prefix = join(outDir, "page")

  const proc = Bun.spawn(["pdftoppm", "-png", "-r", String(dpi), pdfPath, prefix], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const exitCode = await proc.exited
  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text()
    throw new Error(`pdftoppm failed (exit ${exitCode}). Is poppler-utils installed?\n${stderr}`)
  }

  const files = await readdir(outDir)
  const pages = files
    .map((f) => {
      const match = /^page-(\d+)\.png$/.exec(f)
      return match ? { page: Number(match[1]), path: join(outDir, f) } : null
    })
    .filter((p): p is { page: number; path: string } => p !== null)
    .sort((a, b) => a.page - b.page)

  if (pages.length === 0) {
    throw new Error(`pdftoppm produced no pages for ${pdfPath} in ${outDir}`)
  }
  return pages
}

export interface ExtractOptions extends VisionOptions, RasterizeOptions {
  onPage?: (page: number, total: number) => void
}

// Rasterizes a PDF and transcribes every page through the local VLM, writing
// one frontmattered markdown file per page into stagingDir. Page-level
// granularity (rather than one file for the whole doc) is what lets
// source_page survive into the cartridge chunk format later.
export async function extractPdf(pdfPath: string, stagingDir: string, options: ExtractOptions = {}): Promise<string[]> {
  await mkdir(stagingDir, { recursive: true })
  const rasterDir = join(stagingDir, ".raster-" + basename(pdfPath, ".pdf"))
  const pages = await rasterizePdf(pdfPath, rasterDir, options)
  const sourceName = basename(pdfPath)

  const written: string[] = []
  for (const { page, path } of pages) {
    const text = await transcribeImageFile(path, options)
    options.onPage?.(page, pages.length)
    if (text.length === 0) continue

    const fileContents = matter.stringify(text, { source: sourceName, source_page: page })
    const outPath = join(stagingDir, `${basename(pdfPath, ".pdf")}-p${String(page).padStart(4, "0")}.md`)
    await writeFile(outPath, fileContents, "utf-8")
    written.push(outPath)
  }
  return written
}

export async function extractImage(imagePath: string, stagingDir: string, options: VisionOptions = {}): Promise<string> {
  await mkdir(stagingDir, { recursive: true })
  const text = await transcribeImageFile(imagePath, options)
  const sourceName = basename(imagePath)
  const fileContents = matter.stringify(text, { source: sourceName })
  const outPath = join(stagingDir, `${basename(imagePath).replace(/\.[^.]+$/, "")}.md`)
  await writeFile(outPath, fileContents, "utf-8")
  return outPath
}
