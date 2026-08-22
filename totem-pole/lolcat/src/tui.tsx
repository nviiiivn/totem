/** @jsxImportSource @opentui/solid */
import { createSignal } from "solid-js"
import { useBindings } from "@opentui/keymap/solid"
import type { TuiPlugin } from "./types"
import { LolcatLogo } from "./lolcat-logo"
import { StockLogo } from "./stock-logo"

const KV_KEY = "lolcat_on"

// home_logo is a replace-mode slot in totem's home route — registering it
// fully swaps the stock <Logo/>. The swap component stays mounted either way
// (lolcat ON -> rainbow, OFF -> stock-look re-render), so the palette command
// and ctrl+l binding below are always live on the home screen.
// Pattern source: totem feature-plugins/home/tips.tsx (commands) +
// feature-plugins/system/plugins.tsx (array bindings).
function HomeLogoSwitch(props: { api: import("./types").TuiPluginApi }) {
  // --lolcat / --no-lolcat set TOTEM_LOLCAT for this session only (see
  // totem/src/cli/cmd/tui.ts). It overrides the saved preference without
  // writing to kv, so the next run without the flag goes back to whatever
  // was toggled with ctrl+l.
  const override = process.env["TOTEM_LOLCAT"]
  const initial = override === "1" ? true : override === "0" ? false : props.api.kv.get(KV_KEY, true)
  const [on, setOn] = createSignal(initial)

  const toggle = () => {
    const next = !on()
    setOn(next)
    props.api.kv.set(KV_KEY, next)
    props.api.ui.toast({ variant: "success", message: next ? "lolcat activated" : "lolcat deactivated" })
  }

  useBindings(() => ({
    commands: [
      {
        name: "lolcat.toggle",
        title: on() ? "Deactivate lolcat" : "Activate lolcat",
        category: "System",
        namespace: "palette",
        run: toggle,
      },
    ],
    bindings: [{ key: "ctrl+l", desc: "Toggle lolcat logo", group: "Lolcat", cmd: toggle }],
  }))

  return (
    <box>
      {on() ? <LolcatLogo /> : <StockLogo theme={props.api.theme} />}
    </box>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      home_logo: () => <HomeLogoSwitch api={api} />,
    },
  })
}

export { tui }
export default tui
