import { expect, test } from "bun:test"
import type { Configuration } from "electron-builder"

const legacyDesktopEntry = "resources/linux/totem-desktop.desktop"

const channels = [
  { channel: "dev", appId: "ai.totem.desktop.dev" },
  { channel: "beta", appId: "ai.totem.desktop.beta" },
  { channel: "prod", appId: "ai.totem.desktop" },
] as const

for (const channel of channels) {
  test(`uses one Linux desktop identity for ${channel.channel}`, async () => {
    const previous = process.env.TOTEM_CHANNEL
    process.env.TOTEM_CHANNEL = channel.channel

    const module = await import(`./electron-builder.config.ts?channel=${channel.channel}`)
    const config = module.default as Configuration

    if (previous === undefined) delete process.env.TOTEM_CHANNEL
    else process.env.TOTEM_CHANNEL = previous

    expect(config.appId).toBe(channel.appId)
    expect(config.extraMetadata?.desktopName).toBe(`${channel.appId}.desktop`)
    expect(config.linux?.executableName).toBe(channel.appId)
    expect(config.linux?.desktop?.entry?.StartupWMClass).toBe(channel.appId)
  })
}

test("keeps a hidden prod launcher for old Linux pins", async () => {
  const previous = process.env.TOTEM_CHANNEL
  process.env.TOTEM_CHANNEL = "prod"

  const module = await import("./electron-builder.config.ts?compat=prod")
  const config = module.default as Configuration

  if (previous === undefined) delete process.env.TOTEM_CHANNEL
  else process.env.TOTEM_CHANNEL = previous

  expect(config.deb?.fpm?.[0]).toEndWith(`${legacyDesktopEntry}=/usr/share/applications/totem-desktop.desktop`)
  expect(config.rpm?.fpm?.[0]).toEndWith(`${legacyDesktopEntry}=/usr/share/applications/totem-desktop.desktop`)

  const desktop = await Bun.file(legacyDesktopEntry).text()
  expect(desktop).toContain("Exec=/opt/Totem/ai.totem.desktop %U")
  expect(desktop).toContain("Icon=ai.totem.desktop")
  expect(desktop).toContain("StartupWMClass=ai.totem.desktop")
  expect(desktop).toContain("NoDisplay=true")
})
