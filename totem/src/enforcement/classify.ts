// Query classification for the response gate (carve 9).
//
// The constitution's Definitions section makes classification a "mandatory gate,
// runs before every response", because the rules that apply — especially Rule 4's
// length ceiling — depend entirely on which type the query is.
//
// This classifier is deliberately CONSERVATIVE. A wrong "discursive" call would
// refuse a legitimately long answer and burn credits regenerating something that
// was already correct, so anything ambiguous is treated as generative (no length
// ceiling). Under-enforcing costs a long answer; over-enforcing costs money and
// trust, and the constitution itself treats pointless wall-banging as a failure.

export type QueryType = "discursive" | "generative" | "unknown"

/** Asking for a produced artifact — exempt from the length ceiling (Rule 4). */
const GENERATIVE = [
  /\b(build|write|create|make|implement|add|fix|refactor|generate|install|run|set ?up|configure|update|change|remove|delete|rename|migrate|deploy|test|debug|wire|hook|patch|commit|push)\b/i,
  /\b(show me|give me|list|find|search|check|look|audit|verify|investigate|diagnose)\b/i,
]

/** Asking for language about language — subject to the 2-3 sentence ceiling. */
const DISCURSIVE_OPENERS =
  /^\s*(what|why|how come|is|are|do|does|did|can|could|should|would|who|when|which|explain|tell me|describe|clarify|elaborate|thoughts|opinion)\b/i

export function classify(query: string): QueryType {
  const q = (query ?? "").trim()
  if (q.length === 0) return "unknown"

  // Generative wins on conflict: "explain how to build X" still produces work,
  // and capping that at 3 sentences would be actively wrong.
  if (GENERATIVE.some((p) => p.test(q))) return "generative"
  if (DISCURSIVE_OPENERS.test(q)) return "discursive"
  return "unknown"
}

/** Technical queries trigger Rule 2's research requirement. */
const TECHNICAL =
  /\b(api|cli|config|framework|library|package|npm|bun|node|python|git|docker|server|database|sql|endpoint|protocol|version|install|dependency|compiler|typescript|javascript|rust|binary|plugin|hook|schema|token|auth)\b/i

export function isTechnical(query: string): boolean {
  return TECHNICAL.test(query ?? "")
}
