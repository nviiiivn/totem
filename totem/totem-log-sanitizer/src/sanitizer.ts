export interface SanitizerConfig {
  /** Detect and redact JWT tokens (eyJ...). @default true */
  enableJwtDetection: boolean
  /** Detect and redact bcrypt hashes ($2a$/$2b$/$2y$). @default true */
  enableBcryptDetection: boolean
  /** Detect and redact base64 blobs longer than `maxStringLength`. @default true */
  enableBase64Detection: boolean
  /** Minimum length for base64 blobs to be redacted. @default 300 */
  maxStringLength: number
  /** Emit debug logs for plugin lifecycle and message sanitization. @default false */
  debug: boolean
  /** File path for JSONL debug logs when debug is enabled. */
  debugLogFile: string
}

export const DEFAULT_CONFIG: SanitizerConfig = {
  maxStringLength: 300,
  enableJwtDetection: true,
  enableBcryptDetection: true,
  enableBase64Detection: true,
  debug: false,
  debugLogFile: "~/.local/share/totem/totem-log-sanitizer.debug.log",
}

export function resolveConfig(config?: Partial<SanitizerConfig>): SanitizerConfig {
  if (!config) return DEFAULT_CONFIG
  return { ...DEFAULT_CONFIG, ...config }
}

export interface SanitizeResult {
  text: string
  redactionCount: number
  redactions: {
    jwt: number
    bcrypt: number
    base64: number
  }
}

const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g
const BCRYPT_PATTERN = /\$2[aby]\$\d{2}\$[A-Za-z0-9./]{53}/g
const BASE64_PATTERN_300 = /(?=[A-Za-z0-9+/]*[+/])[A-Za-z0-9+/]{300,}={0,2}/g

const base64PatternCache = new Map<number, RegExp>()

function getBase64Pattern(minLength: number): RegExp {
  if (minLength === 300) return BASE64_PATTERN_300
  let pattern = base64PatternCache.get(minLength)
  if (!pattern) {
    pattern = new RegExp(`(?=[A-Za-z0-9+/]*[+/])[A-Za-z0-9+/]{${minLength},}={0,2}`, "g")
    base64PatternCache.set(minLength, pattern)
  }
  return pattern
}

const NO_REDACT_OPEN = "<no-redact>"
const NO_REDACT_PATTERN = /<no-redact>([\s\S]*?)<\/no-redact>/g

interface NoRedactBlock {
  placeholder: string
  content: string
}

function extractNoRedactBlocks(text: string): { text: string; blocks: NoRedactBlock[] } {
  const blocks: NoRedactBlock[] = []
  const result = text.replace(NO_REDACT_PATTERN, (match) => {
    const placeholder = `__NR${blocks.length}__`
    blocks.push({ placeholder, content: match })
    return placeholder
  })
  return { text: result, blocks }
}

function restoreNoRedactBlocks(text: string, blocks: NoRedactBlock[]): string {
  if (blocks.length === 0) return text
  const map: Record<string, string> = {}
  for (const b of blocks) map[b.placeholder] = b.content
  return text.replace(/__NR\d+__/g, (ph) => map[ph] ?? ph)
}

function redactJwt(text: string): { text: string; count: number } {
  let count = 0
  JWT_PATTERN.lastIndex = 0
  const result = text.replace(JWT_PATTERN, () => {
    count++
    return "[redacted:jwt]"
  })
  return { text: result, count }
}

function redactBcrypt(text: string): { text: string; count: number } {
  let count = 0
  BCRYPT_PATTERN.lastIndex = 0
  const result = text.replace(BCRYPT_PATTERN, () => {
    count++
    return "[redacted:bcrypt]"
  })
  return { text: result, count }
}

function redactBase64(text: string, minLength: number): { text: string; count: number } {
  const pattern = getBase64Pattern(minLength)
  pattern.lastIndex = 0
  let count = 0
  const result = text.replace(pattern, (match) => {
    count++
    return `[redacted:base64:${match.length}chars]`
  })
  return { text: result, count }
}

export function _sanitize(text: string, cfg: SanitizerConfig): SanitizeResult {
  if (!text) {
    return { text, redactionCount: 0, redactions: { jwt: 0, bcrypt: 0, base64: 0 } }
  }
  let totalRedactions = 0
  const redactions = { jwt: 0, bcrypt: 0, base64: 0 }
  const hasNoRedact = text.includes(NO_REDACT_OPEN)
  let current = text
  let blocks: NoRedactBlock[] = []
  if (hasNoRedact) {
    const extracted = extractNoRedactBlocks(text)
    current = extracted.text
    blocks = extracted.blocks
  }
  if (cfg.enableJwtDetection && current.includes("eyJ")) {
    const { text: t, count } = redactJwt(current)
    current = t
    totalRedactions += count
    redactions.jwt += count
  }
  if (cfg.enableBcryptDetection && current.includes("$2")) {
    const { text: t, count } = redactBcrypt(current)
    current = t
    totalRedactions += count
    redactions.bcrypt += count
  }
  if (cfg.enableBase64Detection && (current.includes("+") || current.includes("/"))) {
    const { text: t, count } = redactBase64(current, cfg.maxStringLength)
    current = t
    totalRedactions += count
    redactions.base64 += count
  }
  if (hasNoRedact) {
    current = restoreNoRedactBlocks(current, blocks)
  }
  return { text: current, redactionCount: totalRedactions, redactions }
}

export function sanitize(text: string, config?: Partial<SanitizerConfig>): SanitizeResult {
  return _sanitize(text, resolveConfig(config))
}