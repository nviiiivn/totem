/** @jsxImportSource @opentui/solid */
import { RGBA, TextAttributes } from "@opentui/core"
import { For, createMemo, createSignal, onCleanup, type JSX } from "solid-js"
import { mix } from "./rainbow"
import { logoFrames, FRAME_MS_ART } from "./art"
import type { ThemeLike } from "./types"

// Stock-look fallback: identical cell semantics to totem's component/logo.tsx
// (fg = theme.textMuted, shadow = tint(theme.background, fg, 0.25)), cycling
// frames every 3500ms like the original. Shown when lolcat is toggled OFF so
// the replace-mode home_logo slot never leaves the home route logo-less.
export function StockLogo(props: { theme: ThemeLike }) {
  const [frame, setFrame] = createSignal(Math.floor(Math.random() * logoFrames.length))
  const frameTimer = setInterval(() => setFrame((f) => (f + 1) % logoFrames.length), FRAME_MS_ART)
  onCleanup(() => clearInterval(frameTimer))

  const lines = createMemo(() => logoFrames[frame()])

  const fgOf = () => RGBA.fromHex(props.theme.current.textMuted)
  const shadowOf = () => RGBA.fromHex(mix(props.theme.current.background, props.theme.current.textMuted, 0.25))

  const renderLine = (line: string, y: number): JSX.Element[] =>
    Array.from(line).map((char, x) => {
      void y
      const fg = fgOf()
      const shadow = shadowOf()
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
