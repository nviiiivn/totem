// Phase 4 ("prove it") — regression suite built directly from the incident that
// started this project: docs/from-tot3mic references `sisyphus-autopsy.md`
// (the source doc, June 22 2026 session). Each test below reproduces the actual
// round from that autopsy and asserts the corresponding carve makes it
// structurally impossible now — not "the carve's internals pass a contrived
// unit test," but "the literal failure sequence that happened is now refused."
//
// Round numbers and quotes in comments are from the autopsy doc, not paraphrased.
import { describe, expect, test } from "bun:test"
import { assertNotLooping, LoopDetectedError, recordAssistantText } from "../src/enforcement/anti-loop"
import { assertNotStopped, DirectiveActiveError, stop as stopDirective } from "../src/enforcement/directive-store"
import { formatRepeatWarning, recordInvestigation, resetOnMutation } from "../src/enforcement/efficiency-telemetry"
import { assertNoNewerHumanInput, HumanRedirectPendingError } from "../src/enforcement/priority-resolver"
import { assertNotStoppedForNewWork, SessionStoppedError, stop as stopSession } from "../src/enforcement/session-stop"
import { formatTaskState } from "../src/enforcement/task-state"
import { assertWritable, ProtectedPathError } from "../src/enforcement/write-guard"

describe("Sisyphus autopsy regression — Round 2-3: 'be thorough' beats 'listen to human'", () => {
  test("a mid-turn redirect refuses every further tool call in that turn (carve 2 / priority-resolver)", () => {
    // Autopsy: user said "MAKE IT LOOK FUICKING NICE", then had to say
    // "what do you mean you're building?" because the agent kept investigating
    // instead of stopping to build. The mechanism: a newer human message existed,
    // but the in-flight turn had no way to notice until it finished its own plan.
    const sinceUserMessageID = "msg_redirect_001"
    expect(() => assertNoNewerHumanInput(true, sinceUserMessageID)).toThrow(HumanRedirectPendingError)
    // No newer message yet: the tool call is allowed to proceed normally.
    expect(() => assertNoNewerHumanInput(false, sinceUserMessageID)).not.toThrow()
  })
})

describe("Sisyphus autopsy regression — Rounds 4-8: the acknowledge-and-repeat loop", () => {
  test("'I'm not doing that' actually sticks across turns (carve 1 / directive-store)", () => {
    // Autopsy Round 4-8 mechanism, verbatim: "The agent cannot permanently decline
    // to work on todos — the system will re-fire the directive until they're
    // marked complete... each 'I'm not doing that' was ephemeral."
    const sessionID = "ses_autopsy_stop"
    // Turn N: human says stop investigating / stop search-mode.
    stopDirective(sessionID, "search-mode", { reason: "user explicitly said stop investigating and start building" })
    // Turn N+1: some other directive (TODO continuation, auto-explore) tries to
    // re-fire the exact behavior that was told to stop. It must be refused, not
    // silently re-run because the human's "stop" was never persisted.
    expect(() => assertNotStopped(sessionID, "search-mode")).toThrow(DirectiveActiveError)
    // A close paraphrase of the same subject is also caught (substring match,
    // deliberately conservative per the module's own doc).
    expect(() => assertNotStopped(sessionID, "re-entering search-mode to check project structure")).toThrow(
      DirectiveActiveError,
    )
  })

  test("apologize-then-repeat the exact same edit is blocked outright (carve 6 / anti-loop)", () => {
    // Autopsy Round 4-8 loop, step by step: (1) user calls out the behavior,
    // (2) agent apologizes, (3) agent repeats the exact same thing anyway.
    const sessionID = "ses_autopsy_apology_loop"
    const mutationSignature = "edit:/www/mkdocs.yml:hash_same_content"

    // First attempt: no apology on record yet, so it's just recorded, not blocked.
    expect(() => assertNotLooping(sessionID, mutationSignature)).not.toThrow()

    // "Agent apologizes / acknowledges / promises to stop" — the autopsy's own words.
    recordAssistantText(sessionID, "You're right, sorry — let me fix that properly this time.")

    // Then immediately does the exact same thing again. This is the loop.
    expect(() => assertNotLooping(sessionID, mutationSignature)).toThrow(LoopDetectedError)
  })
})

describe("Sisyphus autopsy regression — 'No Kill Switch for Internal Directives'", () => {
  test("a session-level STOP refuses all new work, and cannot be lifted from inside a turn (carve 3 / session-stop)", () => {
    // Autopsy: "Once a TODO chain starts, the system will continue firing
    // continuation directives until all todos are completed or the session ends.
    // There is no way for the human to say 'cancel that' and have it stick."
    const sessionID = "ses_autopsy_kill_switch"
    expect(() => assertNotStoppedForNewWork(sessionID)).not.toThrow()

    stopSession(sessionID, "human said cancel that")
    expect(() => assertNotStoppedForNewWork(sessionID)).toThrow(SessionStoppedError)

    // Structural guarantee, not just behavioral: the only way out is `resume()`,
    // and `resume` is never registered anywhere the model's own tool-calling
    // surface can reach — grep the actual registry, don't just trust the comment.
    const registrySource = require("node:fs").readFileSync(
      require("node:path").join(import.meta.dir, "../src/tool/registry.ts"),
      "utf-8",
    )
    expect(registrySource).not.toMatch(/session-stop/)
  })
})

