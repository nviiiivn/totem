/** @jsxImportSource @opentui/solid */

import type { JSX } from "@opentui/solid"
import type {
  TuiPlugin,
  TuiPluginApi,
  TuiSlotContext,
  TuiSlotPlugin,
  TuiPluginModule,
  TuiThemeCurrent,
} from "@totem-ai/plugin/tui"
import type { AssistantMessage, Message } from "@totem-ai/sdk"
import type {
  Part,
  TextPart,
  ToolPart,
  FilePart,
  ReasoningPart,
} from "@totem-ai/sdk/v2"
import { createMemo, createSignal, onCleanup, onMount, Show } from "solid-js"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0
}

function fmt(n: number): string {
  return n.toLocaleString("en-US")
}

function fmtCost(n: number): string {
  if (n >= 1) return "$" + n.toFixed(2)
  if (n >= 0.01) return "$" + n.toFixed(3)
  return "$" + n.toFixed(4)
}

function fmtTokens(n: number): string {
  return fmt(n) + " tokens"
}

// ── token estimation ──
function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0
  let ascii = 0
  let cjk = 0
  for (const c of text) {
    const code = c.codePointAt(0) ?? 0
    if (code >= 0x4E00 && code <= 0x9FFF) cjk++
    else if (code >= 0x3040 && code <= 0x30FF) cjk++
    else if (code >= 0xAC00 && code <= 0xD7A3) cjk++
    else if (code >= 0x1100 && code <= 0x11FF) cjk++
    else if (code >= 0x2E80 && code <= 0x2EFF) cjk++
    else ascii++
  }
  const trimmed = text.trimStart()
  const jsonLike = (trimmed.startsWith("{") || trimmed.startsWith("["))
    && /"[^"]+"\s*:/.test(text)
  const codeLike = !jsonLike
    && /```|^import |^export |^function |^const |^let |^var |^class |^interface |^type |^def |^fn |^pub |^use |^mod |^package /m.test(text)
  const asciiPerToken = jsonLike ? 2 : codeLike ? 2.5 : 4
  return Math.max(1, Math.ceil(ascii / asciiPerToken + cjk / 1.5))
}

interface TokenDist {
  system: number
  user: number
  agent: number
  toolCall: number
  toolResult: number
  output: number
}

// ---------------------------------------------------------------------------
// Sub-agent helpers
// ---------------------------------------------------------------------------

const SUBAGENT_TOOLS = new Set(["task", "delegate", "call_omo_agent"])

// BFS over the session tree: collect every sub-agent session ID reachable from
// the root session, deduped. Sub-agent sessions are discovered from the
// metadata of subtask/task tool parts.
function collectSubagentSids(api: TuiPluginApi, rootSid: string): string[] {
  const sids: string[] = []
  const visited = new Set<string>([rootSid])
  const queue: string[] = [rootSid]
  while (queue.length > 0) {
    const sid = queue.shift()!
    let msgs: Message[] = []
    try { msgs = api.state.session.messages(sid) as Message[] } catch { continue }
    for (const msg of msgs) {
      if (msg.role !== "assistant") continue
      let parts: readonly Part[] = []
      try { parts = api.state.part(msg.id) } catch {}
      for (const p of parts) {
        if (p.type !== "tool") continue
        const tool = String((p as ToolPart).tool ?? "")
        if (!SUBAGENT_TOOLS.has(tool)) continue
        const st = (p as any).state as Record<string, unknown> | undefined
        const stMeta = st?.metadata as Record<string, unknown> | undefined
        const subSid = stMeta?.session_id ?? stMeta?.sessionId
        if (!subSid) continue
        const sidStr = String(subSid)
        if (visited.has(sidStr)) continue
        visited.add(sidStr)
        sids.push(sidStr)
        queue.push(sidStr)
      }
    }
  }
  return sids
}

// Accumulate the token distribution of one session (messages + parts) into `dist`.
function scanSessionDist(api: TuiPluginApi, sid: string, dist: TokenDist): void {
  let msgs: Message[] = []
  try { msgs = api.state.session.messages(sid) as Message[] } catch { return }
  for (const msg of msgs) {
    if (msg.role === "user") {
      const um = msg as any
      if (um.system) dist.system += estimateTokens(um.system)
      let parts: readonly Part[] = []
      try { parts = api.state.part(msg.id) } catch {}
      for (const p of parts) {
        if (p.type === "text" && !(p as any).synthetic && !(p as any).ignored) {
          dist.user += estimateTokens((p as TextPart).text)
        } else if (p.type === "file") {
          const fp = p as unknown as FilePart
          if (fp.source?.text?.value) dist.user += estimateTokens(fp.source.text.value)
        }
      }
    } else if (msg.role === "assistant") {
      const am = msg as AssistantMessage
      dist.output += num(am.tokens?.output)
      let parts: readonly Part[] = []
      try { parts = api.state.part(msg.id) } catch {}
      for (const p of parts) {
        if (p.type === "tool") {
          const tp = p as unknown as ToolPart
          let rawInput = ""
          try {
            rawInput = (tp.state as any).raw ?? JSON.stringify(tp.state.input)
          } catch { try { rawInput = JSON.stringify(tp.state) } catch {} }
          if (rawInput) dist.toolCall += estimateTokens(rawInput)
          if (tp.state.status === "completed") {
            const completed = tp.state as unknown as { output: string }
            if (completed.output) dist.toolResult += estimateTokens(completed.output)
          } else if (tp.state.status === "error") {
            const errored = tp.state as unknown as { error: string }
            if (errored.error) dist.toolResult += estimateTokens(errored.error)
          }
        } else if (p.type === "reasoning") {
          dist.agent += estimateTokens((p as unknown as ReasoningPart).text)
        } else if (p.type === "subtask") {
          const sub = p as unknown as { prompt: string; description: string }
          dist.agent += estimateTokens(sub.prompt || sub.description || "")
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Row component: label left, value right
// ---------------------------------------------------------------------------

function Row(props: { label: string; value: string; color?: string; mutedColor: string }): JSX.Element {
  return (
    <box flexDirection="row" justifyContent="space-between" paddingLeft={0} paddingRight={0}>
      <text fg={props.color ?? props.mutedColor}>{props.label}</text>
      <text fg={props.color ?? props.mutedColor}>{props.value}</text>
    </box>
  )
}

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

function TokenCachePanel(props: {
  theme: TuiThemeCurrent
  api: TuiPluginApi
  sessionId: string
}): JSX.Element {
  const [partVersion, setPartVersion] = createSignal(0)

  // ── scan session messages reactively ──
  const data = createMemo(() => {
    const msgs = props.api.state.session.messages(props.sessionId) as Message[]

    let input = 0
    let read = 0
    let write = 0
    let output = 0
    let cost = 0
    let pid = ""
    let mid = ""

    for (const msg of msgs) {
      if (msg.role !== "assistant") continue
      const t = (msg as AssistantMessage).tokens
      if (!t) continue
      input += num(t.input)
      read += num(t.cache?.read)
      write += num(t.cache?.write)
      output += num(t.output)
      cost += num((msg as AssistantMessage).cost)
      if ((msg as AssistantMessage).providerID && (msg as AssistantMessage).modelID) {
        pid = (msg as AssistantMessage).providerID
        mid = (msg as AssistantMessage).modelID
      }
    }

    // ── merge sub-agent tokens into the main session stats ──
    const subSids = collectSubagentSids(props.api, props.sessionId)
    for (const sid of subSids) {
      let subMsgs: Message[] = []
      try { subMsgs = props.api.state.session.messages(sid) as Message[] } catch { continue }
      for (const msg of subMsgs) {
        if (msg.role !== "assistant") continue
        const t = (msg as AssistantMessage).tokens
        if (!t) continue
        input += num(t.input)
        read += num(t.cache?.read)
        write += num(t.cache?.write)
        output += num(t.output)
        cost += num((msg as AssistantMessage).cost)
      }
    }

    const freshTotal = input + read
    const hitRate = freshTotal > 0 ? (read / freshTotal) * 100 : 0
    const hasData = read > 0 || write > 0 || input > 0 || output > 0

    // Cost savings from cache hits
    let saved = 0
    if (read > 0 && pid && mid) {
      try {
        for (const provider of props.api.state.provider) {
          if (provider.id !== pid) continue
          const model = provider.models[mid]
          if (!model?.cost) continue
          const inputRate = num(model.cost.input)
          const cacheReadRate = num(model.cost.cache?.read)
          const diff = inputRate - cacheReadRate
          if (diff > 0) saved = (read * diff) / 1_000_000
          break
        }
      } catch {}
    }

    // Token distribution
    const dist: TokenDist = { system: 0, user: 0, agent: 0, toolCall: 0, toolResult: 0, output: 0 }
    try {
      partVersion() // track part changes for reactivity

      // Read agent system prompt
      try {
        const session = props.api.state.session.get(props.sessionId)
        const cfg = props.api.state.config as Record<string, unknown>
        const agentName = String(session?.agent ?? (cfg as any)?.default_agent ?? "build")
        const agents = cfg?.agent as Record<string, unknown> | undefined
        const agentCfg = agents?.[agentName] as Record<string, unknown> | undefined
        const sysPrompt = typeof agentCfg?.prompt === "string" ? agentCfg.prompt : ""
        if (sysPrompt) dist.system = estimateTokens(sysPrompt)
      } catch {}

      scanSessionDist(props.api, props.sessionId, dist)
      for (const sid of subSids) scanSessionDist(props.api, sid, dist)
    } catch {}

    const hasDistData = dist.system + dist.user + dist.agent + dist.toolCall + dist.toolResult > 0

    return { hitRate, read, write, input, output, saved, hasData, dist, hasDistData }
  })

  // ── colours ──
  const pal = createMemo(() => {
    const t = props.theme as Record<string, unknown>
    return {
      text: (typeof t.text === "string" ? t.text : "#C5C5BB") as string,
      muted: (typeof t.textMuted === "string" ? t.textMuted : "#7A7A72") as string,
      success: (typeof t.success === "string" ? t.success : "#9CAF8B") as string,
      warning: (typeof t.warning === "string" ? t.warning : "#C5B88D") as string,
      error: (typeof t.error === "string" ? t.error : "#B08A8A") as string,
    }
  })

  const hitColor = createMemo(() => {
    const r = data().hitRate
    if (r >= 85) return pal().success
    if (r >= 70) return pal().warning
    return pal().error
  })

  const pct = createMemo(() => (Math.floor(data().hitRate * 10) / 10).toFixed(1) + "%")

  onMount(() => {
    const unsubPart = props.api.event.on("message.part.updated", () => {
      setPartVersion((v) => v + 1)
    })
    const unsubMsg = props.api.event.on("message.updated", () => {
      setPartVersion((v) => v + 1)
    })
    onCleanup(() => { unsubPart(); unsubMsg() })
  })

  return (
    <box
      border={false}
      paddingTop={0}
      paddingBottom={0}
      paddingLeft={0}
      paddingRight={0}
      flexDirection="column"
      gap={0}
    >
      <Show when={data().hasData} fallback={
        <text fg={pal().muted}>Waiting for cache data...</text>
      }>
        {/* Hit rate */}
        <Row label="Hit Rate" value={pct()} color={hitColor()} mutedColor={pal().muted} />

        {/* Token detail */}
        <Show when={data().read > 0}>
          <Row label="Read Cache" value={fmtTokens(data().read)} mutedColor={pal().muted} />
        </Show>
        <Show when={data().write > 0}>
          <Row label="Write Cache" value={fmtTokens(data().write)} mutedColor={pal().muted} />
        </Show>
        <Row label="Input" value={fmtTokens(data().input)} mutedColor={pal().muted} />
        <Row label="Output" value={fmtTokens(data().output)} mutedColor={pal().muted} />

        {/* Saved */}
        <Show when={data().saved > 0}>
          <Row label="Saved" value={"~" + fmtCost(data().saved)} color={pal().success} mutedColor={pal().muted} />
        </Show>

        {/* Token distribution */}
        <Show when={data().hasDistData}>
          <text fg={pal().text}>{"Token Dist"}</text>
          <Show when={data().dist.system > 0}>
            <Row label="System" value={fmtTokens(data().dist.system)} mutedColor={pal().muted} />
          </Show>
          <Show when={data().dist.user > 0}>
            <Row label="User" value={fmtTokens(data().dist.user)} mutedColor={pal().muted} />
          </Show>
          <Show when={data().dist.agent > 0}>
            <Row label="Agent" value={fmtTokens(data().dist.agent)} mutedColor={pal().muted} />
          </Show>
          <Show when={data().dist.toolCall > 0}>
            <Row label="Tool Call" value={fmtTokens(data().dist.toolCall)} mutedColor={pal().muted} />
          </Show>
          <Show when={data().dist.toolResult > 0}>
            <Row label="Tool Result" value={fmtTokens(data().dist.toolResult)} mutedColor={pal().muted} />
          </Show>
        </Show>
      </Show>
    </box>
  )
}

// ---------------------------------------------------------------------------
// Plugin entry
// ---------------------------------------------------------------------------

function createSidebarSlot(api: TuiPluginApi): TuiSlotPlugin {
  return {
    order: 55,
    slots: {
      sidebar_content(ctx: TuiSlotContext, input: { session_id: string }): JSX.Element {
        return (
          <TokenCachePanel
            theme={ctx.theme.current}
            api={api}
            sessionId={input.session_id}
          />
        )
      },
    },
  }
}

const tui: TuiPlugin = async (api: TuiPluginApi) => {
  api.slots.register(createSidebarSlot(api))
}

const mod: TuiPluginModule & { id: string } = {
  id: "opencode-cache-stats",
  tui,
}

export default mod
