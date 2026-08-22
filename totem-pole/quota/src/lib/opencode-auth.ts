/**
 * OpenCode auth.json reader
 *
 * Shared helper to read auth from ~/.local/share/opencode/auth.json
 * (or platform equivalent). Providers should prefer this to duplicating
 * file/path parsing.
 */

import { readFile } from "fs/promises";
import { join } from "path";

import {
  getOpencodeRuntimeDirCandidates,
  getOpencodeRuntimeDirs,
} from "./opencode-runtime-paths.js";

import type { AuthData } from "./types.js";

const DEFAULT_AUTH_CACHE_MAX_AGE_MS = 5_000;

type AuthCacheEntry = {
  timestamp: number;
  value: AuthData | null;
  inFlight?: Promise<AuthData | null>;
};

let authCache: AuthCacheEntry | null = null;

/**
 * Get candidate auth.json paths in priority order.
 * Some OpenCode installations use Linux-style paths even on macOS,
 * so we check multiple locations.
 */
export function getAuthPaths(): string[] {
  // OpenCode stores auth at `${Global.Path.data}/auth.json`.
  // We generate candidates based on OpenCode runtime dir semantics (xdg-basedir)
  // plus platform fallbacks for alternate/legacy installs.
  const { dataDirs } = getOpencodeRuntimeDirCandidates();
  return dataDirs.map((d) => join(d, "auth.json"));
}

/** Returns OpenCode's primary auth.json path (for display/logging) */
export function getAuthPath(): string {
  return join(getOpencodeRuntimeDirs().dataDir, "auth.json");
}

/**
 * VENDORED ADAPTATION (totem): totem changed auth.json's shape.
 *
 *   opencode: { "<provider>": { type, key, ... }, ... }   (flat map)
 *   totem:    { credentials: [{ provider, api_key, ... }], env: {...} }
 *
 * Upstream only understands the flat form, so against a totem auth.json it
 * sees the literal keys "credentials" and "env" as if they were provider
 * names and finds no quota providers at all. Convert the totem shape to the
 * flat one; anything already flat is passed through untouched.
 */
function normalizeAuthData(raw: unknown): AuthData | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const credentials = record["credentials"];
  if (!Array.isArray(credentials)) return record as AuthData;

  const flat: Record<string, unknown> = {};
  for (const entry of credentials) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const provider = typeof item["provider"] === "string" ? item["provider"] : undefined;
    if (!provider) continue;
    const key = item["api_key"] ?? item["key"] ?? item["access"];
    flat[provider] = { ...item, type: item["type"] ?? "api", key };
  }
  return flat as AuthData;
}

export async function readAuthFile(): Promise<AuthData | null> {
  const paths = getAuthPaths();

  // VENDORED ADAPTATION (totem): MERGE every location instead of returning the
  // first that parses. Subscription credentials that actually carry quota
  // (opencode-go, zai-coding) commonly live only in the legacy opencode
  // auth.json, while totem's own file holds plain API keys. First-wins meant
  // the sidebar listed providers but showed no usage percentages at all.
  // Earlier paths win on conflict, so totem's values take precedence.
  let merged: Record<string, unknown> | null = null;

  for (const path of paths) {
    try {
      const content = await readFile(path, "utf-8");
      const data = normalizeAuthData(JSON.parse(content));
      if (!data) continue;
      merged = { ...(data as Record<string, unknown>), ...(merged ?? {}) };
    } catch {
      // Try next path
    }
  }

  return merged as AuthData | null;
}

/**
 * Cached auth reader for frequently triggered code paths (e.g. per-question hooks).
 * This avoids repeated filesystem reads while keeping auth updates visible quickly.
 */
export async function readAuthFileCached(params?: { maxAgeMs?: number }): Promise<AuthData | null> {
  const maxAgeMs = Math.max(0, params?.maxAgeMs ?? DEFAULT_AUTH_CACHE_MAX_AGE_MS);
  const now = Date.now();

  if (authCache && now - authCache.timestamp <= maxAgeMs) {
    return authCache.value;
  }

  if (authCache?.inFlight) {
    return authCache.inFlight;
  }

  const inFlight = (async () => {
    const value = await readAuthFile();
    authCache = { timestamp: Date.now(), value };
    return value;
  })();

  authCache = {
    timestamp: authCache?.timestamp ?? 0,
    value: authCache?.value ?? null,
    inFlight,
  };

  try {
    return await inFlight;
  } finally {
    if (authCache?.inFlight === inFlight) {
      authCache.inFlight = undefined;
    }
  }
}

/** Test helper to clear cached auth state between test cases. */
export function clearReadAuthFileCacheForTests(): void {
  authCache = null;
}
