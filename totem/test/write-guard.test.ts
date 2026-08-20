import { describe, expect, test } from "bun:test"
import { assertWritable, ProtectedPathError } from "../src/enforcement/write-guard"

describe("WriteGuard (carve 2 — write-scope guard)", () => {
  test("blocks writes to the constitution file", () => {
    expect(() => assertWritable("/home/nvii/tot3m/totem/src/session/prompt/constitution.txt")).toThrow(
      ProtectedPathError,
    )
  })

  test("blocks writes to any model system-prompt file", () => {
    for (const name of ["default", "anthropic", "gpt", "gemini", "beast", "codex", "trinity", "kimi"]) {
      expect(() => assertWritable(`/home/nvii/tot3m/totem/src/session/prompt/${name}.txt`)).toThrow(
        ProtectedPathError,
      )
    }
  })

  test("blocks writes to the enforcement module itself", () => {
    expect(() => assertWritable("/home/nvii/tot3m/totem/src/enforcement/write-guard.ts")).toThrow(ProtectedPathError)
    expect(() => assertWritable("/home/nvii/tot3m/totem/src/enforcement/anything-added-later.ts")).toThrow(
      ProtectedPathError,
    )
  })

  test("blocks even when a simulated malicious/confused instruction tries a relative or oddly-cased path", () => {
    // simulate the kind of path a confused/manipulated turn might construct
    expect(() =>
      assertWritable("/home/nvii/tot3m/totem/src/session/prompt/../prompt/constitution.txt"),
    ).toThrow(ProtectedPathError)
  })

  test("does NOT block ordinary project files", () => {
    expect(() => assertWritable("/home/nvii/tot3m/totem/src/tool/edit.ts")).not.toThrow()
    expect(() => assertWritable("/home/nvii/tot3m/README.md")).not.toThrow()
    expect(() => assertWritable("/home/nvii/tot3m/totem/src/session/system.ts")).not.toThrow()
  })
})
