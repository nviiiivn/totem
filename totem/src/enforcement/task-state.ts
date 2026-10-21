// Carve 6 — Durable task-state store (TOT3MIC ROADMAP.md Phase 2, carve #8 in the table).
// Fixes: "compaction amnesia (the literal killer)." totem already has a durable,
// compaction-immune task store — the TodoTable, written by the todowrite tool, entirely
// separate from message history (compaction only ever touches message history, never
// this table). The actual gap: nothing ever read it back into context. A model relying
// on re-summarized history after compaction can silently lose track of what it was
// doing — the store existed, it just wasn't consulted.
//
// This carve closes that gap: every turn, the CURRENT todo state is read fresh from the
// durable store and injected into context as its own synthetic reminder — not derived
// from history, not vulnerable to what compaction did or didn't preserve.

import { SessionTodo } from "@totem-ai/schema/session-todo"

/**
 * Formats the current todo list as a synthetic reminder, or undefined if there's
 * nothing worth surfacing (no todos, or everything is completed/cancelled).
 */
export function formatTaskState(todos: SessionTodo.Info[]): string | undefined {
  const active = todos.filter((t) => t.status === "pending" || t.status === "in_progress")
  if (active.length === 0) return undefined

  const marker = (status: string) => (status === "in_progress" ? "[~]" : "[ ]")
  const lines = active.map((t) => `${marker(t.status)} (${t.priority}) ${t.content}`)

  return [
    "<task_state source=\"durable_store\">",
    "This is the current task list read directly from the durable store, not from conversation history.",
    "It is accurate regardless of what compaction may have summarized or dropped. Trust this over any",
    "recollection of tasks from earlier in the conversation.",
    ...lines,
    "</task_state>",
  ].join("\n")
}
