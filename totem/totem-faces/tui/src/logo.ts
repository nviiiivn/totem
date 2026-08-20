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
// UI below never shifts and every banner sits dead-center.
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
  return { left: box, right: box.map(() => "") }
})

// The animated Logo cycles logoFrames every 3.5s. `logo` stays a random
// single frame for any consumer that renders without animation.
export const logoFrames = frames
export const logo = frames[Math.floor(Math.random() * frames.length)]
export const go = {
  left: ["    ", "█▀▀▀", "  ▀█", "  ▀▀"],
  right: ["    ", "█▀▀█", "█░░█", "▀▀▀▀"],
}
export const marks = "_^~,"
