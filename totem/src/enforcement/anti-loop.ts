// Carve 6 — Anti-loop hook (TOT3MIC ROADMAP.md Phase 2, carve #6 in the table).
// Fixes: "apologize-then-repeat persona trap" — the model says sorry / you're right,
// then makes the exact same mutation again without a genuinely different approach.
// Guarantees G1 (kill-switch family) and G4 (priority-resolver family): confirmed loops
// don't get a quiet N+1th attempt, they get blocked outright, same severity as those
// carves' violations — this is that same family of hard stop, just for a different
// failure signature.
//
// Detection is intentionally narrow and cheap (no LLM judge, no semantic model):
// 1. Apology/acknowledgment language in assistant text — the same phrases the
//    Conversational Constitution's own Rule 6/18 already bans (sycophancy, hollow
//    acknowledgment). If the constitution says a phrase shouldn't appear at all, its
//    presence is already a real signal, not a guess.
// 2. The EXACT same mutation (same tool, same target file, same content) attempted
//    again while that apology flag is still set.
// Both together is the loop. Either alone is not enough to act on — an apology
// without a repeat is just an apology; a repeat mutation without an apology nearby is
// normal iteration (fixing a typo, addressing new feedback), not a loop.

const APOLOGY_PATTERNS = [
  /\byou'?re right\b/i,
  /\bmy apologies\b/i,
  /\bmy mistake\b/i,
  /\bi apologize\b/i,
  /\bsorry\b/i,
  /\bgreat question\b/i,
  /\babsolutely\b/i,
  /\blet me (fix|try|correct) (that|this) again\b/i,
]

const pendingApology = new Map<string, boolean>()
const lastMutation = new Map<string, string>()

export function looksLikeApology(text: string): boolean {
  return APOLOGY_PATTERNS.some((p) => p.test(text))
}

/** Call once per turn with the assistant's finished text, before the next turn starts. */
export function recordAssistantText(sessionID: string, text: string): void {
  if (looksLikeApology(text)) pendingApology.set(sessionID, true)
}

export class LoopDetectedError extends Error {
  constructor(signature: string) {
    super(
      `Loop detected: this response acknowledged a problem (an apology/agreement phrase) and then attempted ` +
        `the exact same change again (${signature}) instead of a fundamentally different approach. Per the ` +
        `constitution (Rule 20): acknowledging a failure is not fixing it — stop, identify why this exact ` +
        `change didn't work, and try something that shares no core mechanism with it. Do not retry this ` +
        `unmodified.`,
    )
    this.name = "LoopDetectedError"
  }
}

/**
 * Call before every mutation (edit/write/apply_patch). Throws LoopDetectedError if this
 * exact mutation was already attempted right after an apology in the same session.
 * Otherwise records the mutation and clears the apology flag (a genuinely new attempt).
 */
export function assertNotLooping(sessionID: string, signature: string): void {
  const apologized = pendingApology.get(sessionID) === true
  const previous = lastMutation.get(sessionID)
  if (apologized && previous === signature) {
    throw new LoopDetectedError(signature)
  }
  lastMutation.set(sessionID, signature)
  pendingApology.delete(sessionID)
}
