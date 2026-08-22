// Live wiring for carve 9 (the constitution gate).
//
// `experimental.text.complete` fires when the model finishes a text block, and
// whatever this hook puts back into output.text IS what gets delivered. That
// makes it the real interception point: a refused response never reaches the
// user, it is replaced with the violation and the demand to rewrite.
//
// Context (what was asked, whether research ran) is read here via the same
// client API the session-transcript plugin uses, rather than being captured in
// a second hook. An earlier version tried `experimental.chat.messages.transform`
// for that and the context never arrived — the length/research checks silently
// never fired. One hook that provably works beats two that might.
//
// The gate logic lives in totem/src/enforcement/response-gate.ts and
// classify.ts so both stay unit-testable without booting a session.
import { appendFileSync } from "node:fs"
import { classify, isTechnical } from "../../totem/src/enforcement/classify"
import { evaluate } from "../../totem/src/enforcement/response-gate"

/** Rule 4 caps Discursive answers at 2-3 sentences. A little slack, because a
 *  false refusal costs credits regenerating something that was already fine. */
const DISCURSIVE_SENTENCE_CEILING = 5

/** Tools that count as actually doing research for Rule 2. */
const RESEARCH_TOOLS = /^(websearch|webfetch|search|fetch|read|grep|glob|context7.*|.*_docs)$/i

type Ctx = { technical: boolean; researchRan: boolean; discursive: boolean }

export default async (input: any) => {
  appendFileSync("/tmp/gd.log", `PLUGIN INIT client=${typeof input?.client}\n`)
  // Cache per message id — the hook can fire several times for one response
  // (multiple text parts), and re-fetching the whole transcript each time is waste.
  const cache = new Map<string, Ctx>()

  async function contextFor(sessionID: string, messageID: string): Promise<Ctx | undefined> {
    const cached = cache.get(messageID)
    if (cached) return cached
    try {
      const resp = await input.client.session.messages({ path: { id: sessionID } })
      const messages: any[] = resp?.data ?? []
      const lastUserIndex = messages.map((m) => m?.info?.role).lastIndexOf("user")
      if (lastUserIndex === -1) return undefined

      const query = (messages[lastUserIndex]?.parts ?? [])
        .filter((p: any) => p?.type === "text")
        .map((p: any) => p?.text ?? "")
        .join(" ")

      const researchRan = messages.slice(lastUserIndex).some((m: any) =>
        (m?.parts ?? []).some((p: any) => {
          const name = p?.tool ?? p?.toolInvocation?.toolName
          return typeof name === "string" && RESEARCH_TOOLS.test(name)
        }),
      )

      const ctx: Ctx = {
        technical: isTechnical(query),
        researchRan,
        discursive: classify(query) === "discursive",
      }
      cache.set(messageID, ctx)
      return ctx
    } catch (e) {
      appendFileSync("/tmp/gd.log", `CTX ERROR ${String(e).slice(0,200)}\n`)
      // Never let a context lookup failure block a response. Without context the
      // gate still enforces every check that doesn't need it (sycophancy,
      // incomplete output, Rule 5 padding) — it just can't apply the length or
      // research rules. Degrading quietly beats failing loudly here.
      return undefined
    }
  }

  return {
    "experimental.text.complete": async (
      hookInput: { sessionID: string; messageID: string; partID: string },
      output: { text: string },
    ) => {
      const ctx = await contextFor(hookInput.sessionID, hookInput.messageID)
      appendFileSync("/tmp/gd.log", `COMPLETE ctx=${JSON.stringify(ctx)}\n`)
      const verdict = evaluate(hookInput.sessionID, {
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
