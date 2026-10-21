// Carve 4 — Priority resolver (TOT3MIC ROADMAP.md Phase 2, carve #2 in the table).
// Fixes: "'be thorough' beats 'listen to human'." A single assistant turn can contain
// many sequential tool calls. If a human sends a redirect mid-turn, totem's outer loop
// (runLoop in session/prompt.ts) only re-reads messages and notices the redirect
// BETWEEN turns — so a turn already in flight would previously grind through every
// tool call it had already planned before the human's new message got a chance to
// matter. This carve checks, before EVERY individual tool call within a turn, whether
// a newer human message has arrived since the turn started. If so, the tool call is
// refused so the turn ends and the outer loop picks up the redirect on its very next
// iteration — instead of after finishing whatever it was already "being thorough" about.
//
// Deliberately checked at every tool call (not just once at turn start) since a redirect
// can land at any point during a multi-tool-call turn.

export class HumanRedirectPendingError extends Error {
  readonly sinceUserMessageID: string
  constructor(sinceUserMessageID: string) {
    super(
      `A newer human message has arrived since this turn started (responding to message ${sinceUserMessageID}). ` +
        `Priority 0: stop executing previously-planned tool calls now. Do not retry this tool call or attempt ` +
        `any other tool call in this turn — the turn is ending so the new human message can be addressed first.`,
    )
    this.name = "HumanRedirectPendingError"
    this.sinceUserMessageID = sinceUserMessageID
  }
}

/** Throws HumanRedirectPendingError if hasNewer is true. Call before every tool execution. */
export function assertNoNewerHumanInput(hasNewer: boolean, sinceUserMessageID: string): void {
  if (hasNewer) throw new HumanRedirectPendingError(sinceUserMessageID)
}
