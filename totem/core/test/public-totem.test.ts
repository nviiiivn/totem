import { describe, expect } from "bun:test"
import { Effect, Schema } from "effect"
import { AbsolutePath, Location, Model, Totem, Session, Tool } from "@totem-ai/core/public"
import { testEffect } from "./lib/effect"

const it = testEffect(Totem.layer)

describe("public native Totem API", () => {
  it.effect("exposes only the intentional Session capabilities", () =>
    Effect.gen(function* () {
      const totem = yield* Totem.Service

      expect(Object.keys(totem).sort()).toEqual(["sessions", "tools"])

      expect(Object.keys(totem.sessions).sort()).toEqual([
        "context",
        "create",
        "events",
        "get",
        "interrupt",
        "list",
        "message",
        "messages",
        "prompt",
        "switchModel",
      ])
      expect(Session.ID.create()).toStartWith("ses_")
      expect(Session.MessageID.create()).toStartWith("msg_")
      expect(yield* totem.sessions.list()).toBeArray()
      yield* totem.tools.register({
        public_tool: Tool.make({
          description: "Public tool",
          input: Schema.Struct({}),
          output: Schema.Struct({ ok: Schema.Boolean }),
          execute: () => Effect.succeed({ ok: true }),
        }),
      })
    }),
  )

  it.effect("records model selection without resolving the Location catalog", () =>
    Effect.gen(function* () {
      const totem = yield* Totem.Service
      const sessionID = Session.ID.make("ses_public_switch_deferred")
      const model = Schema.decodeUnknownSync(Model.Ref)({
        id: "missing",
        providerID: "missing",
        variant: "unknown",
      })
      yield* totem.sessions.create({
        id: sessionID,
        location: Location.Ref.make({ directory: AbsolutePath.make("/public-session-switch-model") }),
      })

      yield* totem.sessions.switchModel({ sessionID, model })

      expect((yield* totem.sessions.get(sessionID)).model).toEqual(model)
    }),
  )

  it.effect("preserves the typed not-found error for a missing Session", () =>
    Effect.gen(function* () {
      const totem = yield* Totem.Service
      const sessionID = Session.ID.make("ses_public_switch_missing")
      const error = yield* totem.sessions
        .switchModel({
          sessionID,
          model: Schema.decodeUnknownSync(Model.Ref)({ id: "claude-sonnet-4-5", providerID: "anthropic" }),
        })
        .pipe(Effect.flip)

      expect(error).toBeInstanceOf(Session.NotFoundError)
      if (error instanceof Session.NotFoundError) expect(error.sessionID).toBe(sessionID)
    }),
  )
})
