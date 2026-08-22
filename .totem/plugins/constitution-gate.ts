// Live wiring for carve 9 (the constitution gate).
//
// Two hooks, because the gate needs context the response alone doesn't carry:
//
//   experimental.chat.messages.transform — fires before the model is called, with
//     the full message list. Used to capture what the user actually asked and
//     whether any research tool ran, keyed by session.
//
//   experimental.text.complete — fires when the model finishes a text block, and
//     whatever this puts back into output.text IS what gets delivered. That makes
//     it the real interception point: a refused response never reaches the user.
//
// Without the first hook the length/research/citation checks are dead code —
// they were, until this wiring landed.
import { classify, isTechnical } from "../../totem/src/enforcement/classify"
import { evaluate } from "../../totem/src/enforcement/response-gate"

/** Rule 4 caps Discursive answers at 2-3 sentences; allow a little slack so a
 *  borderline-but-reasonable answer isn't refused (a false refusal costs credits). */
const DISCURSIVE_SENTENCE_CEILING = 5

/** Tools that count as actually doing research for Rule 2. */
const RESEARCH_TOOLS = /^(websearch|webfetch|search|fetch|read|grep|glob|context7.*|.*_docs)$/i

type Ctx = { query: string; technical: boolean; researchRan: boolean; discursive: boolean }
const context = new Map<string, Ctx>()

function textOf(message: any): string {
  const parts = message?.parts ?? []
  return parts
    .filter((p: any) => p?.type === "text")
    .map((p: any) => p?.text ?? "")
    .join(" ")
}

export default async () => {
  return {
    "experimental.chat.messages.transform": async (_input: unknown, output: { messages: any[] }) => {
      const messages = output?.messages ?? []
      require("fs").appendFileSync("/tmp/gate-debug.log", `TRANSFORM fired, messages=${messages.length}, sample=${JSON.stringify(messages[0]?.info ?? messages[0]).slice(0,200)}\n`)
      if (messages.length === 0) return

      const sessionID = messages.find((m: any) => m?.info?.sessionID)?.info?.sessionID
      if (!sessionID) return

      // The most recent human turn is what the response is answerable against.
      const lastUserIndex = messages.map((m: any) => m?.info?.role).lastIndexOf("user")
      if (lastUserIndex === -1) return
      const query = textOf(messages[lastUserIndex])

      // Did any research tool run since that turn?
      const researchRan = messages.slice(lastUserIndex).some((m: any) =>
        (m?.parts ?? []).some((p: any) => {
          const name = p?.tool ?? p?.toolInvocation?.toolName
          return typeof name === "string" && RESEARCH_TOOLS.test(name)
        }),
      )

      context.set(sessionID, {
        query,
        technical: isTechnical(query),
        researchRan,
        discursive: classify(query) === "discursive",
      })
    },

    "experimental.text.complete": async (
      input: { sessionID: string; messageID: string; partID: string },
      output: { text: string },
    ) => {
      const ctx = context.get(input.sessionID)
      require("fs").appendFileSync("/tmp/gate-debug.log", `COMPLETE sid=${input.sessionID} ctx=${JSON.stringify(ctx)}\n`)
      const verdict = evaluate(input.sessionID, {
        text: output.text,
        technical: ctx?.technical,
        researchRan: ctx?.researchRan,
        maxSentences: ctx?.discursive ? DISCURSIVE_SENTENCE_CEILING : undefined,
      })
      if (verdict.replacement !== undefined) {
        output.text = verdict.replacement
      }
    },
  }
}
