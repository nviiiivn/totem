import type { BuiltinTuiPlugin } from "../builtins"
import quotaTui from "../../../../../../totem-pole/quota/src/tui"

// Provider quota / token usage sidebar panel.
// Vendored source lives in totem-pole/quota (see its VENDORED.md); this file
// only re-exports it as a builtin.
//
// It MUST be a builtin, not an external plugin. Its TUI imports createSignal /
// createEffect / onCleanup from "solid-js" directly, and an externally-loaded
// module resolves those to its own copy on disk rather than the one compiled
// into the binary. Two solid instances means its signals never fire inside the
// TUI's reactive tree — the panel mounts but never updates, which is exactly
// the "Usage header with stale config text and no percentages" symptom. Same
// root cause as the lolcat logo (feature-plugins/home/lolcat). Importing it
// from here bundles it into the binary, so there is only ever one instance.

const plugin: BuiltinTuiPlugin = {
  id: quotaTui.id,
  tui: quotaTui.tui,
}

export default plugin
