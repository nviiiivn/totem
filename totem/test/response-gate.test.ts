import { describe, expect, test } from "bun:test"
import { evaluate, inspect, MAX_ATTEMPTS, reset } from "../src/enforcement/response-gate"

describe("response gate — certain violations (refused outright)", () => {
  test("sycophancy is caught", () => {
    const v = inspect({ text: "You're absolutely right, let me fix that." })
    expect(v.some((x) => x.severity === "certain" && x.rule.includes("sycophancy"))).toBe(true)
  })

  test("deferring work to the user is caught", () => {
    const v = inspect({ text: "Add this to your config file and it should work." })
    expect(v.some((x) => x.severity === "certain" && x.rule.includes("incomplete"))).toBe(true)
  })

  test("elided code is caught", () => {
    const v = inspect({ text: "function a() {\n  // ... rest of the implementation\n}" })
    expect(v.some((x) => x.severity === "certain")).toBe(true)
  })

  test("over-length discursive response is caught", () => {
    const v = inspect({ text: "word ".repeat(200), maxWords: 50 })
    expect(v.some((x) => x.rule.includes("length"))).toBe(true)
  })

  test("a clean response passes with nothing flagged", () => {
    expect(inspect({ text: "Fixed. The referer header now points at the real repo." })).toEqual([])
  })
})

describe("response gate — advisory (never refused)", () => {
  test("technical answer with no research is advisory, not certain", () => {
    const v = inspect({ text: "Bun caches transpiled output in ~/.bun.", technical: true, researchRan: false })
    const research = v.find((x) => x.rule.includes("research"))
    expect(research?.severity).toBe("advisory")
  })

  test("unused skills are surfaced", () => {
    const v = inspect({ text: "done", unusedSkills: ["pdf", "xlsx"] })
    expect(v.some((x) => x.detail.includes("pdf"))).toBe(true)
  })

  test("advisory-only still ships the response, with the note attached", () => {
    const sid = "gate-advisory-ships"
    const verdict = evaluate(sid, { text: "Bun caches output.", technical: true, researchRan: false })
    expect(verdict.action).toBe("pass")
    expect(verdict.replacement).toContain("Bun caches output.")
    expect(verdict.replacement).toContain("[advisory]")
  })
})

describe("response gate — enforcement and the anti-wall-banging cap", () => {
  test("a certain violation is refused and the original is withheld", () => {
    const sid = "gate-refuse"
    reset(sid)
    const verdict = evaluate(sid, { text: "You're right, sorry about that." })
    expect(verdict.action).toBe("refuse")
    expect(verdict.replacement).toContain("Response withheld")
    // The offending text must NOT be passed through.
    expect(verdict.replacement).not.toContain("sorry about that")
  })

  test("repeated failures escalate instead of looping forever", () => {
    const sid = "gate-escalate"
    reset(sid)
    const bad = { text: "You're right, my apologies." }
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      expect(evaluate(sid, bad).action).toBe("refuse")
    }
    // One past the cap: stop burning credits, surface it to the human instead.
    const final = evaluate(sid, bad)
    expect(final.action).toBe("escalate")
    expect(final.replacement).toContain("stopped retrying")
  })

  test("a clean response clears the strike count", () => {
    const sid = "gate-reset"
    reset(sid)
    evaluate(sid, { text: "You're right." })
    evaluate(sid, { text: "Fixed the header." })
    // Strikes cleared, so the next failure starts from attempt 1 again.
    expect(evaluate(sid, { text: "My apologies." }).replacement).toContain("attempt 1/")
  })

  test("tracking is per-session", () => {
    const a = "gate-sess-a"
    const b = "gate-sess-b"
    reset(a)
    reset(b)
    evaluate(a, { text: "You're right." })
    expect(evaluate(b, { text: "You're right." }).replacement).toContain("attempt 1/")
  })
})
