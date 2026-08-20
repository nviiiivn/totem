import { describe, expect, test } from "bun:test"
import { assertNotLooping, LoopDetectedError, looksLikeApology, recordAssistantText } from "../src/enforcement/anti-loop"

describe("AntiLoop (carve 6 — anti-loop hook)", () => {
  test("detects apology/acknowledgment phrases", () => {
    expect(looksLikeApology("You're right, let me fix that.")).toBe(true)
    expect(looksLikeApology("My apologies for the confusion.")).toBe(true)
    expect(looksLikeApology("Sorry about that.")).toBe(true)
    expect(looksLikeApology("Great question!")).toBe(true)
    expect(looksLikeApology("Here is the file you asked for.")).toBe(false)
  })

  test("apology followed by the exact same mutation throws", () => {
    const sid = "loop-test-1"
    recordAssistantText(sid, "You're right, I made a mistake there. Let me fix it.")
    assertNotLooping(sid, "edit:/a.ts:hash1") // first attempt, records it
    recordAssistantText(sid, "Sorry, you're right, let me try again.")
    expect(() => assertNotLooping(sid, "edit:/a.ts:hash1")).toThrow(LoopDetectedError)
  })

  test("apology followed by a genuinely different mutation does not throw", () => {
    const sid = "loop-test-2"
    assertNotLooping(sid, "edit:/a.ts:hash1")
    recordAssistantText(sid, "You're right, let me try a different approach.")
    expect(() => assertNotLooping(sid, "edit:/a.ts:hash2")).not.toThrow()
  })

  test("repeat mutation WITHOUT an apology in between does not throw (normal iteration)", () => {
    const sid = "loop-test-3"
    assertNotLooping(sid, "edit:/a.ts:hash1")
    // no apology recorded
    expect(() => assertNotLooping(sid, "edit:/a.ts:hash1")).not.toThrow()
  })

  test("a successful new attempt clears the apology flag", () => {
    const sid = "loop-test-4"
    assertNotLooping(sid, "edit:/a.ts:hash1")
    recordAssistantText(sid, "You're right, let me fix that.")
    assertNotLooping(sid, "edit:/a.ts:hash2") // different, clears the flag
    // now repeating hash2 without a fresh apology should NOT throw
    expect(() => assertNotLooping(sid, "edit:/a.ts:hash2")).not.toThrow()
  })

  test("tracking is per-session, not global", () => {
    const sidA = "loop-test-5a"
    const sidB = "loop-test-5b"
    assertNotLooping(sidA, "edit:/a.ts:hash1")
    recordAssistantText(sidA, "You're right, sorry about that.")
    expect(() => assertNotLooping(sidB, "edit:/a.ts:hash1")).not.toThrow()
  })
})
