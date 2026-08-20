# Totem Rebrand Guide

> Living reference for the opencode → totem mechanical rebrand.
> Build session (A) updates this; Presentation session (B) reads it.

## Vision (3-tier — FUTURE work, not now)

| Layer | Role |
|-------|------|
| **totem** | Wrapper / opencode fork front-end / foundational framework. Constitutional rules, spliced base agents, sub-agent organization. The SYMBOL of sacred umbral sparks. |
| **totem-ken** | Dev tools: compiler, maker, production, saved-api, information, plumbing. Regenerating/compiling. |
| **totem-pole** | Extra plugins, customizations, sandbox. Module/kit bashing. Cloned versions to splice from, removable. |
| **umbreality** | The philosophy (abstraction levels for AGI). Deferred. |
| **Metatron** | The agent/model (me) as user's closest avatar. L0(in). |

**Future naming prefs (deferred):** totem-mandela (compaction), totem-figures (agents — 15 archetypes), totem-tuning (config).

## Current Focus: Mechanical Rebrand ONLY

Every `opencode` string → `totem`. "It SHOULD BE TOTEM even if the file is word for word the same."

## Scope Map

**33,575 matches** across **2,518 files**, 12 categories.

Raw dump: `/tmp/totem_opencode_matches.txt`
Per-category: `/tmp/totem/cat_{scope,env,url_ai,url_gh,cfgpath,vscode,install,branch,pkgname,import,mcp_literal}.txt`

| # | Category | Matches | Files |
|---|----------|--------:|------:|
| 1 | Package names (package.json) | 32 | 32 |
| 2 | npm scopes `@opencode-ai/*` | 3,995 | 1,240 |
| 3 | Import paths `from "@opencode-ai/…"` | 3,497 | (subset) |
| 4 | Env vars `OPENCODE_*` | 2,422 | 459 |
| 5 | URLs (opencode.ai + github) | 4,652 | 610 |
| 6 | MCP client name `"opencode"` | 721 | 323 |
| 7 | VS Code ext ID | 1 | 1 |
| 8 | Install commands | 407 | 170 |
| 9 | Config paths `.opencode/` | 814 | 185 |
| 10 | Branch/path prefixes | 2,335 | 619 |
| 11 | String literals `OpenCode` | 9,064 | 700 |
| 12 | PascalCase identifiers | ~700 | — |

## Decisions

1. `@opencode-ai/*` → `@totem-ai/*` (mechanical, matches -ai pattern)
2. All 18 i18n files → rebrand all
3. URLs / GitHub / VSCode ext / npm publishing → DEFER to presentation session
4. Batch execution with `bun typecheck` after each
5. No git commits without explicit request
6. No 3-tier split or splicing until rebrand clean

## Two Unscoped Packages

| File | Current name | Proposed new name |
|------|--------------|-------------------|
| `packages/opencode/package.json` | `"opencode"` | `@totem-ai/totem` |
| `sdks/vscode/package.json` | `"opencode"` | `@totem-ai/vscode` |

Both are original opencode packages. `packages/opencode/` = main CLI runtime (the engine that runs when you type `totem`). `sdks/vscode/` = VS Code extension (published as `sst-dev.opencode` on marketplace).

## Tool Stack

- **ast-grep** (PRIMARY) — already available, pattern-based, fast
- **ts-morph** (SECONDARY) — type-aware identifier renames (OpencodeClient → TotemClient)
- **sed** for mechanical package.json scope renames
- Codemod.com optional (not approved for install)

## Batch Order (low-risk first)

1. ✅ **Batch 1** — package.json files (35 files with @opencode-ai refs)
   - `sed -i 's/@opencode-ai\//@totem-ai\//g'` across all
   - Rename 2 unscoped packages
   - `bun install` to regenerate lockfile
   - Verify zero matches, `bun typecheck`
2. Batch 2 — import paths in source (3,497 matches)
3. Batch 3 — PascalCase identifiers (~700 matches, needs ts-morph)
4. Batch 4 — env vars (2,422 matches)
5. Batch 5 — config paths + branch prefixes
6. Batch 6 — MCP client name + VS Code ext
7. Batch 7 — URLs + install commands (some deferred)
8. Batch 8 — i18n strings + display text (9,064 matches, 18 locales)
9. Batch 9 — docs/README

## Progress Log

### 2026-07-20
- Map complete (33,575 matches)
- Decisions confirmed
- Config files updated (Chutes.AI, Z.ai providers added; opencode-mem plugin; supermemory/Mem0 removed; disabled_providers set)
- Guide created at `/home/nvii/DocVault/totem/REBRAND-GUIDE.md`
- Symlink at `/home/nvii/projects/totem/etc/REBRAND-GUIDE.md`
- Batch 1 in progress

## Glossary

- **i18n** = internationalization. 18 language translation files in `packages/console/app/src/i18n/{de,en,fr,ja,...}.ts`. Each has ~80 "OpenCode" strings.
- **npm scope** = the `@name/` prefix on package names. `@opencode-ai/core` → `@totem-ai/core`.
- **PascalCase identifier** = code symbols like `OpencodeClient`, `OpencodePlugin`. ~700 references. Need ts-morph for type-safe renames.
- **AGENTS.md** = convention file AI agents auto-read. Branch names max 3 words hyphen-separated, commits `type(scope): summary`, Bun APIs, no `any`/`try-catch`/alias/star imports.

## Shared State

- Build state: `/home/nvii/Sandbox/tmp/totem-build-state.md`
- Two-session strategy: Session A (Build) + Session B (Presentation). One-way dependency: B reads A's output.
