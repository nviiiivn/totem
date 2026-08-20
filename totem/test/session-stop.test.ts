import { describe, expect, test } from "bun:test"
import { assertNotStoppedForNewWork, isStopped, resume, SessionStoppedError, stop } from "../src/enforcement/session-stop"

describe("SessionStop (carve 3 — session STOP kill switch)", () => {
  test("a stopped session blocks new work", () => {
    const sid = "stop-test-1"
    stop(sid, "user hit the panic button")
    expect(isStopped(sid)).toBeDefined()
    expect(() => assertNotStoppedForNewWork(sid)).toThrow(SessionStoppedError)
  })

  test("stop is per-session, not global", () => {
    const sidA = "stop-test-2a"
    const sidB = "stop-test-2b"
    stop(sidA)
    expect(isStopped(sidA)).toBeDefined()
    expect(isStopped(sidB)).toBeUndefined()
    expect(() => assertNotStoppedForNewWork(sidB)).not.toThrow()
  })

  test("resume lifts the stop", () => {
    const sid = "stop-test-3"
    stop(sid)
    expect(isStopped(sid)).toBeDefined()
    expect(resume(sid)).toBe(true)
    expect(isStopped(sid)).toBeUndefined()
    expect(() => assertNotStoppedForNewWork(sid)).not.toThrow()
  })

  test("resume on a session that was never stopped is a harmless no-op", () => {
    expect(resume("stop-test-never-stopped")).toBe(false)
  })

  test("resume is not exported from anywhere the tool registry scans (structural check)", () => {
    // The real guarantee lives in code review / architecture, not a runtime check —
    // but assert the module's tool-facing surface doesn't accidentally grow a
    // callable that matches typical tool-export naming conventions.
    const mod = require("../src/enforcement/session-stop") as Record<string, unknown>
    expect(mod.Parameters).toBeUndefined() // tools export a `Parameters` schema; this module must not
    expect(typeof mod.resume).toBe("function") // resume exists...
    // ...but is only reachable by direct import, never via Tool.define / registry.ts scanning,
    // which only picks up files under src/tool/ — this file deliberately lives in src/enforcement/.
  })

  test("an unstopped session is unaffected", () => {
    expect(() => assertNotStoppedForNewWork("stop-test-untouched")).not.toThrow()
  })
})
