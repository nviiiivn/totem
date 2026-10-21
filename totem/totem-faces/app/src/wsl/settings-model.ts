import type { WslTotemCheck, WslServerRuntime } from "./types"

export const wslRuntimeRetryable = (runtime: WslServerRuntime) =>
  runtime.kind === "failed" || runtime.kind === "stopped"

export async function enterWslTotemStep(
  distro: string,
  probe: (distro: string) => Promise<unknown>,
  select: (step: "totem") => void,
) {
  await probe(distro)
  select("totem")
}

export function wslTotemAction(check?: WslTotemCheck) {
  if (!check) return
  if (!check.resolvedPath) return "Install Totem"
  if (check.matchesDesktop === false) return "Update Totem"
}
