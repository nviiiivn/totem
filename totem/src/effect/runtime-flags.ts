import { Config, ConfigProvider, Context, Effect, Layer, Option } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string) => Config.boolean(name).pipe(Config.withDefault(false))
const positiveInteger = (name: string) =>
  Config.number(name).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => Config.succeed(undefined)),
  )
const experimental = bool("TOTEM_EXPERIMENTAL")
const enabledByExperimental = (name: string) =>
  Config.all({ experimental, enabled: Config.boolean(name).pipe(Config.option) }).pipe(
    Config.map((flags) => Option.getOrElse(flags.enabled, () => flags.experimental)),
  )

export class Service extends ConfigService.Service<Service>()("@totem/RuntimeFlags", {
  autoShare: bool("TOTEM_AUTO_SHARE"),
  pure: bool("TOTEM_PURE"),
  disableDefaultPlugins: bool("TOTEM_DISABLE_DEFAULT_PLUGINS"),
  disableEmbeddedWebUi: bool("TOTEM_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("TOTEM_DISABLE_EXTERNAL_SKILLS"),
  disableLspDownload: bool("TOTEM_DISABLE_LSP_DOWNLOAD"),
  disableClaudeCodePrompt: Config.all({
    broad: bool("TOTEM_DISABLE_CLAUDE_CODE"),
    direct: bool("TOTEM_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  disableClaudeCodeSkills: Config.all({
    broad: bool("TOTEM_DISABLE_CLAUDE_CODE"),
    direct: bool("TOTEM_DISABLE_CLAUDE_CODE_SKILLS"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("TOTEM_ENABLE_EXA"),
    legacy: bool("TOTEM_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("TOTEM_ENABLE_PARALLEL"),
    legacy: bool("TOTEM_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("TOTEM_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("TOTEM_ENABLE_QUESTION_TOOL"),
  experimentalReferences: enabledByExperimental("TOTEM_EXPERIMENTAL_REFERENCES"),
  experimentalBackgroundSubagents: enabledByExperimental("TOTEM_EXPERIMENTAL_BACKGROUND_SUBAGENTS"),
  experimentalLspTy: bool("TOTEM_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("TOTEM_EXPERIMENTAL_LSP_TOOL"),
  experimentalOxfmt: enabledByExperimental("TOTEM_EXPERIMENTAL_OXFMT"),
  experimentalPlanMode: enabledByExperimental("TOTEM_EXPERIMENTAL_PLAN_MODE"),
  experimentalEventSystem: enabledByExperimental("TOTEM_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalWorkspaces: enabledByExperimental("TOTEM_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("TOTEM_EXPERIMENTAL_ICON_DISCOVERY"),
  outputTokenMax: positiveInteger("TOTEM_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("TOTEM_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  experimentalNativeLlm: bool("TOTEM_EXPERIMENTAL_NATIVE_LLM"),
  experimentalWebSockets: bool("TOTEM_EXPERIMENTAL_WEBSOCKETS"),
  client: Config.string("TOTEM_CLIENT").pipe(Config.withDefault("cli")),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.defaultLayer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const defaultLayer = Service.defaultLayer.pipe(Layer.orDie)

export const node = LayerNode.make(defaultLayer, [])

export * as RuntimeFlags from "./runtime-flags"
import { LayerNode } from "@totem-ai/core/effect/layer-node"
