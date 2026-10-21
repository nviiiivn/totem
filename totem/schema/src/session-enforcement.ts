export * as SessionEnforcement from "./session-enforcement"

import { Schema } from "effect"
import { define, inventory } from "./event"
import { SessionID } from "./session-id"

// Carve 5 — directive surface (TOT3MIC ROADMAP.md Phase 2, carve #5 in the table).
// A rule you can't see or kill isn't enforced (G3). This exposes carve 1 (directive
// store) and carve 3 (session STOP) state to every face — starting with the TUI.

export const Directive = Schema.Struct({
  subject: Schema.String,
  reason: Schema.optional(Schema.String),
}).annotate({ identifier: "EnforcementDirective" })
export type Directive = typeof Directive.Type

export const Info = Schema.Struct({
  stopped: Schema.Boolean,
  stopReason: Schema.optional(Schema.String),
  directives: Schema.Array(Directive),
}).annotate({ identifier: "EnforcementState" })
export type Info = typeof Info.Type

const Updated = define({
  type: "enforcement.updated",
  schema: {
    sessionID: SessionID,
    state: Info,
  },
})
export const Event = { Updated, Definitions: inventory(Updated) }
