// Structural stand-ins for @totem-ai/plugin/tui types, matching the verified
// surfaces (totem: totem-faces/tui/src/feature-plugins/home/tips.tsx +
// system/plugins.tsx). Swap for the real package's types when wired up.
export type TuiSlotsRegisterInput = {
  order?: number
  slots: Record<string, () => unknown>
}

export type ThemeLike = {
  current: {
    background: string
    text: string
    textMuted: string
  }
}

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
