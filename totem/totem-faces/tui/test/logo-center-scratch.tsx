import { createTestRenderer } from "@opentui/core/testing"
import { render } from "@opentui/solid"
import { For } from "solid-js"
import { logo } from "../src/logo"

const W = 120
const H = 24

// Mirror the REAL per-char render from component/logo.tsx (colors stripped -- we
// only need to see shape/placement). Raw chars; the special _ ^ ~ , glyphs are
// not present in the current logo.left art anyway.
function renderLine(line: string) {
  return Array.from(line).map((char) => <text>{char}</text>)
}

const lines = logo.left.map((l) => l.trim())

const setup = await createTestRenderer({ width: W, height: H, useThread: false })
await render(
  () => (
    <box flexGrow={1} alignItems="center" paddingLeft={2} paddingRight={2}>
      <box flexGrow={1} minHeight={0} />
      <box height={4} minHeight={0} flexShrink={1} />
      <box flexShrink={0}>
        <box flexDirection="column">
          <For each={lines}>
            {(line) => <box flexDirection="row">{renderLine(line)}</box>}
          </For>
        </box>
      </box>
    </box>
  ),
  setup.renderer,
)
await setup.flush({ maxPasses: 30 })

console.log("=== REAL ART FRAME (W=" + W + ") ===")
console.log(setup.captureCharFrame())
console.log("=== END ===")

// also print trimmed line widths for reference
console.log("widths:", lines.map((l) => l.length))

setup.renderer.destroy()
process.exit(0)
