// Structural stand-ins for @totem-ai/plugin/tui types, matching the verified
// surfaces (totem: totem-faces/tui/src/feature-plugins/home/tips.tsx +
// system/plugins.tsx). Swap for the real package's types when wired up.
export type TuiSlotsRegisterInput = {
  order?: number
  slots: Record<string, () => unknown>
}

// Now that lolcat is a builtin, use totem's real theme type instead of the
// structural stand-in this file originally carried — the stand-in declared
// plain `string` fields and TuiThemeCurrent is not assignable to it.
export type ThemeLike = import("@totem-ai/plugin/tui").TuiTheme

export type TuiPluginApi = {
  slots: { register: (input: TuiSlotsRegisterInput) => void }
  kv: {
    get<T>(key: string, fallback: T): T
    set<T>(key: string, value: T): void
  }
  theme: ThemeLike
  ui: {
    toast: (input: { variant: "info" | "error" | "success"; message: string }) => void
  }
}

export type TuiPlugin = (api: TuiPluginApi) => Promise<void> | void
