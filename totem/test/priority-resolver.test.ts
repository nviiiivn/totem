import { describe, expect, test } from "bun:test"
import { assertNoNewerHumanInput, HumanRedirectPendingError } from "../src/enforcement/priority-resolver"

describe("PriorityResolver (carve 4 — priority resolver)", () => {
  test("refuses when a newer human message exists", () => {
    expect(() => assertNoNewerHumanInput(true, "msg_001")).toThrow(HumanRedirectPendingError)
  })

  test("allows when no newer human message exists", () => {
    expect(() => assertNoNewerHumanInput(false, "msg_001")).not.toThrow()
  })

  test("error message names the message this turn was responding to", () => {
    try {
      assertNoNewerHumanInput(true, "msg_specific_id")
      throw new Error("should have thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(HumanRedirectPendingError)
      if (e instanceof HumanRedirectPendingError) {
        expect(e.sinceUserMessageID).toBe("msg_specific_id")
        expect(e.message).toContain("msg_specific_id")
      }
    }
  })
})
