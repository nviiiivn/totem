# TOTEM WORKORDER — 2026-08-21

Handoff doc for Claude sessions. Written from STATE.md/ROADMAP/wiki audit session.

## Rules of engagement (read first)

- ONE item per session where practical.
- Done = the item's proof command exits 0. Narrative "done" counts for nothing.
- Proof fails → item stays open. Fix it or report why, never summarize around it.
- Update STATE.md after every item, date-stamped.
- Default branch is `dev` (per AGENTS.md). Local `main` may not exist — diff against `dev` / `origin/dev`.
- Tests run from package dirs (e.g. `totem/`), NEVER repo root — root has a deliberate guard that exits 1.
- Branch names: max three words, hyphen-separated, no slashes or `feat/` prefixes.
- Commits: conventional — `type(scope): summary` (feat/fix/docs/chore/refactor/test).
- Machines: totem client on Pi5 (nvii@<aitp-ip>), ollama on Tower
  (nvii@<tower-ip>, fish shell — wrap commands in `bash -c`).

## A. Truth-telling (docs match reality)

1. README/wiki claim "rebrand complete" — Phase 1 ("strip the sand") never ran.
   - Fix: run Phase 1 as a deliberate pass (SALVAGE/ audit, umbreality/OMO purge,
     prompt-constitution removal) OR reword docs to "constant-swap done, Phase 1 pending."
   - Proof: docs no longer overclaim; grep for umbreality/OMO leftovers in scope = 0.

2. ROADMAP Phase 4 wording stale.
   - Fix: rewrite Phase 4 section to match STATE.md reality.
   - Proof: ROADMAP Phase 4 text matches STATE.md date-stamps exactly.

3. Wiki pages have no sync stamps.
   - Fix: add "last verified against STATE.md @ <commit>" to each wiki page.
   - Proof: every wiki page carries a stamp ≤ current STATE.md date.

4. `package.json` repository URL still points at `anomalyco/opencode` (upstream).
   - Fix: point it at `nviiiivn/totem` (or the canonical gitea remote).
   - Proof: `grep -n '"repository"' package.json` shows the totem URL.

## B. Backend verification

5. 🔴 PRIORITY — provider collision: manual provider.ollama vs opencode-local-ollama plugin.
   - Fix: restart totem, observe which registers, delete the loser, document in STATE.md.
   - Proof: model list shows each tower model exactly once, no duplicates.

6. Phase 3 faces: web + CLI unwired/unconfirmed.
   - Fix: boot each face (`bun run dev:web`, `dev:console`, `dev:desktop` exist at root),
     confirm one session round-trip, record gaps in STATE.md.
   - Proof: STATE.md Phase 3 table shows TUI/web/CLI each with a tested date.

7. Cartridge system not wired as totem tool.
   - Fix: register @totem-ai/cartridge as a tool; one e2e: PDF → pack → extract → translate.
   - Proof: e2e run exits 0.

8. Test debt: 4 cosmetic TUI snapshots + Truncate/HttpApi Server.listen/AppProcess one-offs.
   - Fix: intentionally update snapshots; convert one-offs into proper suites.
   - Proof: full suites green from package dirs — core 1016+, tui 187/187, zero accidental skips.

## C. Releases & GitHub

9. MUST — releases are linux-arm64 only; add linux-x86_64.
   - Note: developing on x86_64 already works (`bun install && bun run dev` — arch-agnostic TS).
     The gap is only the publish pipeline.
   - Fix: read `script/release` + `.github/workflows/publish.yml` first; add `bun-linux-x64`
     target to the build matrix; publish.
   - Proof: release page lists a linux-x86_64 artifact that runs on an amd64 machine.

10. Push test suite to GitHub Actions.
    - Fix: workflow running lint + full tests + sisyphus regression on PRs and `dev`.
    - Proof: green check on `dev`.

11. CONTRIBUTING.md is upstream's leftovers.
    - Fix: rewrite for totem or drop it; verify ATTRIBUTION.md still covers fork obligations.
    - Proof: no references to upstream dev workflows that don't exist here.

## D. Decisions (need nvii, then implement)

12. O2 amendment protocol — ROADMAP's open seam.
    - Fix: design doc for how the constitution changes without model self-editing.

13. Desktop face — DECIDE LATER, explore now:
    - Options:
      (a) adopt OpenChamber — github.com/openchamber/openchamber (the OG project:
          9k stars, pushed daily, openchamber.dev). NOTE: alvinunreal/openchamber is
          just a stale fork of it (0 commits ahead, 951 behind) — not his project.
          Mature OpenCode GUI: sessions, worktrees,
          MCP UI, providers, multi-run, voice, tunnels. Tracks CURRENT opencode-server.
      (b) port opencode's own desktop variant if usable at fork point.
      (c) build minimal own later.
    - Constraint: totem forks opencode v1.17.10; openchamber targets latest — API
      compatibility unverified.
    - Required first step: COMPAT SPIKE — point openchamber at totem's server, list
      what breaks. Half a day, read-only, commits to nothing.
    - Then: nvii decides; record in DECISIONS.md + ROADMAP future phase.

## E. How to run all this (the anti-merry-go-round)

- Step 0: read-only audit pass (Fable scoped per-subsystem, or Opus xhigh) in plan
  mode → CRACKS.md ledger: every claim in README/wiki/STATE/ROADMAP marked
  VERIFIED (command + output) or UNVERIFIED.
- Step 1: each item above carries its proof command. That's the whole game.
- Step 2: repair sessions — Opus xhigh for hard impl (items 5, 7), opusplan for
  plan→execute, Sonnet for sweeps (items 1–4, 9–11).
- Step 3: item 10 makes CI the standing judge — exit codes count, model say-so doesn't.
- Step 4: re-audit headless (`claude -p "<audit prompt>"`) — same ledger, diffable.
