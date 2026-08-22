import { RGBA } from "@opentui/core"

// Pure hue math — usable outside the TUI (preview scripts, SVG generators).
// hue(x, y, t) = (x·14 + y·28 + t) mod 360, lolcat-style sweep.
export function rainbowHue(x: number, y: number, t: number): number {
  return ((((x * 14 + y * 28 + t) % 360) + 360) % 360)
}

// Self-contained HSV->RGB (s=1, v=1), no unit ambiguity with @opentui's hsvToRgb.
function hueToRgb(h: number): [number, number, number] {
  const sector = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const q = 1 - f
  switch (sector) {
    case 0: return [255, Math.round(f * 255), 0]
    case 1: return [Math.round(q * 255), 255, 0]
    case 2: return [0, 255, Math.round(f * 255)]
    case 3: return [0, Math.round(q * 255), 255]
    case 4: return [Math.round(f * 255), 0, 255]
    default: return [255, 0, Math.round(q * 255)]
  }
}

export function rainbowRGB(x: number, y: number, t: number): [number, number, number] {
  return hueToRgb(rainbowHue(x, y, t))
}

// RGBA wrappers for the TUI component.
export function rainbow(x: number, y: number, t: number): RGBA {
  const [r, g, b] = rainbowRGB(x, y, t)
  return RGBA.fromInts(r, g, b)
}

export function rainbowShadow(x: number, y: number, t: number): RGBA {
  const [r, g, b] = rainbowRGB(x, y, t)
  return RGBA.fromInts(Math.round(r * 0.25), Math.round(g * 0.25), Math.round(b * 0.25))
}

// Mirrors totem's theme tint(): linear blend overlay into base by alpha.
// Accepts/returns hex strings; components handled as 0-1 floats like the host.
export function mix(baseHex: string, overlayHex: string, alpha: number): string {
  const base = RGBA.fromHex(baseHex)
  const overlay = RGBA.fromHex(overlayHex)
  const channel = (b: number, o: number) => Math.round((b + (o - b) * alpha) * 255)
  const hex = (n: number) => n.toString(16).padStart(2, "0")
  return `#${hex(channel(base.r, overlay.r))}${hex(channel(base.g, overlay.g))}${hex(channel(base.b, overlay.b))}`
}
