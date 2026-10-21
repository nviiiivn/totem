/** @jsxImportSource @opentui/solid */
import { RGBA, TextAttributes } from "@opentui/core"
import { For, createMemo, createSignal, onCleanup, type JSX } from "solid-js"
import { rainbow, rainbowShadow } from "./rainbow"
import { logoFrames, FRAME_MS_ANIM, FRAME_MS_ART } from "./art"

// Cell semantics mirror totem's component/logo.tsx:
//   "_" -> space with fg + shadow bg, "^" -> ▀ fg + shadow bg,
//   "~" -> ▀ shadow-only fg,     "," -> ▄ shadow-only fg.
// Color source swapped from theme.textMuted to rainbow(x, y, tick).
export function LolcatLogo() {
  const [frame, setFrame] = createSignal(Math.floor(Math.random() * logoFrames.length))
  const [tick, setTick] = createSignal(0)

  const frameTimer = setInterval(() => setFrame((f) => (f + 1) % logoFrames.length), FRAME_MS_ART)
  const animTimer = setInterval(() => setTick((t) => (t + 9) % 360), FRAME_MS_ANIM)
  onCleanup(() => {
    clearInterval(frameTimer)
    clearInterval(animTimer)
  })

  const lines = createMemo(() => logoFrames[frame()])

  const renderLine = (line: string, y: number): JSX.Element[] =>
    Array.from(line).map((char, x) => {
      const fg: RGBA = rainbow(x, y, tick())
      const shadow = rainbowShadow(x, y, tick())
      const attrs = TextAttributes.BOLD
      if (char === "_") {
        return (
          <text fg={fg} bg={shadow} attributes={attrs} selectable={false}>
            {" "}
          </text>
        )
      }
      if (char === "^") {
        return (
          <text fg={fg} bg={shadow} attributes={attrs} selectable={false}>
            ▀
          </text>
        )
      }
      if (char === "~") {
        return (
          <text fg={shadow} attributes={attrs} selectable={false}>
            ▀
          </text>
        )
      }
      if (char === ",") {
        return (
          <text fg={shadow} attributes={attrs} selectable={false}>
            ▄
          </text>
        )
      }
      return (
        <text fg={fg} attributes={attrs} selectable={false}>
          {char}
        </text>
      )
    })

  return (
    <box>
      <For each={lines()}>
        {(line, i) => <box flexDirection="row">{renderLine(line, i())}</box>}
      </For>
    </box>
  )
}
