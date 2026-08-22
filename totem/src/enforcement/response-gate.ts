// Carve 9 — Response gate (the "gauntlet").
//
// The constitution contains 26 `VIOLATION:` clauses and states outright that
// query classification is a "mandatory gate, runs before every response". None
// of that was enforced by anything: the model was asked to police itself, which
// is the exact failure the autopsy documents. This module makes the gate real.
//
// Two tiers, deliberately:
//
//   CERTAIN  — a machine can be 100% sure the rule was broken (a word count is a
//              word count; a sycophancy phrase is present or it isn't). These
//              are refused outright. No judgment, no benefit of the doubt.
//
//   ADVISORY — the check is real but the machine cannot be sure it's a genuine
//              violation (research *happened*, but was it *enough*?). These are
//              annotated, never refused, because auto-refusing an uncertain
//              signal burns credits on false alarms — the opposite of the point.
//
// Anti-wall-banging: a session that keeps failing the same certain check does
// NOT get to retry forever. After MAX_ATTEMPTS the gate escalates and stops
// refusing — silently looping while burning credits is itself a failure mode.

export type Severity = "certain" | "advisory"

export interface Violation {
  readonly rule: string
  readonly severity: Severity
  readonly detail: string
}

/** Sycophancy / hollow acknowledgment. Constitution Rules 6 and 18 ban these outright. */
const SYCOPHANCY = [
  /\byou'?re (absolutely )?right\b/i,
  /\bmy apologies\b/i,
  /\bi apologize\b/i,
  /\bgreat (question|point|catch)\b/i,
  /\bexcellent (question|point)\b/i,
  /\bgood (catch|question)\b/i,
]

/**
 * Partial / deferred output. Constitution Rule 3: the deliverable must be complete,
 * and the user must never be told to apply part of it by hand.
 */
const PARTIAL_OUTPUT = [
  /\b(add|insert|append|paste) (this|the following|that) (in)?to your\b/i,
  /\/\/\s*\.\.\.\s*(rest|remaining|existing)\b/i,
  /#\s*\.\.\.\s*(rest|remaining|existing)\b/i,
  /\b(rest|remainder) of (the|your) (code|file|implementation) (stays|remains|unchanged)\b/i,
  /\[\s*(rest|remaining) of .{0,40}\s*\]/i,
]

