// O2 (amendment protocol) — structural guards for the constitution.
//
// The constitution exists in two places on purpose:
//   - totem/src/session/prompt/constitution.txt — the ENFORCED copy, compiled
//     into the binary at build time (bun text import, see session/system.ts).
//   - CONSTITUTION.md (repo root) — the human-facing copy, which additionally
//     carries an "=============ARCHIVED===============" section of prior versions.
//
// Nothing previously stopped these from silently drifting apart. A human editing
// the root file would change nothing about real behavior; a human editing only
// constitution.txt would leave the human-facing document stale. Either way the
// rules a person believes are in force stop matching the rules actually in force
// — which is the exact class of failure this project exists to prevent.
//
// These tests make that drift loud instead of silent.
import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { assertWritable, ProtectedPathError } from "../src/enforcement/write-guard"

const REPO_ROOT = join(import.meta.dir, "../..")
const ENFORCED = join(REPO_ROOT, "totem/src/session/prompt/constitution.txt")
const HUMAN_FACING = join(REPO_ROOT, "CONSTITUTION.md")
const ARCHIVE_MARKER = "=============ARCHIVED==============="

describe("constitution sync (O2)", () => {
  test("the human-facing copy's live section matches the enforced copy exactly", () => {
    const enforced = readFileSync(ENFORCED, "utf-8")
    const humanFacing = readFileSync(HUMAN_FACING, "utf-8")

    // Everything above the archive marker is the live constitution. Cut on the
    // whole marker LINE, not the marker substring — the line is wrapped in quote
    // characters (`" ====ARCHIVED==== "`), so slicing at the substring would leave
    // a stray quote behind and make an in-sync file look out of sync.
    const lines = humanFacing.split("\n")
    const markerLine = lines.findIndex((line) => line.includes(ARCHIVE_MARKER))
    const live = (markerLine === -1 ? lines : lines.slice(0, markerLine)).join("\n")

    // Compare ignoring trailing whitespace only — the human copy pads blank lines
    // before the archive marker, which is cosmetic and not a rule change.
    expect(live.trimEnd()).toBe(enforced.trimEnd())
  })

  test("neither copy is writable by the agent", () => {
    // Both must be equally protected. The enforced copy was always blocked; the
    // human-facing copy was found unprotected during the 2026-08-21 O2 audit.
    expect(() => assertWritable(ENFORCED)).toThrow(ProtectedPathError)
    expect(() => assertWritable(HUMAN_FACING)).toThrow(ProtectedPathError)
  })

  test("an ordinary markdown file is still writable (guard stays narrow)", () => {
    expect(() => assertWritable(join(REPO_ROOT, "README.md"))).not.toThrow()
    expect(() => assertWritable(join(REPO_ROOT, "docs/STATE.md"))).not.toThrow()
  })
})
