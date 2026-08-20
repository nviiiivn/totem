declare global {
  const TOTEM_VERSION: string
  const TOTEM_CHANNEL: string
}

export const InstallationVersion = typeof TOTEM_VERSION === "string" ? TOTEM_VERSION : "local"
export const InstallationChannel = typeof TOTEM_CHANNEL === "string" ? TOTEM_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
