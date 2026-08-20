import { Config } from "effect"

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

const copy = process.env["TOTEM_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
const fff = process.env["TOTEM_DISABLE_FFF"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("TOTEM_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  TOTEM_AUTO_HEAP_SNAPSHOT: truthy("TOTEM_AUTO_HEAP_SNAPSHOT"),
  TOTEM_GIT_BASH_PATH: process.env["TOTEM_GIT_BASH_PATH"],
  TOTEM_CONFIG: process.env["TOTEM_CONFIG"],
  TOTEM_CONFIG_CONTENT: process.env["TOTEM_CONFIG_CONTENT"],
  TOTEM_DISABLE_AUTOUPDATE: truthy("TOTEM_DISABLE_AUTOUPDATE"),
  TOTEM_ALWAYS_NOTIFY_UPDATE: truthy("TOTEM_ALWAYS_NOTIFY_UPDATE"),
  TOTEM_DISABLE_PRUNE: truthy("TOTEM_DISABLE_PRUNE"),
  TOTEM_DISABLE_TERMINAL_TITLE: truthy("TOTEM_DISABLE_TERMINAL_TITLE"),
  TOTEM_SHOW_TTFD: truthy("TOTEM_SHOW_TTFD"),
  TOTEM_DISABLE_AUTOCOMPACT: truthy("TOTEM_DISABLE_AUTOCOMPACT"),
  TOTEM_DISABLE_MODELS_FETCH: truthy("TOTEM_DISABLE_MODELS_FETCH"),
  TOTEM_DISABLE_MOUSE: truthy("TOTEM_DISABLE_MOUSE"),
  TOTEM_FAKE_VCS: process.env["TOTEM_FAKE_VCS"],
  TOTEM_SERVER_PASSWORD: process.env["TOTEM_SERVER_PASSWORD"],
  TOTEM_SERVER_USERNAME: process.env["TOTEM_SERVER_USERNAME"],
  TOTEM_DISABLE_FFF: fff === undefined ? process.platform === "win32" : truthy("TOTEM_DISABLE_FFF"),

  // Experimental
  TOTEM_EXPERIMENTAL_FILEWATCHER: Config.boolean("TOTEM_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  TOTEM_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("TOTEM_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  TOTEM_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("TOTEM_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  TOTEM_MODELS_URL: process.env["TOTEM_MODELS_URL"],
  TOTEM_MODELS_PATH: process.env["TOTEM_MODELS_PATH"],
  TOTEM_DB: process.env["TOTEM_DB"],

  TOTEM_WORKSPACE_ID: process.env["TOTEM_WORKSPACE_ID"],
  TOTEM_EXPERIMENTAL_WORKSPACES: enabledByExperimental("TOTEM_EXPERIMENTAL_WORKSPACES"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get TOTEM_DISABLE_PROJECT_CONFIG() {
    return truthy("TOTEM_DISABLE_PROJECT_CONFIG")
  },
  get TOTEM_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("TOTEM_EXPERIMENTAL_REFERENCES")
  },
  get TOTEM_TUI_CONFIG() {
    return process.env["TOTEM_TUI_CONFIG"]
  },
  get TOTEM_CONFIG_DIR() {
    return process.env["TOTEM_CONFIG_DIR"]
  },
  get TOTEM_PURE() {
    return truthy("TOTEM_PURE")
  },
  get TOTEM_PERMISSION() {
    return process.env["TOTEM_PERMISSION"]
  },
  get TOTEM_PLUGIN_META_FILE() {
    return process.env["TOTEM_PLUGIN_META_FILE"]
  },
  get TOTEM_CLIENT() {
    return process.env["TOTEM_CLIENT"] ?? "cli"
  },
}
