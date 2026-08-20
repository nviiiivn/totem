# TOTEM TOOLBOX — state, decisions, researched list
Updated: 2026-08-18. Companion to DASHBORED-MASTER.md (dashbored side) — this file is the TOTEM/project side.

## CURRENTLY ON (after restart)
Plugins (enabled): totempole, totem-log-sanitizer, session-transcript.mjs, opencode-mem, opencode-pty, @tarquinen/opencode-dcp, opencode-worktree, opencode-local-ollama (PATCHED: only `agent-*` models register; patch lives in ~/.cache/totem/packages/opencode-local-ollama/.../dist/ollama.js, original at .bak-agentfilter), usage-monitor, froggy, beads, cache-stats, mystatus, token-tracker, telemetry, history-search, plan-manager, background-agents, adaptive-thinking.
Plugins (installed, OFF): workaholic (flip on for list-days), notify, visualizer (pixel-horizon), harness-memory (enable for project-learning tasks), with-context-mcp (enable + seed .opencode/context/ per project).
MCP (13): flet, zai-search, zai-reader, zai-zread, reddit, context7, stv (remote via localhost:8801 systemd stv-serve), osm (uvx --with mcp<2), geowire (@geowirehq/mcp), fetcher, remoteopenclaw, reddit-research (mcp-remote wrapper → may ask one browser click first connect), chat-export (uvx opencode-chat-export).
Skills installed: pdf, docx, xlsx, pptx, mcp-builder (+ all preexisting: vercel×8 dead weight, deepwork, tdd, worktrees, etc.)

## DECISIONS (standing)
- DEAD forever: autotitle, websearch-cited (google), oc-mnemoria, openskills, quota (redundant w/ blue box), envsitter-guard (user disliked; reversible).
- PINNED for custom build: cc-safety-net-style veto plugin (our own, heavily customized) — folds in froggy hooks + snapshot trigger (need #8) + semantic-anchors-style rules.
- Never bulk-install again (Pi ceiling). Single adds only.
- "Tower day" phrase RETIRED. It meant "next time you're at the tower." Nothing is scheduled. To wire tower Ollama NOW: need tower LAN IP + Ollama listening on LAN (tower: OLLAMA_HOST=0.0.0.0), then set plugin host option. Models on tower per user: agent-gemma4-32b, openthinker, others (all agent-* = the filter matches).

## OPEN FLAGS
- telemetry: EACCES on ~/.opencode/commands — ~/.opencode is ROOT-OWNED (Jul 22). Fix needs one sudo from user: `sudo chown -R nvii:nvii ~/.opencode`
- usage-monitor blue box absent despite correct config — check once running after restart.
- reddit-research via mcp-remote — if it demands browser auth clicks and that annoys → drop it (plain reddit MCP covers browse/search).
- local-ollama pointed at localhost until tower IP given.
- RAG deferred until embeddings can run on tower GPU (Pi CPU = slow). Store choice irrelevant to that (LanceDB = embedded vector store like sqlite-for-vectors).

## RESEARCHED LIST — new things vs the 8 needs (from other session's taxonomy)
1. Context mgmt: **Sleev** (npm i -g sleev — DCP author's successor, local proxy, any-client) — try when dcp feels insufficient. opencode-short-term-memory = redundant tier, skip.
2. Pre-tool veto: custom build (pinned). **semantic-anchors** (JensGrote, BLOCK/WARN runtime contracts) = rules-engine donor for our build.
3. Secret hygiene: HALF-covered (paste-side sanitizer only). **gitleaks** CLI — required for GitHub pack anyway. Vault consolidation = closet-cleaning script work.
4. Corpus search: **agentcairn** (markdown vault + DuckDB BM25/vector/graph, local) = best Biography/vault fit. Base layer NOW: **ripgrep + fzf** (neither installed!). enquire-mcp = heavier alt.
5. Output filtering: custom plugin on fork's experimental.chat.messages.transform hook. Toys exist (UNMOJI, opencode-ascii) — proofs of pattern only.
6. Multi-machine sync: syncthing REJECTED (user: never works for him). Answer = rsync over SSH inside the snapshot scripts (work-area 1) — unidirectional pushes, no daemon, no conflict engine.
7. Model routing: config covers today. **opencode-litellm** when local models enter rotation (LiteLLM phase 4). opencode-provider-alias = ergonomics extra.
8. Snapshot triggers: custom script (taxonomy work-area 1: bash+rsync+git+sha256+sqlite checkpoint/WAL) + froggy hook = the build. FIRST priority per taxonomy.

## WORK-AREA TOOL GAPS (taxonomy 11 areas)
NOT installed anywhere: ast-grep (rebrand primary), ts-morph (add as dev-dep in repo when batch 2 starts), jdupes (closet), gitleaks (github pack), fzf+rg (base search), lazygit or delta (git legibility — pick lazygit, TUI-native user). sqlite3 ✓ present.

## SKILLS available from awesome-opencode-skills (cloned ~/Sandbox/tmp/aos — ephemeral, install = copy folder to ~/.claude/skills/)
Fit the totem project: using-git-worktrees, git-pushing, finishing-a-development-branch, review-implementing, staff-engineer-review, test-driven-development, test-fixing, changelog-generator, file-organizer (closet cleaning), skill-creator. NOT installed — awaiting pick.

## GitHub pack candidates
**github-mcp-server** (official, needs his GitHub token) for issues/PRs/releases from inside sessions; gitleaks for history scrubbing; CI = existing ci-pipeline skill.

## chat-export vs session-transcript
Compatible, different jobs: transcript = write-time raw recording (always on); chat-export = on-demand pretty markdown render from session DB (tool calls + costs). No conflict — independent readers of different artifacts.

## Formatters (totem `formatter` setting)
Options: prettier (config-file driven), biome (single binary, fast, zero-config, TS/JSON), dprint. Use = auto-format fork TS after edits. Current OFF is correct for surgery work; flip to biome when rebrand codemod batches start (consistent formatting across 3,497 import edits).
