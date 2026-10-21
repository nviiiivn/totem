import { RGBA, TextAttributes } from "@opentui/core"
import { For, createMemo, createSignal, onCleanup, type JSX } from "solid-js"
import { tint, useTheme } from "../context/theme"
import { logoFrames, logo } from "../logo"

const FRAME_MS = 3500

export function Logo() {
  const { theme } = useTheme()
  const [frame, setFrame] = createSignal(Math.floor(Math.random() * logoFrames.length))
  const animated = logoFrames.length > 1
  if (animated) {
    const timer = setInterval(() => setFrame((f) => (f + 1) % logoFrames.length), FRAME_MS)
    onCleanup(() => clearInterval(timer))
  }

  // logo.left arrays are normalized at export time: common leading margin
  // stripped so per-line art indents survive and each frame is exactly
  // art-wide, which the parent's alignItems="center" centers correctly.
  const lines = createMemo(() => (animated ? logoFrames[frame()].left : logo.left))

  const renderLine = (line: string, fg: RGBA, bold: boolean): JSX.Element[] => {
    const shadow = tint(theme.background, fg, 0.25)
    const attrs = bold ? TextAttributes.BOLD : undefined
    return Array.from(line).map((char) => {
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
  }

  return (
    <box>
      <For each={lines()}>
        {(line) => <box flexDirection="row">{renderLine(line, theme.textMuted, false)}</box>}
      </For>
    </box>
  )
}
