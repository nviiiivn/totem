import type { BuiltinTuiPlugin } from "../builtins"
import cacheStats from "../../../../../../totem-pole/cache-stats/src/index"

// Prompt-cache hit rate / token distribution panel.
// Vendored from opencode-cache-stats (see totem-pole/cache-stats).
//
// Builtin, not an external plugin, for the same reason as quota and lolcat: it
// imports createSignal/createMemo/onCleanup from solid-js, and an externally
// loaded copy resolves those to its own node_modules rather than the binary's.
// Two solid instances means its signals never fire — which is why the panel sat
// on "Waiting for cache data..." until it was manually disabled and re-enabled
// (the toggle forced a remount that happened to paint once).
const plugin: BuiltinTuiPlugin = {
  id: cacheStats.id,
  tui: cacheStats.tui,
}

export default plugin
