// Live wiring for carve 9 (the constitution gate).
//
// `experimental.text.complete` fires when the model finishes a text block, and
// whatever this hook puts back into output.text IS what gets delivered. That
// makes it the real interception point: a refused response never reaches the
// user, it is replaced with the violation and the demand to rewrite.
//
// Context (what was asked, which tools ran) arrives ON THE HOOK INPUT, supplied
// by the engine. Two earlier approaches failed and are not worth retrying:
//   1. `experimental.chat.messages.transform` — context never arrived, so the
//      length/research checks silently never fired.
//   2. reading the transcript back via `client.session.messages()` from inside
//      this hook — re-entrant, because the hook fires while the session is
//      still streaming. It hangs the response.
// The fix was an engine change: session/processor.ts captures the user query
// before the stream starts and records tool names as they are called, then
// passes both to this hook. See ProcessorContext.query / .tools.
//
// The gate logic lives in totem/src/enforcement/response-gate.ts and
// classify.ts so both stay unit-testable without booting a session.
import { classify, isTechnical } from "../../totem/src/enforcement/classify"
import { evaluate } from "../../totem/src/enforcement/response-gate"

/** Rule 4 caps Discursive answers at 2-3 sentences. A little slack, because a
 *  false refusal costs credits regenerating something that was already fine. */
const DISCURSIVE_SENTENCE_CEILING = 5

/** Tools that count as actually doing research for Rule 2. */
const RESEARCH_TOOLS = /^(websearch|webfetch|search|fetch|read|grep|glob|context7.*|.*_docs)$/i

type HookInput = {
  sessionID: string
  messageID: string
  partID: string
  query?: string
  tools?: string[]
}

export default async () => ({
  "experimental.text.complete": async (input: HookInput, output: { text: string }) => {
    // No query means the engine had nothing to attach (a summary turn, a
    // synthetic continue). The gate still runs every check that needs no
    // context — sycophancy, incomplete output, Rule 5 padding — and simply
    // skips the length and research rules rather than guessing at them.
    const query = input.query
    const technical = query === undefined ? undefined : isTechnical(query)
    const discursive = query !== undefined && classify(query) === "discursive"
    const researchRan =
      query === undefined ? undefined : (input.tools ?? []).some((name) => RESEARCH_TOOLS.test(name))

    const verdict = evaluate(input.sessionID, {
      text: output.text,
      technical,
      researchRan,
      maxSentences: discursive ? DISCURSIVE_SENTENCE_CEILING : undefined,
    })
    if (verdict.replacement !== undefined) {
      output.text = verdict.replacement
    }
  },
})
