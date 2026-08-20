import type { TuiPlugin, TuiPluginApi } from "@totem-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { createMemo, For, Show } from "solid-js"

// Carve 5 — directive surface. "A rule you can't see or kill isn't enforced" (G3).
// Shows carve 1 (directive store) + carve 3 (session STOP) state live, so nothing
// enforcement does is invisible.

const id = "internal:sidebar-enforcement"

function View(props: { api: TuiPluginApi; session_id: string }) {
  const theme = () => props.api.theme.current
  const state = createMemo(() => props.api.state.session.enforcement(props.session_id))
  const show = createMemo(() => {
    const s = state()
    return !!s && (s.stopped || s.directives.length > 0)
  })

  return (
    <Show when={show()}>
      <box>
        <box flexDirection="row" gap={1}>
          <text fg={theme().text}>
            <b>Enforcement</b>
          </text>
        </box>
        <Show when={state()?.stopped}>
          <box flexDirection="row" gap={0}>
            <text fg={theme().error}>■ STOPPED</text>
          </box>
          <Show when={state()?.stopReason}>
            <text fg={theme().textMuted} wrapMode="word">
              {"  "}
              {state()?.stopReason}
            </text>
          </Show>
        </Show>
        <For each={state()?.directives ?? []}>
          {(directive) => (
            <box flexDirection="row" gap={0}>
              <text fg={theme().warning}>! </text>
              <text fg={theme().warning} wrapMode="word" flexGrow={1}>
                {directive.subject}
                {directive.reason ? ` — ${directive.reason}` : ""}
              </text>
            </box>
          )}
        </For>
      </box>
    </Show>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 390,
    slots: {
      sidebar_content(_ctx, props) {
        return <View api={api} session_id={props.session_id} />
      },
    },
  })
}

const plugin: BuiltinTuiPlugin = {
  id,
  tui,
}

export default plugin
