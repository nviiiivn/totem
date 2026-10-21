// The engine half of the constitution gate's wiring (carve 9).
//
// `experimental.text.complete` is the only hook that reliably intercepts a
// response, but for most of this project's life it fired with no idea what the
// user had asked or which tools had run — so the gate's Rule 4 (length) and
// Rule 2 (research) checks, though written and unit-tested, never fired in a
// real session. Two plugin-side attempts to recover that context failed:
// `experimental.chat.messages.transform` never delivered it, and reading the
// transcript back through the client from inside the hook is re-entrant (the
// session is still streaming) and hangs the response.
//
// The fix was here, in the processor: capture the user query before the stream
// starts, record tool names as they are called, and hand both to the hook.
// These tests are the proof that it actually arrives — a passing
// constitution-gate-wiring.test.ts only proves the plugin uses the context it
// is given, not that anything gives it any.
import { Database } from "@totem-ai/core/database/database"
import { LayerNode } from "@totem-ai/core/effect/layer-node"
import { EventV2Bridge } from "@/event-v2-bridge"
import { expect } from "bun:test"
import { Effect, Layer, Stream } from "effect"
import path from "path"
import type { Agent } from "../../src/agent/agent"
import { Provider } from "@/provider/provider"
import { Plugin } from "@/plugin"
import { Session } from "@/session/session"
import { LLM } from "../../src/session/llm"
import { SessionProcessor } from "../../src/session/processor"
import { MessageID, PartID, SessionID } from "../../src/session/schema"
import { SessionStatus } from "../../src/session/status"
import { SessionSummary } from "../../src/session/summary"
import { SessionV1 } from "@totem-ai/core/v1/session"
import { CrossSpawnSpawner } from "@totem-ai/core/cross-spawn-spawner"
import { provideTmpdirInstance } from "../fixture/fixture"
import { testEffect } from "../lib/effect"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { ProviderV2 } from "@totem-ai/core/provider"
import { ModelV2 } from "@totem-ai/core/model"
import { SessionProjector } from "@totem-ai/core/session/projector"
import { LLMEvent } from "@totem-ai/llm"

const ref = {
  providerID: ProviderV2.ID.make("test"),
  modelID: ModelV2.ID.make("test-model"),
}

const cfg = {
  provider: {
    test: {
      name: "Test",
      id: "test",
      env: [],
      npm: "@ai-sdk/openai-compatible",
      models: {
        "test-model": {
          id: "test-model",
          name: "Test Model",
          attachment: false,
          reasoning: false,
          temperature: false,
          tool_call: true,
          release_date: "2025-01-01",
          limit: { context: 100000, output: 10000 },
          cost: { input: 0, output: 0 },
          options: {},
        },
      },
      options: { apiKey: "test-key", baseURL: "http://localhost:1/v1" },
    },
  },
}

function agent(): Agent.Info {
  return {
    name: "build",
    mode: "primary",
    builtIn: true,
    topP: undefined,
    temperature: undefined,
    permission: {} as any,
    model: undefined,
    prompt: undefined,
    tools: {},
    options: {},
  } as unknown as Agent.Info
}

/** What the hook was handed. Captured by a stand-in Plugin service. */
type Captured = { sessionID: string; messageID: string; partID: string; query?: string; tools?: string[] }

const captured: Captured[] = []

/**
 * A Plugin service that records `experimental.text.complete` inputs instead of
 * dispatching them. Standing in for the real registry keeps the assertion on
 * the engine's contract rather than on whatever plugins happen to be installed.
 */
const capturingPlugin = Layer.succeed(
  Plugin.Service,
  Plugin.Service.of({
    trigger: ((name: string, input: unknown, output: unknown) =>
      Effect.sync(() => {
        if (name === "experimental.text.complete") captured.push(input as Captured)
        return output
      })) as Plugin.Interface["trigger"],
    list: () => Effect.succeed([]),
    init: () => Effect.void,
  }),
)

const summary = Layer.succeed(
  SessionSummary.Service,
  SessionSummary.Service.of({
    summarize: () => Effect.void,
    diff: () => Effect.succeed([]),
    computeDiff: () => Effect.succeed([]),
  }),
)

/** One turn: a tool runs, then the model produces text. Mirrors a real answer. */
const toolThenTextLLM = Layer.succeed(
  LLM.Service,
  LLM.Service.of({
    stream: () =>
      Stream.make(
        LLMEvent.stepStart({ index: 0 }),
        LLMEvent.toolInputStart({ id: "call-1", name: "read" }),
        LLMEvent.toolInputEnd({ id: "call-1", name: "read" }),
        LLMEvent.toolCall({ id: "call-1", name: "read", input: {}, providerExecuted: true }),
        LLMEvent.toolResult({ id: "call-1", name: "read", result: { type: "text", value: "ok" }, providerExecuted: true }),
        LLMEvent.textStart({ id: "text-1" }),
        LLMEvent.textDelta({ id: "text-1", text: "answer" }),
        LLMEvent.textEnd({ id: "text-1" }),
        LLMEvent.stepFinish({ index: 0, reason: "stop" }),
        LLMEvent.finish({ reason: "stop" }),
      ),
  }),
)

