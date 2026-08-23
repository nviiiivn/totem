import type { BuiltinTuiPlugin } from "../builtins"
// @ts-ignore -- vendored prebuilt bundle, ships no type declarations
import usageMonitor from "../../../../../../totem-pole/usage-monitor/tui.js"

// Provider usage/quota bars panel.
// Vendored from opencode-usage-monitor (see totem-pole/usage-monitor).
//
// Builtin for the same reason as the others: its bundle imports solid-js and
// @opentui/solid as EXTERNAL references, so loaded externally it binds to its
// own copies and its reactivity is inert — the panel rendered but never
// updated. Bundled into the binary those imports resolve to the one shared
// instance.
const plugin: BuiltinTuiPlugin = {
  id: usageMonitor.id,
  tui: usageMonitor.tui,
}

export default plugin
