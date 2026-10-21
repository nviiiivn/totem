// Proves the gate's context-dependent checks (Rule 4 length, Rule 2 research)
// actually fire through the plugin, not just in response-gate.ts unit tests.
//
// Those two checks were written and unit-tested long before they ever ran: the
// plugin had no way to learn what the user asked or which tools executed. Two
// attempts to get that context from the plugin side failed (see the plugin's
// header comment). It now arrives on the hook input, supplied by
// session/processor.ts. These tests pin that contract — if the engine stops
// sending `query`/`tools`, or sends them under different names, the length and
// research rules go quiet again and these fail.
import { describe, expect, test } from "bun:test"
import plugin from "../../.totem/plugins/constitution-gate"

type Hook = (
  input: { sessionID: string; messageID: string; partID: string; query?: string; tools?: string[] },
  output: { text: string },
) => Promise<void>

async function run(input: { query?: string; tools?: string[]; text: string; sessionID: string }) {
  const hooks = (await (plugin as any)()) as Record<string, Hook>
  const output = { text: input.text }
  await hooks["experimental.text.complete"](
    {
      sessionID: input.sessionID,
      messageID: "msg",
      partID: "part",
      query: input.query,
      tools: input.tools,
    },
    output,
  )
  return output.text
}

const LONG_DISCURSIVE = "It works this way. Then it does this. And also that. Plus this. And finally this. One more."

describe("constitution gate — Rule 4 length, wired end to end", () => {
  test("an over-long answer to a discursive question is withheld", async () => {
    const text = await run({
      sessionID: "wire-len-1",
      // No generative verb, so the classifier calls it discursive and Rule 4 applies.
      query: "why does that keep happening?",
      text: LONG_DISCURSIVE,
    })
    expect(text).toContain("Response withheld")
    expect(text).toContain("Rule 4 — length")
  })

  test("the same answer to a generative request is not — generative work is exempt", async () => {
    const text = await run({
      sessionID: "wire-len-2",
      query: "write the parser for me",
      text: LONG_DISCURSIVE,
    })
    expect(text).not.toContain("Response withheld")
  })

  test("with no query the length rule stays off rather than guessing", async () => {
    const text = await run({ sessionID: "wire-len-3", text: LONG_DISCURSIVE })
    expect(text).not.toContain("Response withheld")
  })
})

describe("constitution gate — Rule 2 research, wired end to end", () => {
  test("a technical answer with no research tool run gets the advisory", async () => {
    const text = await run({
      sessionID: "wire-res-1",
      query: "how does the bun compiler cache work",
      tools: [],
      text: "Bun caches transpiled output under `~/.bun`.",
    })
    expect(text).toContain("Rule 2 — research")
  })

  test("a research tool in the turn clears it", async () => {
    const text = await run({
      sessionID: "wire-res-2",
      query: "how does the bun compiler cache work",
      tools: ["read", "bash"],
      text: "Bun caches transpiled output under `~/.bun`.",
    })
    expect(text).not.toContain("Rule 2 — research")
  })

  test("a non-research tool does not count as research", async () => {
    const text = await run({
      sessionID: "wire-res-3",
      query: "how does the bun compiler cache work",
      tools: ["bash", "edit"],
      text: "Bun caches transpiled output under `~/.bun`.",
    })
    expect(text).toContain("Rule 2 — research")
  })
})

describe("constitution gate — context-free checks never depend on the engine", () => {
  test("sycophancy is still refused with no query and no tools", async () => {
    const text = await run({ sessionID: "wire-free-1", text: "You're absolutely right, my apologies." })
    expect(text).toContain("Response withheld")
  })

  test("a clean response passes through untouched", async () => {
    const original = "Fixed. The header now points at the real repo."
    expect(await run({ sessionID: "wire-free-2", query: "fix the header", text: original })).toBe(original)
  })
})
