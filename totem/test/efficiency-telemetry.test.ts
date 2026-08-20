import { describe, expect, test } from "bun:test"
import {
  formatRepeatWarning,
  recordInvestigation,
  resetOnMutation,
} from "../src/enforcement/efficiency-telemetry"

describe("EfficiencyTelemetry (carve 8 — inverted telemetry)", () => {
  test("first call returns count 1, no warning", () => {
    const sid = "eff-test-1"
    const count = recordInvestigation(sid, "read", { filePath: "/a.ts" })
    expect(count).toBe(1)
    expect(formatRepeatWarning("read", count)).toBeUndefined()
  })

  test("exact repeat returns incrementing count and a warning", () => {
    const sid = "eff-test-2"
    recordInvestigation(sid, "read", { filePath: "/a.ts" })
    const second = recordInvestigation(sid, "read", { filePath: "/a.ts" })
    expect(second).toBe(2)
    const warning = formatRepeatWarning("read", second)
    expect(warning).toBeDefined()
    expect(warning).toContain("2 times")
    expect(warning).toContain("read")
  })

  test("different args do not count as repeats", () => {
    const sid = "eff-test-3"
    recordInvestigation(sid, "read", { filePath: "/a.ts" })
    const b = recordInvestigation(sid, "read", { filePath: "/b.ts" })
    expect(b).toBe(1)
    expect(formatRepeatWarning("read", b)).toBeUndefined()
  })

  test("key order does not matter — same args in different key order still match", () => {
    const sid = "eff-test-4"
    recordInvestigation(sid, "grep", { pattern: "foo", path: "/src" })
    const second = recordInvestigation(sid, "grep", { path: "/src", pattern: "foo" })
    expect(second).toBe(2)
  })

  test("resetOnMutation clears tracking so the next identical call is treated as first", () => {
    const sid = "eff-test-5"
    recordInvestigation(sid, "read", { filePath: "/a.ts" })
    resetOnMutation(sid)
    const afterReset = recordInvestigation(sid, "read", { filePath: "/a.ts" })
    expect(afterReset).toBe(1)
    expect(formatRepeatWarning("read", afterReset)).toBeUndefined()
  })

  test("tracking is per-session, not global", () => {
    const sidA = "eff-test-6a"
    const sidB = "eff-test-6b"
    recordInvestigation(sidA, "read", { filePath: "/a.ts" })
    const inB = recordInvestigation(sidB, "read", { filePath: "/a.ts" })
    expect(inB).toBe(1)
  })
})
