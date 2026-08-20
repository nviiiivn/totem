import { describe, expect, test } from "bun:test"
import {
  assertNotStopped,
  clear,
  clearAll,
  DirectiveActiveError,
  isStopped,
  list,
  stop,
} from "../src/enforcement/directive-store"

describe("DirectiveStore (carve 1 — stateful directive store)", () => {
  test("a stopped subject stays stopped across repeated checks in the same session, without re-stating", () => {
    const sid = "test-session-1"
    stop(sid, "running the seed script")

    expect(isStopped(sid, "running the seed script")).toBeDefined()
    // simulate several later turns re-checking the same thing, unprompted
    expect(isStopped(sid, "running the seed script")).toBeDefined()
    expect(isStopped(sid, "running the seed script")).toBeDefined()

    expect(() => assertNotStopped(sid, "running the seed script")).toThrow(DirectiveActiveError)
  })

  test("directives are scoped per-session, not global", () => {
    const sidA = "test-session-2a"
    const sidB = "test-session-2b"
    stop(sidA, "deleting the backups folder")

    expect(isStopped(sidA, "deleting the backups folder")).toBeDefined()
    expect(isStopped(sidB, "deleting the backups folder")).toBeUndefined()
  })

  test("substring matching catches paraphrased re-asks of the same stopped thing", () => {
    const sid = "test-session-3"
    stop(sid, "touching the database")
    expect(isStopped(sid, "touching the database migration script")).toBeDefined()
  })

  test("clearing a specific directive lifts only that one", () => {
    const sid = "test-session-4"
    stop(sid, "editing config.json")
    stop(sid, "running deploy")
    expect(isStopped(sid, "editing config.json")).toBeDefined()

    expect(clear(sid, "editing config.json")).toBe(true)
    expect(isStopped(sid, "editing config.json")).toBeUndefined()
    expect(isStopped(sid, "running deploy")).toBeDefined()
  })

  test("list() returns active directives, most recent first", () => {
    const sid = "test-session-5"
    stop(sid, "first thing")
    stop(sid, "second thing")
    const directives = list(sid)
    expect(directives.length).toBe(2)
    expect(directives[0].subject).toBe("second thing")
  })

  test("clearAll wipes a session's directives (Rule 25 re-entry semantics)", () => {
    const sid = "test-session-6"
    stop(sid, "anything")
    clearAll(sid)
    expect(list(sid).length).toBe(0)
    expect(isStopped(sid, "anything")).toBeUndefined()
  })

  test("an unrelated action is never blocked", () => {
    const sid = "test-session-7"
    stop(sid, "running npm publish")
    expect(() => assertNotStopped(sid, "reading the README")).not.toThrow()
  })
})
