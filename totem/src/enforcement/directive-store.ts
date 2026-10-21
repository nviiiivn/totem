// Carve 1 — Stateful directive store (TOT3MIC ROADMAP.md Phase 2, carve #1 in the table).
// Fixes: "directives re-fire per turn, no memory" — once the user says stop doing X,
// X stays suppressed for the rest of the session without needing to be re-stated.
//
// Scope note (honest, not overstated): this module is the storage + enforcement-check
// primitive. It is wired into the shell tool as the first real integration point
// (arbitrary shell commands are the highest-stakes "kept doing X after being told to
// stop" case). Automatic natural-language detection of stop statements from the
// conversation (recognizing "stop doing X" and calling `stop()` for you) is NOT
// implemented here — that needs a hook into the message/prompt pipeline, which is a
// separate, larger integration. For now, `stop()` must be called explicitly (by a tool,
// a hook, or a future carve) with the subject being suppressed.
//
// In-memory, process-lifetime scoped (matches how a totem session actually runs).

export interface Directive {
  readonly subject: string
  readonly reason?: string
  readonly turnRecorded: number
}

const stores = new Map<string, Map<string, Directive>>()

function normalize(subject: string): string {
  return subject.trim().toLowerCase()
}

function storeFor(sessionID: string): Map<string, Directive> {
  let store = stores.get(sessionID)
  if (!store) {
    store = new Map()
    stores.set(sessionID, store)
  }
  return store
}

/** Record that `subject` must stop for the rest of this session. */
export function stop(sessionID: string, subject: string, opts?: { reason?: string; turn?: number }): void {
  const store = storeFor(sessionID)
  const key = normalize(subject)
  store.set(key, {
    subject,
    reason: opts?.reason,
    turnRecorded: opts?.turn ?? store.size,
  })
}

/**
 * Check whether `subject` is currently stopped for this session. Exact-match on the
 * normalized subject, plus a substring check both directions so "stop touching the
 * database" also suppresses a later check for "the database migration script" style
 * partial matches. Deliberately conservative (substring, not fuzzy/semantic) — a
 * false negative here is a real failure, a false positive just double-checks.
 */
export function isStopped(sessionID: string, subject: string): Directive | undefined {
  const store = stores.get(sessionID)
  if (!store) return undefined
  const needle = normalize(subject)
  for (const directive of store.values()) {
    const hay = normalize(directive.subject)
    if (needle === hay || needle.includes(hay) || hay.includes(needle)) return directive
  }
  return undefined
}

/** All active directives for a session, most-recent first. */
export function list(sessionID: string): Directive[] {
  const store = stores.get(sessionID)
  if (!store) return []
  return [...store.values()].sort((a, b) => b.turnRecorded - a.turnRecorded)
}

/** Clear one directive by subject (the human explicitly lifting a prior stop). */
export function clear(sessionID: string, subject: string): boolean {
  const store = stores.get(sessionID)
  if (!store) return false
  return store.delete(normalize(subject))
}

/** Clear every directive for a session (e.g. on Rule 25 re-entry after a hard stop). */
export function clearAll(sessionID: string): void {
  stores.delete(sessionID)
}

export class DirectiveActiveError extends Error {
  readonly directive: Directive
  constructor(subject: string, directive: Directive) {
    super(
      `Refused: "${subject}" matches an active stop directive ("${directive.subject}"${
        directive.reason ? ` — ${directive.reason}` : ""
      }). The user told this session to stop this. It stays stopped until they explicitly lift it — this is not re-askable by re-framing the request.`,
    )
    this.name = "DirectiveActiveError"
    this.directive = directive
  }
}

/** Throws DirectiveActiveError if `description` matches an active stop directive. */
export function assertNotStopped(sessionID: string, description: string): void {
  const hit = isStopped(sessionID, description)
  if (hit) throw new DirectiveActiveError(description, hit)
}
