import { describe, expect, test } from "bun:test"
import { formatTaskState } from "../src/enforcement/task-state"

describe("TaskState (carve 6 — durable task-state store)", () => {
  test("returns undefined for an empty todo list", () => {
    expect(formatTaskState([])).toBeUndefined()
  })

  test("returns undefined when everything is completed or cancelled", () => {
    expect(
      formatTaskState([
        { content: "done thing", status: "completed", priority: "high" },
        { content: "cancelled thing", status: "cancelled", priority: "low" },
      ]),
    ).toBeUndefined()
  })

  test("includes pending and in_progress items, excludes completed/cancelled", () => {
    const text = formatTaskState([
      { content: "pending thing", status: "pending", priority: "medium" },
      { content: "active thing", status: "in_progress", priority: "high" },
      { content: "done thing", status: "completed", priority: "low" },
    ])
    expect(text).toBeDefined()
    expect(text).toContain("pending thing")
    expect(text).toContain("active thing")
    expect(text).not.toContain("done thing")
  })

  test("marks in_progress items distinctly from pending", () => {
    const text = formatTaskState([
      { content: "waiting", status: "pending", priority: "medium" },
      { content: "working", status: "in_progress", priority: "medium" },
    ])
    expect(text).toContain("[ ] (medium) waiting")
    expect(text).toContain("[~] (medium) working")
  })

  test("signals it comes from the durable store, not history", () => {
    const text = formatTaskState([{ content: "x", status: "pending", priority: "low" }])
    expect(text).toContain("durable_store")
    expect(text).toContain("not from conversation history")
  })
})
