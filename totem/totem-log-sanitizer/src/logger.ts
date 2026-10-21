import { appendFile, mkdir } from "fs/promises"
import { homedir } from "os"
import { dirname, join } from "path"

const DEFAULT_LOG_PATH = join(homedir(), ".local", "share", "totem", "totem-log-sanitizer.debug.log")

function resolveLogPath(filePath?: string): string {
  if (!filePath) return DEFAULT_LOG_PATH
  if (filePath.startsWith("~/")) return join(homedir(), filePath.slice(2))
  return filePath
}

async function appendDebugLog(filePath: string, entry: unknown) {
  await mkdir(dirname(filePath), { recursive: true })
  await appendFile(filePath, `${JSON.stringify(entry)}\n`, "utf8")
}

interface LoggerOptions {
  client: { app?: { log?: (body: never) => unknown } }
  enabled: boolean
  filePath?: string
}

export function createDebugLogger(options: LoggerOptions) {
  const filePath = resolveLogPath(options.filePath)
  async function log(level: string, message: string, extra?: unknown) {
    if (!options.enabled) return
    const entry = {
      ts: new Date().toISOString(),
      service: "totem-log-sanitizer",
      level,
      message,
      ...(extra ? { extra } : {}),
    }
    await Promise.allSettled([
      (options.client.app?.log as ((body: unknown) => unknown) | undefined)?.({
        service: "totem-log-sanitizer",
        level,
        message,
        ...(extra ? { extra } : {}),
      }),
      appendDebugLog(filePath, entry),
    ])
  }
  return {
    debug: (message: string, extra?: unknown) => log("debug", message, extra),
    info: (message: string, extra?: unknown) => log("info", message, extra),
    warn: (message: string, extra?: unknown) => log("warn", message, extra),
    error: (message: string, extra?: unknown) => log("error", message, extra),
    filePath,
  }
}