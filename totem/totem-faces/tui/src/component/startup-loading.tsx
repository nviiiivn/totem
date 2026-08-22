import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js"
import { useTerminalDimensions } from "@opentui/solid"

const TILE_A = "▗   ▗        "
const TILE_B = "▜▘▛▌▜▘█▌▛▛▌  "
const TILE_C = "▐▖▙▌▐▖▙▖▌▌▌  "
const TILE = TILE_A.length
const FG = "#6d6d6d"

// Rainbow for the boot splash. Self-contained on purpose: this component mounts
// before ThemeProvider exists (see note below), so it cannot read theme colors —
// but it does not need to. Hue is derived from x/y position, which is what makes
// it read as a diagonal lolcat sweep rather than a flat tint.
function hueRGB(h: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    const v = Math.max(0, Math.min(1, Math.min(k, 4 - k, 1)))
    return Math.round(55 + 200 * v)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${f(5)}${f(3)}${f(1)}`
}

/** Split a string into per-character spans, each tinted by its x/y position. */
function rainbowSpans(text: string, y: number, xOffset = 0) {
  return Array.from(text).map((ch, x) => (
    <text fg={hueRGB(((x + xOffset) * 7 + y * 18) % 360)} selectable={false}>
      {ch}
    </text>
  ))
}
const BLINK_MS = 2000

// Boot splash: static (0 fps) marquee background painted as the renderer's
// first frame — costs nothing after the initial paint — plus a centered
// black box holding the loading art (2s on / 2s off). Only the tiny
// box subtree toggles, so boot work isn't fighting a full-screen repaint.
// No theme context here: this mounts before ThemeProvider exists.
const ART = [
  "▖      ▌▘",
  "▌ ▛▌▀▌▛▌▌▛▌▛▌",
  "▙▖▙▌█▌▙▌▌▌▌▙▌▗ ▗ ▗",
  "           ▄▌",
]
const ART_W = Math.max(...ART.map((r) => r.length))
const PAD = " ".repeat(ART_W + 4)
export function StartupLoading(props: { ready: () => boolean }) {
  const dimensions = useTerminalDimensions()
  const [on, setOn] = createSignal(true)
  let blink: NodeJS.Timeout | undefined

  createEffect(() => {
    if (props.ready()) {
      if (blink) {
        clearInterval(blink)
        blink = undefined
      }
      return
    }
    if (blink) return
    blink = setInterval(() => setOn((v) => !v), BLINK_MS)
  })

  onCleanup(() => {
    if (blink) clearInterval(blink)
  })

  const bg = createMemo(() => {
    const cols = Math.max(40, Math.min(200, dimensions().width))
    const rows = Math.max(2, dimensions().height - 1)
    const out: string[] = []
    for (let r = 0; r < rows; r++) {
      const pattern = r % 3 === 0 ? TILE_A : r % 3 === 1 ? TILE_B : TILE_C
      let line = ""
      for (let i = 0; i < cols + TILE; i += TILE) line += pattern
      out.push(line.slice(0, cols))
    }
    return out
  })

  return (
    <Show when={!props.ready()}>
      <box position="absolute" zIndex={5000} left={0} right={0} top={0} bottom={0} flexDirection="column">
        {bg().map((line, y) => (
          <box flexDirection="row">{rainbowSpans(line, y)}</box>
        ))}
        <Show when={on()}>
          <box
            position="absolute"
            left={0}
            right={0}
            top={0}
            bottom={0}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
          <box backgroundColor="#000000" flexDirection="column">
            <text fg={FG} selectable={false}>{PAD}</text>
            {ART.map((row, y) => (
              <box flexDirection="row">{rainbowSpans("  " + row + "  ", y + 2)}</box>
            ))}
            <text fg={FG} selectable={false}>{PAD}</text>
          </box>
          </box>
        </Show>
      </box>
    </Show>
  )
}
