# WIKI UPDATE HANDOFF — for the Presenter Session

> **From:** Architecture teaching session (forked from rebrand session)
> **To:** The session that maintains https://totem.alola.lol/
> **Purpose:** You are being handed a list of wiki corrections + a new structural model. The user does NOT want to play "find all the things you missed." Everything is listed below. **Reorganize and rename — do NOT delete content.**
> **Date:** Jul 22 2026

---

## 1. CONTEXT — WHAT HAPPENED

The rebrand is **100% complete** (source code, binary, user data, env vars). See:
- `/home/nvii/DocVault/totem/REBRAND-GUIDE.md`
- `/home/nvii/Sandbox/tmp/totem-build-state.md`
- `/home/nvii/DocVault/AI-Research/09-Totem-Complete-Stack.md` (full 29-package breakdown)

This session was a **forked architecture teaching session**. The user and I designed a new 4-tier repo structure called **TOTEMIC**. The wiki needs to reflect this.

---

## 2. THE NEW STRUCTURE — TOTEMIC

The user chose **TOTEMIC** as the umbrella/sphere name ("the whole kit and kaboodle"). The repo root is `totemic/`. Under it, 4 tiers:

```
totemic/                          ← repo root (the umbrella/sphere)
├── totem-ken/                    ← KNOWLEDGE / MEMORY center
│   ├── docs/                     ← docs site
│   ├── stats/                    ← analytics
│   └── web/                      ← marketing site (public face of docs)
│
├── totem-adze/                   ← MANUFACTURER / FABRICATOR / COMPILER
│   ├── totem system backup
│   ├── totem session backup
│   ├── script/                   ← build scripts (the carver — "adze" = D-shaped carving blade)
│   ├── sdk/                      ← JS/GO/PYTHON SDK
│   ├── storybook/                ← UI component dev tool
│   ├── http-recorder/            ← HTTP test cassettes
│   ├── function/                 ← serverless deployment wrappers
│   └── containers/               ← Docker packaging
│
├── totem-pole/                   ← MODS / PLUGINS (hot-swappable, not foundational)
│   ├── plug-in plugin suite
│   ├── 3rd party integrations (slack, enterprise)
│   └── sandbox (for-skills/integrations/newagents/etc..)
│
└── totem/                        ← THE PRODUCT (the thing you run)
    ├── core/                     ← core engine
    ├── llm/                      ← LLM abstraction
    ├── schema/                   ← config schema
    ├── plugin/                   ← plugin system
    ├── server/                   ← server runtime
    ├── effect-drizzle-sqlite/    ← DB layer (primary — Drizzle ORM + Effect + SQLite)
    ├── effect-sqlite-node/       ← DB layer (alt — raw Node SQLite driver)
    ├── totem-log-sanitizer/      ← secret redaction (non-optional runtime safety)
    └── totem-faces/              ← all user-facing surfaces
        ├── tui/                  ← terminal UI framework
        ├── ui/                   ← shared UI components
        ├── app/                  ← web app
        ├── desktop/              ← desktop app
        ├── console/              ← console app
        ├── session-ui/           ← session UI
        └── identity/             ← auth/identity (shared service for faces)
```

### TIER DEFINITIONS (user's words, refined):

- **totem-ken** = memory/knowledge center. The archive. NOT the builder. DB FILE (the .sqlite with sessions/messages) is conceptually ken territory — it IS the knowledge. But DB CODE (the ORM/driver that reads/writes it) is runtime, lives in totem core.
- **totem-adze** = manufacturer/fabricator/compiler. "adze" = the traditional totem carving tool (D-shaped blade). This is the build engine that turns source into the running binary. System backup + session backup live here. SDK, storybook, http-recorder, function, containers all live here (build/test/deploy tooling).
- **totem-pole** = mods/plugins. Hot-swappable, not foundational. Like adding aerodynamics, paint, comfy seats, twin turbo to a car that's already decent. Plugin suite, 3rd party integrations, sandbox.
- **totem** = the product. The thing you actually run. Core engine, LLM abstraction, config schema, plugin system, server runtime, log sanitizer, and totem-faces (all UI surfaces).

### KEY DECISIONS:
- `totem-log-sanitizer` goes in **totem core** (non-optional runtime safety, NOT a removable mod)
- `identity` goes in **totem-faces** (shared service for console/web/desktop)
- `storybook` goes in **totem-adze** (dev/build tooling, NOT a user mod)
- `function` + `containers` go in **totem-adze** (deployment packaging)
- `web` (marketing) goes in **totem-ken** (public face of docs) — user leaning this way for organization
- `cli` (thin wrapper) — fold into `totem/` or drop, redundant with totem binary
- DB CODE (effect-drizzle-sqlite, effect-sqlite-node) goes in **totem core** (runtime load-bearing). DB FILE is totem-ken territory conceptually. **DECIDED: DB code lives in totem core.** The map above should be updated — move effect-drizzle-sqlite/ and effect-sqlite-node/ out of totem-ken/infrastructure/ and into totem/ (core).