/** Same turn with no tool call — proves `tools` reflects reality, not a default. */
const textOnlyLLM = Layer.succeed(
  LLM.Service,
  LLM.Service.of({
    stream: () =>
      Stream.make(
        LLMEvent.stepStart({ index: 0 }),
        LLMEvent.textStart({ id: "text-1" }),
        LLMEvent.textDelta({ id: "text-1", text: "answer" }),
        LLMEvent.textEnd({ id: "text-1" }),
        LLMEvent.stepFinish({ index: 0, reason: "stop" }),
        LLMEvent.finish({ reason: "stop" }),
      ),
  }),
)

const root = LayerNode.group([
  SessionProcessor.node,
  Session.node,
  SessionProjector.node,
  Provider.node,
  Database.node,
  EventV2Bridge.node,
  SessionStatus.node,
  CrossSpawnSpawner.node,
])

const replacements = [
  LayerNode.replace(SessionSummary.node, summary),
  LayerNode.replace(RuntimeFlags.node, RuntimeFlags.layer({ experimentalEventSystem: true })),
  LayerNode.replace(Plugin.node, capturingPlugin),
]

const withTool = testEffect(
  LayerNode.buildLayer(root, { replacements: [...replacements, LayerNode.replace(LLM.node, toolThenTextLLM)] }),
)
const withoutTool = testEffect(
  LayerNode.buildLayer(root, { replacements: [...replacements, LayerNode.replace(LLM.node, textOnlyLLM)] }),
)

const user = Effect.fn("TestSession.user")(function* (sessionID: SessionID, text: string) {
  const session = yield* Session.Service
  const msg = yield* session.updateMessage({
    id: MessageID.ascending(),
    role: "user",
    sessionID,
    agent: "build",
    model: ref,
    time: { created: Date.now() },
  })
  yield* session.updatePart({ id: PartID.ascending(), messageID: msg.id, sessionID, type: "text", text })
  return msg
})

const assistant = Effect.fn("TestSession.assistant")(function* (
  sessionID: SessionID,
  parentID: MessageID,
  dir: string,
) {
  const session = yield* Session.Service
  const msg: SessionV1.Assistant = {
    id: MessageID.ascending(),
    role: "assistant",
    sessionID,
    mode: "build",
    agent: "build",
    path: { cwd: dir, root: dir },
    cost: 0,
    tokens: { total: 0, input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    modelID: ref.modelID,
    providerID: ref.providerID,
    parentID,
    time: { created: Date.now() },
    finish: "end_turn",
  }
  yield* session.updateMessage(msg)
  return msg
})

const turn = Effect.fn("test.turn")(function* (dir: string, query: string) {
  captured.length = 0
  const processors = yield* SessionProcessor.Service
  const session = yield* Session.Service
  const provider = yield* Provider.Service

  const chat = yield* session.create({})
  const parent = yield* user(chat.id, query)
  const msg = yield* assistant(chat.id, parent.id, path.resolve(dir))
  const mdl = yield* provider.getModel(ref.providerID, ref.modelID)
  const handle = yield* processors.create({ assistantMessage: msg, sessionID: chat.id, model: mdl })

  yield* handle.process({
    user: {
      id: parent.id,
      sessionID: chat.id,
      role: "user",
      time: parent.time,
      agent: parent.agent,
      model: { providerID: ref.providerID, modelID: ref.modelID },
    } satisfies SessionV1.User,
    sessionID: chat.id,
    model: mdl,
    agent: agent(),
    system: [],
    messages: [{ role: "user", content: query }],
    tools: {},
  })

  return captured
})

withTool.live("processor hands the user query to experimental.text.complete", () =>
  provideTmpdirInstance(
    (dir) =>
      Effect.gen(function* () {
        const seen = yield* turn(dir, "why does that keep happening?")
        expect(seen).toHaveLength(1)
        expect(seen[0]?.query).toBe("why does that keep happening?")
      }),
    { config: cfg },
  ),
)

withTool.live("processor reports the tools that actually ran this turn", () =>
  provideTmpdirInstance(
    (dir) =>
      Effect.gen(function* () {
        const seen = yield* turn(dir, "how does the bun compiler cache work")
        expect(seen[0]?.tools).toContain("read")
      }),
    { config: cfg },
  ),
)

withoutTool.live("a turn with no tool calls reports an empty tool list, not a missing one", () =>
  provideTmpdirInstance(
    (dir) =>
      Effect.gen(function* () {
        const seen = yield* turn(dir, "how does the bun compiler cache work")
        // Distinguishing [] from undefined is the whole point: the gate treats a
        // missing list as "no context" and skips Rule 2, but an empty list is
        // positive evidence that no research ran.
        expect(seen[0]?.tools).toEqual([])
      }),
    { config: cfg },
  ),
)
