# TOTEM DEVELOPMENT LOG

> Running tracking document for totem development.
> Started: 2026-07-04
> Owner: nvii
> Current model: GLM-5.1 (totem-go)

---

## WHAT TOTEM IS

Fork of totem (github.com/sst/totem / github.com/anomalyco/totem).
TypeScript monorepo, Bun runtime, Effect-TS, SolidJS TUI, SQLite via Drizzle.
27 packages. Compiled binary: `totemken`.

Source: `/home/nvii/projects/totem/`
Config: `~/.config/totem/totem.json`
Constitution source: `/home/nvii/DocVault/DeVault/1 - AI Conversations/1.00 GLOBAL/1.00.1 Conversational Constitution.md`
Constitution embedded copy: `packages/totem/src/session/prompt/constitution.txt`
CLAUDE.md: `~/.claude/CLAUDE.md`

---

## CONSTITUTION ENFORCEMENT STATUS

### Current Implementation

Constitution (25 rules) is injected as plain text at ONE point:
`packages/totem/src/session/system.ts:65` -> `PROMPT_CONSTITUTION`

Flow: `system.ts:environment()` -> `prompt.ts:1359-1371` (assembled into system[]) -> `request.ts:58-66` (joined into single string for LLM)

Covers: all agents (build, plan, general, explore, compaction, title, summary, custom)
Reinforcement: only build + plan agents have extra constitution prompt in totem.json

### Gap Assessment

| Gap | Description | Severity | Tier |
|-----|-------------|----------|------|
| G1 | No programmatic enforcement - all rules are soft/prompt-only | High | 2-3 |
| G2 | Model-family prompts conflict with constitution (identity, verbosity, sycophancy) | High | 1 |
| G3 | Only build+plan get constitution reinforcement, not general/explore/utility | Medium | 1 |
| G4 | constitution.txt is a static copy, can drift from DocVault source | Medium | 1 |
| G5 | CLAUDE.md points to DocVault but totem loads inline copy - redundant but no sync | Low | 1 |
| G6 | API keys hardcoded in totem.json (security violation) | High | - |

### Tier 1: Prompt Consistency (edits only, no new code)

- [ ] T1.1 Rename "totem"/"Totem" to "totem" in all prompt files
      Files: default.txt, anthropic.txt, gpt.txt, gemini.txt, beast.txt, codex.txt, trinity.txt, kimi.txt
- [ ] T1.2 Strip sycophantic/performative framing from model prompts (Rule 18)
      "best coding agent on the planet" etc
- [ ] T1.3 Strip verbosity guidance that conflicts with Rule 4 length logic
      default.txt:17-19 "answer in 1-3 sentences... fewer than 4 lines"
- [ ] T1.4 Add constitution reinforcement line to general + explore agents
- [ ] T1.5 Sync constitution.txt from DocVault source (live load or build step)

### Tier 2: Code-Level Output Validation (new code in session layer)

- [ ] T2.1 Post-response length filter for discursive queries (Rule 4)
- [ ] T2.2 Sycophancy regex filter "you're right", "great question", etc (Rule 6/18)
- [ ] T2.3 Violation counter in session state (Rule 8 escalation)
- [ ] T2.4 Approach tracking for Rules 20/21 pivot/hard-stop

### Tier 3: Constitution as First-Class Context Source

- [ ] T3.1 Register constitution in src/system-context/ registry
- [ ] T3.2 Per-model configurability (utility agents get condensed version)
- [ ] T3.3 Context Epoch boundary management

### Security (separate from constitution)

- [ ] S.1 Move API keys from totem.json to environment variables
      Keys affected: openrouter, totem-go, totem providers

---

## OH-MY-TOTEMPOLE (marketplace/ecosystem integration)

### Discovery Results (2026-07-04)

| Resource | URL | Stars | Status |
|----------|-----|-------|--------|
| oh-my-openagent | github.com/code-yeongyu/oh-my-openagent | 64.8k | Active, updated 12h ago |
| oh-my-totem-slim | github.com/alvinunreal/oh-my-totem-slim | 6.5k | Active, 49 releases, v2.1.0 |
| awesome-totem | github.com/awesome-totem/awesome-totem | 8.6k | Active, 150+ plugins listed |
| awesome-totem-subagents | github.com/ankitmundada/awesome-totem-subagents | 24 | 100+ subagents |
| awesome-totem-skills | github.com/jshsakura/awesome-totem-skills | 19 | 136+ skills, auto-sync |
| awesome-claude-code | github.com/hesreallyhim/awesome-claude-code | 48.1k | Active, 15 sections |
| awesome-claude-code-subagents | github.com/VoltAgent/awesome-claude-code-subagents | 22.9k | 100+ subagents |
| awesome-claude-skills | github.com/travisvn/awesome-claude-skills | 13.9k | Active |
| awesome-mcp-servers | github.com/punkpeye/awesome-mcp-servers | 90.3k | Active, canonical MCP list |
| totem-marketplace (NikiforovAll) | github.com/NikiforovAll/totem-marketplace | 8 | Stale (Feb) |
| totem-souk | github.com/Mirrowel/totem-souk | 4 | TUI marketplace, updated May |
| agentsys | github.com/agent-sh/agentsys | 886 | 24 plugins, 49 agents, 44 skills |
| totem-power-pack | github.com/waybarrios/totem-power-pack | 415 | 11 Claude skills ported to totem |
| claude-mem | github.com/thedotmack/claude-mem | 85.9k | Persistent memory, already installed locally |

### Already installed locally (marketplaces)

| Marketplace | Path | Contents |
|-------------|------|----------|
| thedotmack | ~/.claude/plugins/marketplaces/thedotmack/ | claude-mem, openclaw, ragtime, docker, tools |
| claude-plugins-official | ~/.claude/plugins/marketplaces/claude-plugins-official/ | 35 internal plugins + 15 external |