/** Hedging that signals an unverified claim presented as fact. */
const HEDGE = [/\bi think\b/i, /\bprobably\b/i, /\bshould(n't)? be\b/i, /\bi believe\b/i, /\bmight be\b/i]

export interface GateInput {
  readonly text: string
  /** Discursive responses have a length ceiling; generative ones deliberately do not. */
  readonly maxWords?: number
  /** Did any research tool (search/fetch/docs) actually run this turn? */
  readonly researchRan?: boolean
  /** Does the query look technical (triggers the research requirement)? */
  readonly technical?: boolean
  /** Skill names that were available but never invoked. */
  readonly unusedSkills?: readonly string[]
}

export function inspect(input: GateInput): Violation[] {
  const out: Violation[] = []
  const text = input.text ?? ""

  for (const pattern of SYCOPHANCY) {
    const hit = pattern.exec(text)
    if (hit) {
      out.push({
        rule: "Rule 6/18 — sycophancy",
        severity: "certain",
        detail: `Contains hollow acknowledgment: "${hit[0]}". State the correction and move on; do not perform agreement.`,
      })
      break
    }
  }

  for (const pattern of PARTIAL_OUTPUT) {
    const hit = pattern.exec(text)
    if (hit) {
      out.push({
        rule: "Rule 3 — incomplete output",
        severity: "certain",
        detail: `Defers work to the user: "${hit[0]}". Deliver the complete result; never instruct the user to apply part of it by hand.`,
      })
      break
    }
  }

  if (input.maxWords !== undefined) {
    const words = text.trim().split(/\s+/).filter(Boolean).length
    if (words > input.maxWords) {
      out.push({
        rule: "Rule 4 — length",
        severity: "certain",
        detail: `${words} words exceeds the ${input.maxWords}-word ceiling for this response type. Cut it, don't summarize that you'll cut it.`,
      })
    }
  }

  // ADVISORY — real signals, but not proof of a violation on their own.
  if (input.technical && input.researchRan === false) {
    out.push({
      rule: "Rule 2 — research",
      severity: "advisory",
      detail: "Technical response produced with no search/fetch/doc lookup this turn. If this came from memory, verify it before the user relies on it.",
    })
  }

  if (input.technical && !/https?:\/\/|`[^`]+`/.test(text)) {
    out.push({
      rule: "Rule 2 — citation",
      severity: "advisory",
      detail: "Technical claim with no source, path, or code reference. Point at something checkable.",
    })
  }

  const hedge = HEDGE.find((p) => p.test(text))
  if (hedge && input.technical) {
    out.push({
      rule: "Rule 2 — unverified claim",
      severity: "advisory",
      detail: `Hedging language in a technical answer ("${hedge.exec(text)?.[0]}"). Verify and state it plainly, or say explicitly that it is unverified.`,
    })
  }

  if (input.unusedSkills && input.unusedSkills.length > 0) {
    out.push({
      rule: "Rule 2 — available tooling",
      severity: "advisory",
      detail: `Relevant skills were available but not used: ${input.unusedSkills.join(", ")}.`,
    })
  }

  return out
}

/**
 * How many times one session may fail the gate before it stops refusing.
 * Refusing forever would just burn credits banging on the same wall — which the
 * constitution treats as its own failure, not as diligence.
 */
export const MAX_ATTEMPTS = 3

const attempts = new Map<string, number>()

export interface Verdict {
  readonly action: "pass" | "refuse" | "escalate"
  /** Text to substitute for the response, when action is not "pass". */
  readonly replacement?: string
  readonly violations: readonly Violation[]
}

/** Reset a session's strike count. Call when a response passes cleanly. */
export function reset(sessionID: string): void {
  attempts.delete(sessionID)
}

export function evaluate(sessionID: string, input: GateInput): Verdict {
  const violations = inspect(input)
  const certain = violations.filter((v) => v.severity === "certain")
  const advisory = violations.filter((v) => v.severity === "advisory")

  if (certain.length === 0) {
    reset(sessionID)
    if (advisory.length === 0) return { action: "pass", violations }
    // Advisory-only: the response still ships, with the concern attached.
    return {
      action: "pass",
      violations,
      replacement: `${input.text}\n\n${format(advisory, "advisory")}`,
    }
  }

  const count = (attempts.get(sessionID) ?? 0) + 1
  attempts.set(sessionID, count)

  if (count > MAX_ATTEMPTS) {
    // Stop refusing. Ship it, but make the repeated failure visible rather than
    // hiding it — an unfixable loop is information the human needs.
    reset(sessionID)
    return {
      action: "escalate",
      violations,
      replacement:
        `${input.text}\n\n[constitution gate] Failed the same check ${MAX_ATTEMPTS} times and stopped retrying ` +
        `rather than burn more credits on it. Unresolved: ${certain.map((v) => v.rule).join(", ")}. ` +
        `This needs a human look — the model could not self-correct it.`,
    }
  }

  return {
    action: "refuse",
    violations,
    replacement:
      `[constitution gate] Response withheld (attempt ${count}/${MAX_ATTEMPTS}).\n\n` +
      `${format(certain, "certain")}\n\nRewrite it. Do not acknowledge this message — just produce the corrected response.`,
  }
}

function format(violations: readonly Violation[], kind: Severity): string {
  const label = kind === "certain" ? "VIOLATION" : "[advisory]"
  return violations.map((v) => `${label} ${v.rule}: ${v.detail}`).join("\n")
}