---

## 3. PAGE-BY-PAGE CORRECTIONS NEEDED

### 3A. HOME PAGE (https://totem.alola.lol/)

**Issue:** "Totem-Ken — an autonomous multi-agent system running entirely on local hardware. Seven layers deep. Fourteen companies. Ninety-plus API endpoints. Zero cloud dependencies."

**Problem:** This conflates "Totem-Ken" (the 7-layer multi-agent system = UmbrealityAI's implementation = the oh-my-totemken plugin) with "totem-ken" (the knowledge/memory tier in the new repo structure). **These are DIFFERENT things sharing a name.** See Section 5 below.

**Fix:** Clarify the distinction. "Totem-Ken" the multi-agent system is the UmbrealityAI implementation. "totem-ken" the repo tier is the knowledge/memory center. Either rename one, or add a disambiguation note.

---

### 3B. ECOSYSTEM PAGE (https://totem.alola.lol/ecosystem/)

**Issue 1: The ASCII diagram is completely outdated.**

Current diagram shows:
```
TOTEM (opencode fork) at top
├── TOTEMPOLE (the ecosystem umbrella)
├── TOTEM KEN (build/rebuild/compile)
├── OH-MY-TOTEMKEN (plugin sandbox)
└── UMBREALITY AI (philosophical well)
```

**Problems:**
- TOTEM labeled "(opencode fork)" — rebrand is done, should be "the product you run"
- TOTEMPOLE labeled "the ecosystem (umbrella)" — **TOTEMIC** is now the umbrella. TOTEMPOLE is just the mods.
- TOTEM KEN labeled "build/rebuild/compile" — that's now **TOTEM-ADZE's** job. TOTEM-KEN is knowledge/memory.
- OH-MY-TOTEMKEN shown as separate from TOTEMPOLE — it's now part of totem-pole (the mods)
- **Missing: TOTEMIC as root, TOTEM-ADZE entirely**

**Replacement diagram should be:**
```
                    ┌──────────────────────────────┐
                    │          TOTEMIC              │  ← the umbrella / sphere
                    │  (the whole kit and kaboodle) │     the repo root
                    └──────────────┬───────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
     ┌──────┴──────┐       ┌───────┴───────┐      ┌───────┴──────┐
     │  TOTEM-KEN  │       │  TOTEM-ADZE   │      │    TOTEM     │
     │             │       │               │      │  (the product │
     │  memory /   │       │  manufacturer │      │   you run)   │
     │  knowledge  │       │  fabricator    │      │              │
     │  center     │       │  compiler      │      │  core engine │
     │             │       │  configurator  │      │  + totem-faces│
     └─────────────┘       └───────────────┘      └──────┬───────┘
                                                        │
                                                 ┌──────┴──────┐
                                                 │ TOTEM-POLE  │
                                                 │ (the mods)  │
                                                 │ hot-swappable│
                                                 │ not foundational│
                                                 └─────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │       UMBREALITY AI           │  ← the philosophical well
                    │       (alola.lol)            │     the 7-layer reality stack
                    │                              │     that informs everything
                    └──────────────────────────────┘
```

**Issue 2: "What lives here" table is outdated.**

| Project | Current text | Problem | Fix |
|---------|-------------|---------|-----|
| Totem | "~60% rebranded" | Rebrand is 100% done | Change to "100% rebranded, binary built and installed" |
| Totemken | "The builder/rebuilder/compiler role" | That's totem-adze now | Change to "The knowledge/memory center" |
| Totempole | "The umbrella ecosystem name" | TOTEMIC is the umbrella now | Change to "The mods/plugins tier (hot-swappable)" |
| oh-my-totemken | "Fork of oh-my-openagent..." | Now part of totem-pole | Note it's the totem-pole plugin suite |
| UmbrealityAI | OK | OK | Keep |

**Missing rows:** TOTEMIC (the umbrella/repo root), TOTEM-ADZE (the manufacturer/compiler).

---

### 3C. ARCHITECTURE PAGE (https://totem.alola.lol/architecture/)

**Issue:** The "key change" box is correct (global.ts:10, `const app = "totem"`). But the page still frames everything as "Totem (the fork)" vs "OpenCode (the upstream)" with 14 pages of upstream docs.

**Fix:** This is fine structurally — the upstream docs explain what totem changes. But consider adding a note that the 4-tier TOTEMIC structure (Section 2 above) is the NEW organization, and the flat `packages/*` structure shown in the upstream docs is the PRE-REBRAND layout.

---

### 3D. TOTEM ARCHITECTURE SUBPAGE (https://totem.alola.lol/architecture/totem-architecture/)

**Multiple stale references found:**

1. **Package dependency diagram** uses old names:
   - `packages/opencode/` → should be `packages/totem/`
   - `packages/app/` → should be under `totem-faces/`
   - `packages/desktop/` → should be under `totem-faces/`
   - `packages/web/` → should be under `totem-ken/`
   - `packages/console/` → should be under `totem-faces/`
   - `packages/sdk/` → should be under `totem-adze/`
   - `packages/stats/` → should be under `totem-ken/`

2. **"Flag/env system"** says `OPENCODE_*` env vars — should be `TOTEM_*`

3. **"Plugin System"** section says:
   - `~/.local/share/totem/plugins/` — correct (already rebranded)
   - `"opencode" | "tui"` plugin discriminant — should be `"totem" | "tui"`
   - `oh-my-poopenpoop` reference — should be `oh-my-totemken` or `totem-pole`

4. **"Config Priority"** says `OPENCODE_*` env vars — should be `TOTEM_*`

5. **Data flow diagram** says `CLI (packages/opencode/src/cli/)` — should be `CLI (packages/totem/src/cli/)`

---

### 3E. OTHER ARCHITECTURE SUBPAGES

These 14 pages document upstream OpenCode. They're intentionally preserved as-is for reference. **Do NOT rebrand these** — they explain the upstream, and the totem changes are documented in the Totem-specific pages. But consider adding a header note on each: "This page documents upstream OpenCode architecture. Totem's changes are documented in [Totem Architecture]."

---

## 4. WHAT NOT TO DO

- **Do NOT delete content.** The user said: "i'd like to very much make sure things just get organized better and not just deleted or removed.... names changed for the better"
- **Do NOT remove the upstream OpenCode docs.** They explain what totem forks from.
- **Do NOT rebrand the upstream docs pages.** They document OpenCode, not Totem.
- **Do NOT change the `global.ts:10` key change box.** It's correct.
- **Do NOT pursue Algonquian terminology research.** The user explicitly stopped this.

---

## 5. NAMING COLLISION — RESOLVED (presenter session: execute this)

**"Totem-Ken" means two different things in the wiki:**

1. **totem-ken** (lowercase, repo tier) = the knowledge/memory center in the TOTEMIC structure. A directory in the repo. Holds docs/, stats/, web/.
2. **Totem-Ken** (capitalized, the system) = the 7-layer autonomous multi-agent system running on local hardware. This is UmbrealityAI's implementation, delivered as the **oh-my-totemken** plugin (which lives in totem-pole).

**These are NOT in collision — they're at different abstraction layers.** One is repo structure (a directory). The other is a runtime feature (a plugin that runs on totem). They share a name because the multi-agent system IS a knowledge-processing system — conceptually related, not conflicting.

**ACTION ITEMS for the presenter session:**

1. **Home page** (https://totem.alola.lol/): The "Totem-Ken" blurb currently says "an autonomous multi-agent system running entirely on local hardware. Seven layers deep. Fourteen companies. Ninety-plus API endpoints. Zero cloud dependencies." Add a disambiguation note directly after it:
   > **Note:** "Totem-Ken" (capitalized) refers to the multi-agent system — the oh-my-totemken plugin that runs on totem. "totem-ken" (lowercase) refers to the knowledge/memory tier in the TOTEMIC repo structure. See [Ecosystem] for the repo structure and [UmbrealityAI] for the multi-agent system.

2. **Ecosystem page**: In the "What lives here" table, add a row for totem-ken (the repo tier) with description "The knowledge/memory center (docs, stats, web). NOT the multi-agent system — that's the oh-my-totemken plugin in totem-pole."

3. **UmbrealityAI page**: Add a note clarifying that the Totem-Ken multi-agent system is delivered as the oh-my-totemken plugin, which lives in the totem-pole tier of the TOTEMIC repo.

4. **Anywhere else** "Totem-Ken" appears referring to the multi-agent system: add a parenthetical "(the multi-agent system, delivered as the oh-my-totemken plugin)" on first mention per page.

---

## 6. GITHUB LOCATION

The repo will live at **https://github.com/nviiiiivn/totem**. The user will likely create `totemic` as the project/org and put `totem` inside it, or put everything in one repo. This is the user's call and doesn't block wiki work. Any wiki references to a GitHub org should point to `github.com/nviiiiivn/totem` unless the user changes this later.

---

## 7. MEMORY ENTRY

All architectural decisions from this session are stored in memory under ID `mem_1784702712798_f1lekhqpc`. Search tags: `totem`, `totemic`, `architecture`, `rebrand`, `totem-ken`, `totem-adze`, `totem-pole`, `repo-structure`, `decisions`.

---

## 8. REFERENCE DOCS

- `/home/nvii/DocVault/AI-Research/09-Totem-Complete-Stack.md` — full 29-package breakdown
- `/home/nvii/DocVault/totem/REBRAND-GUIDE.md` — rebrand guide
- `/home/nvii/Sandbox/tmp/totem-build-state.md` — build state
- `/home/nvii/DocVault/totem/WIKI-UPDATE-HANDOFF.md` — THIS DOCUMENT
