// Art copied from totem's totem-faces/tui/src/logo.ts (same project license).
const original = [
  "                                                                    ",
  "                    ████████╗ ██████╗ ████████╗███████╗███╗   ███╗",
  "                    ╚══██╔══╝██╔═══██╗╚══██╔══╝██╔════╝████╗ ████║",
  "                       ██║   ██║   ██║   ██║   █████╗  ██╔████╔██║",
  "                       ██║   ██║   ██║   ██║   ██╔══╝  ██║╚██╔╝██║",
  "                       ██║   ╚██████╔╝   ██║   ███████╗██║ ╚═╝ ██║",
  "                       ╚═╝    ╚═════╝    ╚═╝   ╚══════╝╚═╝     ╚═╝",
]

const bannerA = [
  "                                                                                              ",
  "              ░██                  ░██                               ",
  "              ░██                  ░██                               ",
  "           ░████████  ░███████  ░████████  ░███████  ░█████████████  ",
  "              ░██    ░██    ░██    ░██    ░██    ░██ ░██   ░██   ░██ ",
  "              ░██    ░██    ░██    ░██    ░█████████ ░██   ░██   ░██ ",
  "              ░██    ░██    ░██    ░██    ░██        ░██   ░██   ░██ ",
  "               ░████  ░███████      ░████  ░███████  ░██   ░██   ░██ ",
  "                                                                                    ",
]

const bannerB = [
  "                                                                              ",
  "               ███      ▄██████▄      ███        ▄████████   ▄▄▄▄███▄▄▄▄   ",
  "           ▀█████████▄ ███    ███ ▀█████████▄   ███    ███ ▄██▀▀▀███▀▀▀██▄ ",
  "              ▀███▀▀██ ███    ███    ▀███▀▀██   ███    █▀  ███   ███   ███ ",
  "               ███   ▀ ███    ███     ███   ▀  ▄███▄▄▄     ███   ███   ███ ",
  "               ███     ███    ███     ███     ▀▀███▀▀▀     ███   ███   ███ ",
  "               ███     ███    ███     ███       ███    █▄  ███   ███   ███ ",
  "               ███     ███    ███     ███       ███    ███ ███   ███   ███ ",
  "              ▄████▀    ▀██████▀     ▄████▀     ██████████  ▀█   ███   █▀  ",
  "                                                                               ",
]

const bannerC = [
  "            █████              █████                                ",
  "            ░░███              ░░███                                 ",
  "            ███████    ██████  ███████    ██████  █████████████  ",
  "           ░░░███░    ███░░███░░███░    ███░░███░░███░░███░░███ ",
  "             ░███    ░███ ░███  ░███    ░███████  ░███ ░███ ░███ ",
  "             ░███ ███░███ ░███  ░███ ███░███░░░   ░███ ░███ ░███ ",
  "             ░░█████ ░░██████   ░░█████ ░░██████  █████░███ █████",
  "              ░░░░░   ░░░░░░     ░░░░░   ░░░░░░  ░░░░░ ░░░ ░░░░░ ",
  "                                                                     ",
]

// Normalize every banner to one fixed box, art centered inside it, so the
// UI never shifts and every banner sits dead-center (same as host logo.ts).
const height = Math.max(...[original, bannerA, bannerB, bannerC].map((a) => a.length))
const width = Math.max(...[original, bannerA, bannerB, bannerC].flatMap((a) => a.map((line) => line.length)))

const frames = [original, bannerA, bannerB, bannerC].map((art) => {
  const margin = Math.min(
    ...art.filter((line) => line.trim()).map((line) => (line.match(/^ */)![0]).length),
  )
  const trimmed = art.map((line) => line.slice(margin).trimEnd())
  const artWidth = Math.max(...trimmed.map((line) => line.length))
  const padLeft = Math.floor((width - artWidth) / 2)
  const padTop = Math.floor((height - trimmed.length) / 2)
  const box = Array.from({ length: height }, (_, i) => {
    const line = i >= padTop && i < padTop + trimmed.length ? trimmed[i - padTop] : ""
    return " ".repeat(padLeft) + line + " ".repeat(Math.max(0, width - padLeft - line.length))
  })
  return box
})

export const logoFrames = frames

// Rainbow cycle speed. Art-frame cycling stays at 3500ms like the host logo.
export const FRAME_MS_ANIM = 80
export const FRAME_MS_ART = 3500
