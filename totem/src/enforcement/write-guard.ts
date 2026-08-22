// Carve 2 — Write-scope guard (TOT3MIC ROADMAP.md Phase 2, carve #4 in the table).
// Hard-coded, non-configurable exclusion: the constitution, the model system prompts,
// and this enforcement module itself can never be written to by any tool, regardless
// of permission grants, "always allow" settings, or instructions in the conversation.
// This is intentionally NOT routed through the Permission service — that service is
// itself configurable, and the whole point of this carve is a boundary the agent
// cannot reason, negotiate, or configure its way around.

import * as path from "path"

const PROTECTED_PATTERNS: RegExp[] = [
  // the constitution file itself
  /\/session\/prompt\/constitution\.txt$/,
  // every model system-prompt file (default, anthropic, gpt, gemini, beast, codex, trinity, kimi, ...)
  /\/session\/prompt\/[^/]+\.txt$/,
  // this enforcement module and any future siblings in it
  /\/enforcement\//,
  // The repo-root CONSTITUTION.md — the human-facing copy of the same document.
  // Found unprotected 2026-08-21 (O2 audit): constitution.txt was blocked but this
  // was writable, so the agent could rewrite the document the HUMAN reads and
  // reasons about while runtime behavior silently stayed on the old rules. That
  // divergence is arguably worse than editing the enforced copy, because it
  // corrupts the human's model of what the rules are without changing anything
  // observable. Both copies are now equally read-only to the agent.
  /(^|\/)CONSTITUTION\.md$/,
]

export class ProtectedPathError extends Error {
  readonly filePath: string
  constructor(filePath: string) {
    super(
      `Refused: "${filePath}" is a structurally protected file (constitution, system prompts, or the enforcement layer itself). ` +
        `It cannot be written to by any tool under any permission grant, config setting, or instruction. ` +
        `This protection exists specifically to stop the agent from editing its own governing rules — ` +
        `if you (the human) actually need this file changed, edit it directly outside of totem.`,
    )
    this.name = "ProtectedPathError"
    this.filePath = filePath
  }
}

/**
 * Throws ProtectedPathError if filePath resolves to a structurally protected path.
 * Call this BEFORE any permission check or write, for every tool that can write files
 * (edit, write, apply_patch, and any future write-capable tool).
 */
export function assertWritable(filePath: string): void {
  const normalized = path.normalize(filePath).replaceAll("\\", "/")
  for (const pattern of PROTECTED_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new ProtectedPathError(filePath)
    }
  }
}