### claude-plugins-official: Internal plugins (35)

agent-sdk-dev, clangd-lsp, claude-code-setup, claude-md-management, code-modernization,
code-review, code-simplifier, commit-commands, csharp-lsp, cwc-makers, example-plugin,
explanatory-output-style, feature-dev, frontend-design, gopls-lsp, hookify,
jdtls-lsp, kotlin-lsp, learning-output-style, lua-lsp, math-olympiad, mcp-server-dev,
mcp-tunnels, php-lsp, playground, plugin-dev, pr-review-toolkit, pyright-lsp, ralph-loop
ruby-lsp, rust-analyzer-lsp, security-guidance, session-report, skill-creator, swift-lsp
typescript-lsp

### claude-plugins-official: External plugins (15)

asana, context7, discord, fakechat, firebase, github, gitlab, greptile, imessage
laravel-boost, linear, playwright, serena, telegram, terraform

### oh-my-totempole TODO

- [ ] O.1 Clone and evaluate oh-my-totem-slim for what agents/tools to port
- [ ] O.2 Clone and evaluate awesome-totem list for plugins/skills/MCP servers
- [ ] O.3 Clone and evaluate awesome-claude-code for portable skills/agents
- [ ] O.4 Clone and evaluate awesome-mcp-servers for MCP servers to integrate
- [ ] O.5 Evaluate agentsys (24 plugins, 49 agents, 44 skills) for porting
- [ ] O.6 Evaluate totem-power-pack (11 ported skills)
- [ ] O.7 Design oh-my-totempole marketplace structure within totem
- [ ] O.8 Port selected plugins/skills/agents/MCP servers into totem
- [ ] O.9 Create marketplace config in .totem/ or .totem/

---

## CACHE / OVERHEAD TUNING

### TODO

- [ ] C.1 Research current cache/timeout/overhead limits in totem source
- [ ] C.2 Identify where model context windows are configured
- [ ] C.3 Identify where tool/plugin limits are set
- [ ] C.4 Increase limits for larger context, more tools, more plugins
- [ ] C.5 Test with expanded limits

---

## WORK LOG

### 2026-07-04

- Explored totem project structure (27 packages, TypeScript, Bun, Effect-TS)
- Read full constitution (25 rules) from DocVault
- Mapped constitution injection path: constitution.txt -> system.ts:65 -> prompt.ts -> request.ts
- Identified 6 gaps in constitution enforcement
- Found Oh My Totem ecosystem (fragmented: oh-my-openagent 64.8k, oh-my-totem-slim 6.5k)
- Found awesome-totem (8.6k stars, 150+ plugins), awesome-mcp-servers (90.3k stars)
- Inventoried local marketplaces: thedotmack (claude-mem), claude-plugins-official (50 plugins)
- Created this tracking document

---

## NOTES

- Running compiled binary (totemken), so source edits are safe until rebuild
- Rebuild requires external terminal: ./packages/totem/script/build.ts --single
- Keep a stable binary as fallback when modifying session engine
- DB schema changes (packages/core) need testing against copy first
- ASCII only in terminal output - no unicode boxes/em-dashes
---

## INTEGRATION PROGRESS

### 2026-07-04 (continued)

#### Plugins installed in totem.json (10 npm plugins)
- [x] envsitter-guard (v0.0.4) - .env file protection
- [x] totem-log-sanitizer (v1.3.0) - secret redaction before model
- [x] cc-safety-net (v1.0.6) - destructive command blocking
- [x] totem-supermemory (v2.0.8) - persistent cross-session memory
- [x] totem-pty (v0.3.4) - background PTY processes
- [x] totem-websearch-cited (v1.2.0) - cited web search
- [x] @tarquinen/totem-dcp (v3.1.14) - dynamic context pruning
- [x] workaholic (v1.3.0) - blocks premature "done"
- [x] totem-notify (v0.3.1) - OS notifications
- [x] totem-worktree (v0.4.1) - git worktree management

#### MCP servers in .totem/totem.jsonc (7 servers)
- [x] context7 (@upstash/context7-mcp v3.2.2) - up-to-date docs lookup
- [x] playwright (@playwright/mcp v0.0.77) - browser automation
- [x] github (HTTP MCP) - GitHub API access (needs GITHUB_PERSONAL_ACCESS_TOKEN env)
- [x] sentry (@sentry/mcp-server v0.37.0) - error tracking
- [x] notion (@notionhq/notion-mcp-server v2.4.1) - Notion API (needs NOTION_API_KEY env)
- [x] atlassian (mcp-atlassian v2.1.0) - Jira/Confluence (needs ATLASSIAN_* env)
- [x] shadcn (shadcn-registry-mcp v1.0.2) - Shadcn component registry

#### Compaction config applied (totem.json)
- [x] compaction.reserved: 40000
- [x] compaction.tail_turns: 4
- [x] compaction.preserve_recent_tokens: 16000

#### Remaining Tier 1 (pattern studies, not installable)
- [ ] ControlFlowMonitor (Go repo, not npm) - study for Rule 20/21 enforcement patterns
- [ ] symbiotic-ai - study for cooperation patterns
- [ ] agent-zero - study for dual-runtime isolation, Time Travel, DOX hierarchy
- [ ] hermes-agent - study for function-calling patterns / subagent model

#### Env vars needed (user must set)
- [ ] GITHUB_PERSONAL_ACCESS_TOKEN
- [ ] NOTION_API_KEY
- [ ] ATLASSIAN_API_TOKEN, ATLASSIAN_EMAIL, ATLASSIAN_SITE
- [ ] SUPERMEMORY_API_KEY (optional, can use browser login)
