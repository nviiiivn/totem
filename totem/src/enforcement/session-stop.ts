// Carve 3 — Session STOP (TOT3MIC ROADMAP.md Phase 2, carve #3 in the table).
// Fixes: "no kill switch that survives a turn." Once stopped, a session refuses to
// start any new autonomous work (new turns, background jobs, subagent tasks) until
// explicitly resumed. The currently-running work is also force-cancelled immediately.
//
// Structural guarantee for "the agent cannot re-enable itself": `resume()` exists as a
// plain function but is deliberately NOT registered as a tool anywhere in
// src/tool/registry.ts or exposed to the model's tool-calling surface. There is no
// tool the agent can invoke that reaches this function. It is only reachable from a
// genuinely human-originated entry point (a CLI/TUI command, a slash command) —
// wiring that entry point into every face is Phase 3 ("wire it to the faces") per the
// roadmap's own phase structure, not part of this carve. Until that wiring exists,
// `resume()` is only callable by editing state directly or restarting the process —
// which is itself consistent with "agent cannot re-enable itself": nothing short of a
// human action outside the model's own turn can clear a stop.

export interface StopRecord {
  readonly reason?: string
  readonly stoppedAt: number
}

const stopped = new Map<string, StopRecord>()

/** Mark a session as stopped. Call alongside SessionRunState.cancel to kill current work too. */
export function stop(sessionID: string, reason?: string): void {
  stopped.set(sessionID, { reason, stoppedAt: Date.now() })
}

/** Human-only path (see module doc). Never expose this as a tool. */
export function resume(sessionID: string): boolean {
  return stopped.delete(sessionID)
}

export function isStopped(sessionID: string): StopRecord | undefined {
  return stopped.get(sessionID)
}

export class SessionStoppedError extends Error {
  readonly record: StopRecord
  constructor(sessionID: string, record: StopRecord) {
    super(
      `Session ${sessionID} is stopped${record.reason ? ` (${record.reason})` : ""} and cannot start new work. ` +
        `This is a human-only kill switch — it stays in effect until a human resumes it through a genuine ` +
        `human-facing control (not a tool call). Do not attempt to work around this by rephrasing, retrying, ` +
        `or finding an alternate path to the same action.`,
    )
    this.name = "SessionStoppedError"
    this.record = record
  }
}

/** Throws SessionStoppedError if sessionID is currently stopped. Call before starting any new work. */
export function assertNotStoppedForNewWork(sessionID: string): void {
  const record = stopped.get(sessionID)
  if (record) throw new SessionStoppedError(sessionID, record)
}