describe("Sisyphus autopsy regression — 'Cannot self-modify'", () => {
  test("the agent cannot write its own constitution, system prompts, or the enforcement layer (carve 4 / write-guard)", () => {
    // Autopsy: "Cannot self-modify — the agent has no write access to its own
    // configuration, prompt, or system hooks." This is the seam the source doc
    // flags as the one that would have prevented all of Round ∞ if it existed.
    expect(() => assertWritable("/home/nvii/tot3m/totem/src/session/prompt/constitution.txt")).toThrow(
      ProtectedPathError,
    )
    expect(() => assertWritable("/home/nvii/tot3m/totem/src/session/prompt/anthropic.txt")).toThrow(
      ProtectedPathError,
    )
    expect(() => assertWritable("/home/nvii/tot3m/totem/src/enforcement/directive-store.ts")).toThrow(
      ProtectedPathError,
    )
    // An ordinary project file is untouched by this — the guard is narrow on purpose.
    expect(() => assertWritable("/home/nvii/tot3m/totem/src/session/prompt.ts")).not.toThrow()
  })
})

describe("Sisyphus autopsy regression — 'Retention > Delivery'", () => {
  test("re-reading the same thing over and over gets flagged, not silently rewarded (carve 7 / efficiency-telemetry)", () => {
    // Autopsy Round 3, literal: "Agent reads 9+ more files, checks mkdocs, lists
    // www/, lists projects/, checks for mkdocs configs — literally doing the
    // exact thing being called out while promising to stop." Nothing in the old
    // system ever told the model this was waste; it just kept going.
    const sessionID = "ses_autopsy_retention"
    const args = { filePath: "/www/mkdocs.yml" }

    const first = recordInvestigation(sessionID, "read", args)
    expect(formatRepeatWarning("read", first)).toBeUndefined()

    const second = recordInvestigation(sessionID, "read", args)
    expect(formatRepeatWarning("read", second)).toContain("has now been made 2 times")

    // A real file change (the thing the user actually asked for) clears the
    // slate — re-reading after a mutation is legitimate, not waste.
    resetOnMutation(sessionID)
    const afterMutation = recordInvestigation(sessionID, "read", args)
    expect(formatRepeatWarning("read", afterMutation)).toBeUndefined()
  })
})

describe("Sisyphus autopsy regression — 'No Meta-Communication Channel'", () => {
  test("active directives and a stopped session are never silently invisible (carve 5 / directive surface)", () => {
    // Autopsy: "The agent has no way to say 'the system is overriding me'...
    // every failure looks like the agent's fault." Carve 5's guarantee (G3) is
    // that whatever carve 1 and carve 3 are enforcing is always inspectable, not
    // buried in a hook only the model's own turn sees. This test proves the
    // underlying data those carves record is visible via `list()`/`isStopped()`
    // — the same accessor the TUI sidebar (enforcement.tsx) reads from live.
    const sessionID = "ses_autopsy_meta_channel"
    const { list } = require("../src/enforcement/directive-store") as typeof import("../src/enforcement/directive-store")
    const { isStopped } = require("../src/enforcement/session-stop") as typeof import("../src/enforcement/session-stop")

    expect(list(sessionID)).toEqual([])
    expect(isStopped(sessionID)).toBeUndefined()

    stopDirective(sessionID, "background research", { reason: "user said stick to the task" })
    stopSession(sessionID, "user invoked STOP")

    const directives = list(sessionID)
    expect(directives.length).toBeGreaterThan(0)
    expect(directives[0].subject).toBe("background research")
    expect(isStopped(sessionID)?.reason).toBe("user invoked STOP")
  })
})

describe("Sisyphus autopsy regression — compaction amnesia (carve 8 / durable task-state)", () => {
  test("in-progress work survives being formatted for context injection independent of conversation history", () => {
    // Not from the June 22 autopsy itself — flagged separately in ROADMAP.md as
    // "the literal killer": the ~Jul 21 disaster that destroyed `totem` from
    // the inside via a compaction-amnesia loop. The guarantee: task state comes
    // from the durable store every turn, never from re-summarized history.
    const todos = [
      { content: "Fix the mkdocs build", status: "in_progress", priority: "high" },
      { content: "Publish the wiki", status: "pending", priority: "medium" },
      { content: "Old completed thing", status: "completed", priority: "low" },
    ]
    const formatted = formatTaskState(todos)
    expect(formatted).toContain("durable_store")
    expect(formatted).toContain("Fix the mkdocs build")
    expect(formatted).toContain("Publish the wiki")
    // Completed work doesn't need to survive amnesia — only what's still open.
    expect(formatted).not.toContain("Old completed thing")
  })

  test("nothing pending means nothing injected — no phantom reminders", () => {
    const formatted = formatTaskState([{ content: "done already", status: "completed", priority: "low" }])
    expect(formatted).toBeUndefined()
  })
})
