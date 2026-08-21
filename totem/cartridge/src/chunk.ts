import { getEncoding } from "js-tiktoken"

const encoding = getEncoding("cl100k_base")

export function countTokens(text: string): number {
  return encoding.encode(text).length
}

export interface RawChunk {
  text: string
  section?: string
}

export interface ChunkOptions {
  chunkSize: number
  overlap: number
}

// Splits markdown into heading-scoped sections, then recursively subdivides each
// section (paragraph -> sentence -> hard cut) until every piece is <= chunkSize
// tokens, carrying `overlap` tokens of trailing context into the next piece.
export function chunkMarkdown(markdown: string, options: ChunkOptions): RawChunk[] {
  const sections = splitBySections(markdown)
  const chunks: RawChunk[] = []
  for (const section of sections) {
    for (const piece of recursiveSplit(section.text, options)) {
      if (piece.trim().length === 0) continue
      chunks.push({ text: piece.trim(), section: section.heading })
    }
  }
  return chunks
}

interface Section {
  heading?: string
  text: string
}

function splitBySections(markdown: string): Section[] {
  const lines = markdown.split("\n")
  const sections: Section[] = []
  let currentHeading: string | undefined
  let buffer: string[] = []

  const flush = () => {
    const text = buffer.join("\n").trim()
    if (text.length > 0) sections.push({ heading: currentHeading, text })
    buffer = []
  }

  for (const line of lines) {
    const match = /^(#{1,6})\s+(.*)$/.exec(line)
    if (match) {
      flush()
      currentHeading = match[2].trim()
    }
    buffer.push(line)
  }
  flush()

  return sections.length > 0 ? sections : [{ text: markdown }]
}

function recursiveSplit(text: string, options: ChunkOptions): string[] {
  if (countTokens(text) <= options.chunkSize) return [text]

  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0)
  const units = paragraphs.length > 1 ? paragraphs : splitSentences(text)

  const pieces: string[] = []
  let current: string[] = []
  let currentTokens = 0

  for (const unit of units) {
    const unitTokens = countTokens(unit)

    if (unitTokens > options.chunkSize) {
      if (current.length > 0) {
        pieces.push(current.join("\n\n"))
        current = []
        currentTokens = 0
      }
      pieces.push(...hardSplit(unit, options.chunkSize))
      continue
    }

    if (currentTokens + unitTokens > options.chunkSize && current.length > 0) {
      pieces.push(current.join("\n\n"))
      const overlapUnits = takeOverlap(current, options.overlap)
      current = [...overlapUnits, unit]
      currentTokens = countTokens(current.join("\n\n"))
      continue
    }

    current.push(unit)
    currentTokens += unitTokens
  }
  if (current.length > 0) pieces.push(current.join("\n\n"))

  return pieces
}

function takeOverlap(units: string[], overlapTokens: number): string[] {
  if (overlapTokens <= 0) return []
  const kept: string[] = []
  let tokens = 0
  for (let i = units.length - 1; i >= 0; i--) {
    const t = countTokens(units[i])
    if (tokens + t > overlapTokens) break
    kept.unshift(units[i])
    tokens += t
  }
  return kept
}

function splitSentences(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g)
  return sentences && sentences.length > 1 ? sentences.map((s) => s.trim()) : [text]
}

function hardSplit(text: string, chunkSize: number): string[] {
  const words = text.split(/\s+/)
  const pieces: string[] = []
  let current: string[] = []
  for (const word of words) {
    current.push(word)
    if (countTokens(current.join(" ")) >= chunkSize) {
      pieces.push(current.join(" "))
      current = []
    }
  }
  if (current.length > 0) pieces.push(current.join(" "))
  return pieces
}
