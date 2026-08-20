// Carve 8 — Inverted telemetry (TOT3MIC ROADMAP.md Phase 2, carve #7 in the table).
// Fixes: "retention optimized over delivery." Nothing existing to build on for this one
// (checked: no telemetry/metrics/dedup infrastructure anywhere in src or core — this is
// genuinely greenfield, unlike every other carve).
//
// Scope, deliberately narrow: track EXACT repeats of read-only investigation tools
// (read, grep, glob — same tool, same normalized args) within a session. Not
// write/edit/bash: those have legitimate reasons to repeat (rerunning a test, retrying
// a build) that this carve should never second-guess. A repeat read/grep/glob call is
// close to always pure waste — the answer was already in context.
//
// Any file mutation (edit/write/apply_patch) clears ALL tracked repeats for the
// session, not just entries touching the changed path — coarser than perfect
// per-path invalidation, but safe: it never risks flagging a legitimately-necessary
// re-read as waste after something in the workspace changed.
//
// This is advisory, not a hard block (unlike carves 1/2/4's throws) — the roadmap says
// "penalize," not "prevent." A second identical investigation call still runs; it just
// carries a warning in its own output so the model sees the cost and can self-correct.

const seen = new Map<string, Map<string, number>>()

function store(sessionID: string): Map<string, number> {
  let s = seen.get(sessionID)
  if (!s) {
    s = new Map()
    seen.set(sessionID, s)
  }
  return s
}

function key(tool: string, args: unknown): string {
  return `${tool}:${JSON.stringify(args, Object.keys(args as object).sort())}`
}

/**
 * Record an investigation tool call (read/grep/glob) and return how many times
 * this exact call has now been made in this session (1 = first time, 2+ = a repeat).
 */
export function recordInvestigation(sessionID: string, tool: string, args: unknown): number {
  const s = store(sessionID)
  const k = key(tool, args)
  const count = (s.get(k) ?? 0) + 1
  s.set(k, count)
  return count
}

/** Call from any tool that mutates the workspace (edit, write, apply_patch). */
export function resetOnMutation(sessionID: string): void {
  seen.delete(sessionID)
}

/**
 * Advisory warning to append to a tool's output when `count` indicates a repeat.
 * Returns undefined on the first call (nothing to warn about).
 */
export function formatRepeatWarning(tool: string, count: number): string | undefined {
  if (count < 2) return undefined
  return (
    `\n\n[efficiency] This exact ${tool} call has now been made ${count} times in this session with no file ` +
    `changes in between. The result was already available from the earlier call — re-reading it doesn't add ` +
    `information, it just spends turns. Use what's already in context instead of investigating again.`
  )
}
