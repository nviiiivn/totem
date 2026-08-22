import type { TuiPlugin, TuiPluginApi } from "@totem-ai/plugin/tui"
import { useBindings } from "@opentui/keymap/solid"
import { createSignal } from "solid-js"
import type { BuiltinTuiPlugin } from "../../builtins"
import { LolcatLogo } from "./lolcat-logo"
import { StockLogo } from "./stock-logo"

// Animated rainbow home logo. Source: nvii's own nviiiivn/lolcat-theme, which
// still exists standalone so opencode users can install it there.
//
// BUILT IN, not loaded as an external plugin — deliberately. As an external
// plugin it silently never rendered: an externally-imported module resolves
// `solid-js` to its own copy rather than the one compiled into the binary, and
// two solid instances means its signals are inert inside the TUI's reactive
// tree. Nothing errors; the component simply never comes alive. `tui-smoke`
// gets away with being external only because it never touches solid's
// reactivity primitives. Builtins share the runtime, so this just works.
//
// `home_logo` is a replace-mode slot (routes/home.tsx), so registering it
// fully swaps the stock <Logo/>. The component stays mounted whether lolcat is
// on or off, which keeps the palette command and ctrl+l binding live.

const id = "internal:home-lolcat"
const KV_KEY = "lolcat_on"

function HomeLogoSwitch(props: { api: TuiPluginApi }) {
  // --lolcat / --no-lolcat set TOTEM_LOLCAT for one session only (see
  // cli/cmd/tui.ts). It overrides the saved preference without writing kv, so
  // the next run without the flag returns to whatever ctrl+l last set.
  const override = process.env["TOTEM_LOLCAT"]
  const initial =
    override === "1" ? true : override === "0" ? false : props.api.kv.get(KV_KEY, true)
  const [on, setOn] = createSignal(initial)

  const toggle = () => {
    const next = !on()
    setOn(next)
    props.api.kv.set(KV_KEY, next)
  }

  useBindings(() => ({
    commands: [
      {
        name: "lolcat.toggle",
        title: "Toggle lolcat rainbow logo",
        namespace: "palette",
        run: toggle,
      },
    ],
    bindings: [{ key: "ctrl+l", desc: "Toggle lolcat logo", group: "Lolcat", cmd: toggle }],
  }))

  return <box>{on() ? <LolcatLogo /> : <StockLogo theme={props.api.theme} />}</box>
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      home_logo: () => <HomeLogoSwitch api={api} />,
    },
  })
}

const plugin: BuiltinTuiPlugin = {
  id,
  tui,
}

export default plugin
