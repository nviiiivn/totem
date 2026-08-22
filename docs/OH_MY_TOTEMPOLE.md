# OH-MY-TOTEMPOLE: Integration Inventory and Discussion

> Staging: /home/nvii/Sandbox/tmp/awesome-sources/
> Compiled: 2026-07-04
> All repos cloned and examined. This doc is for review before any integration.

---

## TIER 1: DEFINITE MUST HAVES

High-value, directly compatible, fill real gaps in totem.

### 1. totem-supermemory
- Source: github.com/supermemoryai/totem-supermemory
- Type: Plugin (npm)
- What: Persistent cross-session, cross-project memory. Profile + project knowledge scoping. Hooks context injection on first message. Keyword detection auto-saves. Preemptive compaction at 80% context. /supermemory-init indexes codebase.
- Integration: Add "totem-supermemory" to plugin array in totem.json. Auth via SUPERMEMORY_API_KEY or browser login. Supports self-hosted baseUrl.
- Why MUST: Totem has NO persistent memory across sessions. This fills it completely.
- Action: ADD DIRECTLY (npm install + plugin registration)

### 2. totem-pty
- Source: github.com/shekohex/totem-pty
- Type: Plugin (npm)
- What: Interactive PTY management. Spawns background processes (dev servers, watch modes, REPLs). Tools: pty_spawn, pty_write, pty_read, pty_list, pty_kill. Web UI for live monitoring. notifyOnExit flag eliminates polling.
- Integration: Add "totem-pty" to plugin array.
- Why MUST: Totem's built-in bash is synchronous only. This enables long-running dev servers and interactive REPLs.
- Action: ADD DIRECTLY

### 3. totem-dynamic-context-pruning (DCP)
- Source: github.com/Totem-DCP/totem-dynamic-context-pruning
- Type: Plugin (npm: @tarquinen/totem-dcp)
- What: Model-driven context compression. Compress tool replaces stale content with high-fidelity summaries. Nested summaries preserve info across layered compressions. Protected tool outputs (task, skill, todowrite, write, edit, plan_*) never lost. Dedup of repeated tool calls. Purge errors after N turns.
- Integration: Plugin registration. Config via dcp.jsonc. /dcp slash command opens TUI panel.
- Why MUST: Directly addresses context management gap. Pairs with constitution Rule 24 (session state tracking) and Rule 23 (approach log). Protected tool list aligns with state preservation.
- Trade-off: Invalidates prompt cache prefix (~85% hit vs ~90% without) but savings outweigh cost on long sessions.
- Action: ADD DIRECTLY

### 4. envsitter-guard
- Source: github.com/boxpositron/envsitter-guard
- Type: Plugin (npm)
- What: Blocks agents from reading/editing .env* files. Safe tools (envsitter_keys, envsitter_fingerprint) never expose raw values. Blocks read, edit, write, patch, multiedit on .env paths. Allows .env.example.
- Integration: Add "envsitter-guard" to plugin array.
- Why MUST: Directly enforces CLAUDE.md Security Rules ("Never read .env files"). This is the programmatic enforcement layer for that rule.
- Action: ADD DIRECTLY

### 5. totem-websearch-cited
- Source: github.com/ghoulr/totem-websearch-cited
- Type: Plugin (npm)
- What: LLM-grounded web search with inline citations [1] and Sources: list. Wraps Google Gemini Search, OpenAI web search, OpenRouter web search. Returns markdown with citations.
- Integration: Plugin registration. Requires per-provider websearch_cited.model config.
- Why MUST: Satisfies constitution Rule 2 (research before answering, always). Gives agents grounded, source-backed answers instead of hallucinated URLs.
- Action: ADD DIRECTLY (needs provider config)

### 6. ControlFlowMonitor
- Source: github.com/justyntemme/ControlFlowMonitor
- Type: Plugin/tool
- What: Monitors and controls agent execution flow. Prevents runaway loops, enforces step limits, tracks control flow.
- Why MUST: Directly enables constitution Rules 20/21 (approach counter, pivot on 2 failures, hard stop on 3). This is the programmatic enforcement layer for spiral detection.
- Action: ADD DIRECTLY, then configure to enforce Rule 20/21 thresholds

### 7. symbiotic-ai (lout33)
- Source: github.com/lout33/symbiotic-ai
- Type: Framework/plugin
- What: Symbiotic agent relationships. Agents that cooperate rather than just delegate.
- Why MUST: Enables multi-agent cooperation patterns needed for oh-my-totem-slim's Pantheon architecture.
- Action: STUDY architecture, then integrate patterns

### 8. context7 (upstash)
- Source: github.com/upstash/context7
- Type: MCP server
- What: Up-to-date documentation lookup. Queries live docs for any library/framework. Returns current API signatures, not training-data-stale info.
- Already installed: Yes, in claude-plugins-official/external_plugins/context7
- Why MUST: Satisfies constitution Rule 2 (read official documentation before answering). Eliminates stale training-data answers for library questions.
- Action: ALREADY HAVE IT - verify it's enabled in totem config

### 9. Playwright MCP
- Source: Already in claude-plugins-official/external_plugins/playwright
- Type: MCP server
- What: Browser automation. Navigate, click, fill, screenshot, extract content.
- Why MUST: Enables web testing, scraping, visual verification of frontend changes.
- Action: ALREADY HAVE IT - verify enabled

### 10. GitHub MCP
- Source: Already in claude-plugins-official/external_plugins/github
- Type: MCP server
- What: GitHub API access. Issues, PRs, commits, reviews.
- Action: ALREADY HAVE IT - verify enabled

### 11. Sentry MCP
- Type: MCP server
- What: Error tracking integration. Pull production errors into agent context.
- Action: INSTALL (find official MCP server, add to totem MCP config)

### 12. Notion MCP
- Type: MCP server
- What: Notion API access. Read/write docs, databases.
- Action: INSTALL if you use Notion

### 13. Atlassian MCP
- Type: MCP server
- What: Jira/Confluence access. Ticket tracking, wiki docs.
- Action: INSTALL if you use Jira/Confluence

### 14. Shadcn Registry MCP
- Type: MCP server
- What: Shadcn UI component registry access. Lookup components, install patterns.
- Action: INSTALL for frontend work

### 15. totem-notify (kdcokenny)
- Source: github.com/kdcokenny/totem-notify
- Type: Plugin (ocx add kdco/notify)
- What: Native OS notifications. Session complete, errors, permission needed, question asked. macOS/Windows/Linux. Focus detection. Quiet hours.
- Integration: ocx add kdco/notify. Config in kdco-notify.json.
- Why MUST: Background-agent workflows. Know when delegated work finishes without watching the terminal.
- Action: ADD DIRECTLY

### 16. totem-worktree (kdcokenny)
- Source: github.com/kdcokenny/totem-worktree
- Type: Plugin (ocx add kdco/worktree)
- What: Git worktree management. Each worktree auto-spawns its own terminal with totem running. worktree_create(branch), worktree_delete(reason). Syncs files, runs hooks.
- Integration: ocx add kdco/worktree. Config via .totem/worktree.jsonc.
- Why MUST: Parallel AI-driven branches without polluting main repo. Auto-terminal-spawn is the differentiator.
- Action: ADD DIRECTLY

### 17. agent-zero (agent0ai)
- Source: github.com/agent0ai/agent-zero
- Type: Full agent framework (Docker-based)
- What: Full Linux system for AI agent. Dual-runtime isolation (framework venv vs agent-code venv). Hierarchical multi-agent delegation. Time Travel snapshots. DOX framework (binding AGENTS.md hierarchy). Plugin hub (100+ plugins).
- Why MUST: The dual-runtime isolation pattern is genuinely clever. Time Travel (snapshot/diff/revert of workspace) is a strong safety layer. DOX AGENTS.md hierarchy with binding contracts is a clean model.
- Action: STUDY for patterns. Lift: (1) dual-runtime isolation concept, (2) Time Travel snapshot pattern, (3) DOX AGENTS.md hierarchy, (4) hierarchical delegation model. Do NOT run the Docker container - extract patterns into totem's native architecture.

### 18. hermes-agent (NousResearch)
- Source: github.com/NousResearch/hermes-agent
- Type: Agent framework
- What: Hermes agent system from Nous Research. Function calling, tool use, multi-step reasoning.
- Why MUST: User specifically wants this. Hermes has strong function-calling capabilities that could enhance totem's tool execution.
- Action: STUDY architecture. Evaluate as: (a) subagent model for specific task types, or (b) pattern source for totem's own tool-calling improvements.
---

## TIER 2: STRONG CONTENDERS (splice/fork/modify into totem)

These need adaptation but have high-value components.

### 19. oh-my-totem-slim (alvinunreal)
- Source: github.com/alvinunreal/oh-my-totem-slim
- Type: Full plugin suite (TypeScript/Bun)
- What: Multi-agent "Pantheon" orchestration. 8 agents (orchestrator + 7 specialists). Background-subagent scheduling. Multi-LLM council. Skills. MCPs. Tools. Multiplexer pane integration. Workflow commands. 468 tests.
- Agents: orchestrator (primary, scheduler-first), explorer (read-only recon), librarian (docs research via context7/gh_grep/websearch), oracle (strategic advisor + reviewer + YAGNI enforcer), designer (UI/UX), fixer (bounded implementation worker), observer (vision/media analysis), council (multi-LLM synthesizer), councillor (read-only advisor per-councillor).
- Skills: deepwork, reflect, simplify, codemap, clonedeps, worktrees, loop-engineering, release-smoke-test.
- Tools: council (multi-LLM fan-out + synthesis), cancel_task, acp_run, webfetch, ast-grep.
- Hooks: 14 lifecycle hooks (phase-reminder, task-session-manager, etc.).
- Why STRONG: Most complete totem orchestration suite. Nearly everything portable since totem is an totem fork. The orchestrator pattern with background subagent scheduling and multi-LLM council is exactly what oh-my-totempole should be.
- Action: FORK and rename to oh-my-totempole. Keep SDK hook surface. Rename brand strings. Port agent factory pattern, council manager, multiplexer, skills. This becomes the core of oh-my-totempole.

### 20. agentsys (agent-sh)
- Source: github.com/agent-sh/agentsys
- Type: Modular runtime + orchestration (Node.js)
- What: 24 plugins, 49 agents, 44 skills. Command -> Agent -> Skill pattern. Phase-gated pipelines enforced by hooks. State in tasks.json + flow.json (survives interruptions). Model tiering (opus=reasoning, sonnet=matching, haiku=mechanical).
- Key plugins: next-task, audit-project (10-agent review), perf, learn, agnix (config linter, 423 rules, SARIF), banthis (durable negative memory in CLAUDE.md/AGENTS.md), consult, debate, drift-detect.
- Why STRONG: banthis (durable negative memory) directly applicable to constitution enforcement - turn user corrections into persistent rules. agnix (config linter) could lint totem.json/AGENTS.md/SKILL.md. Phase-gated pipeline pattern fits totem's hooks. Certainty-graded findings for analyzers.
- Action: SPLICE: (1) banthis pattern for durable rule memory, (2) agnix-style config linter, (3) phase-gated pipeline pattern, (4) model tiering per agent.

### 21. awesome-claude-code-subagents (VoltAgent)
- Source: github.com/VoltAgent/awesome-claude-code-subagents
- Type: 154 subagents across 10 categories, distributed as Claude plugin marketplace.
- Categories: Core Development (11), Language Specialists (30), Infrastructure (16), Quality/Security (17), Data/AI (13), Dev Experience (15), Specialized Domains (14), Business/Product (16), Meta-Orchestration (11), Research/Analysis (11).
- Model routing: opus for deep reasoning (security/arch/finance), sonnet for everyday coding, haiku for quick tasks (docs/search/build).
- Tool philosophy: read-only reviewers get Read/Grep/Glob; researchers add WebFetch/WebSearch; code writers get Read/Write/Edit/Bash/Glob/Grep. Minimal necessary permissions.
- Why STRONG: 154 battle-tested subagent definitions with clean model routing and permission patterns. Language specialists alone (30 agents covering Angular, C++, C#, Django, Elixir, Go, Java, JS, Kotlin, Laravel, Next.js, Node, PHP, Python, etc.) are immediately useful.
- Action: PORT the most relevant agents. Priority picks: api-designer, backend-developer, frontend-developer, fullstack-developer, graphql-architect, microservices-architect, security-reviewer, code-reviewer, test-writer, devops-reviewer, database-specialist. Adapt permission model to totem's format.

### 22. gstack (garrytan)
- Source: github.com/garrytan/gstack
- Type: iOS/web ops toolkit (60+ skills)
- What: Multi-domain product-development operating system. Skills span engineering, design, iOS QA, observability, planning, deployment.
- Standout skills: investigate (systematic debugging + root cause), codex (OpenAI Codex CLI wrapper for second opinion), health (code quality dashboard), freeze/guard (restrict edits, destructive-command safety), context-save/context-restore (save and restore working context), autoplan, spec.
- Why STRONG: investigate and context-save/restore are directly useful. freeze/guard patterns align with constitution Rule 22 (scope fixed).
- Action: SPLICE: (1) investigate pattern, (2) context-save/restore, (3) freeze/guard safety patterns.

### 23. mattpocock-skills
- Source: github.com/mattpocock/skills
- Type: 38 skills across engineering/productivity/misc/personal.
- Standout skills: tdd (red/green loop), code-review (two-axis: Standards + Spec, parallel sub-agents), diagnosing-bugs (disciplined diagnosis loop), research (background agent investigates against primary sources), resolving-merge-conflicts, handoff (compact conversation into handoff doc), writing-great-skills (meta-skill for authoring skills), git-guardrails-claude-code (PreToolUse hook blocking dangerous git commands).
- Why STRONG: git-guardrails directly enforces CLAUDE.md git safety rules programmatically. tdd and code-review are high-quality engineering skills. handoff maps to constitution Rule 21 hard-stop re-entry pattern.
- Action: PORT: (1) git-guardrails as programmatic hook, (2) tdd skill, (3) code-review skill, (4) handoff skill for Rule 21 re-entry, (5) writing-great-skills as meta-skill.

### 24. antfu-skills
- Source: github.com/antfu/skills
- Type: 19 skills for Vue/JS ecosystem.
- Standout skills: pnpm (pnpm 10/11 workspaces, catalogs, patches), turborepo (monorepo build system), vitest (test framework), web-design-guidelines (UI compliance review), tsdown (library bundler), vite (Vite 8 config), nitro (server toolkit), nuxt (Nuxt 4), pinia (Vue state), unocss (atomic CSS).
- Why STRONG: pnpm, turborepo, vitest directly relevant to totem's own monorepo (Turborepo + Bun). web-design-guidelines already vendored in your ~/.claude/skills/.
- Action: PORT as reference skills for users working in this stack. pnpm and turborepo especially useful since totem itself uses this stack.

### 25. vercel-labs-skills
- Source: github.com/vercel-labs/skills
- Type: The `npx skills` CLI tool + 1 meta-skill (find-skills).
- What: CLI for discovering and installing skills from the open agent skills ecosystem. Commands: find, add, list, check, update, remove. Compatible with Claude Code, Codex, CMIS, Cursor.
- Why STRONG: find-skills meta-skill enables discovering/installing other skills on demand. The CLI itself could be a model for a totem-native skill installer.
- Action: STUDY the CLI architecture. Consider a totem-native equivalent (`totem skill add <repo>`).

### 26. daytona totem-plugin
- Source: github.com/daytonaio/daytona/tree/main/libs/totem-plugin
- Type: Plugin
- What: Daytona integration for totem. Daytona provides sandboxed dev environments in the cloud.
- Why STRONG: Sandboxed execution environments for agent-spawned code. Pairs with agent-zero's dual-runtime isolation concept.
- Action: STUDY. Consider as optional sandboxing layer for risky agent operations.

### 27. totem-log-sanitizer (from awesome-totem list)
- Source: github.com/errhythm/totem-log-sanitizer
- Type: Plugin
- What: Redacts JWTs, bcrypt hashes, base64 blobs, long strings before sending to the model.
- Why STRONG: Directly enforces CLAUDE.md Security Rules ("Never hardcode API keys, secrets, passwords"). Programmatic secret redaction before model sees output.
- Action: ADD DIRECTLY

### 28. CC Safety Net (from awesome-totem list)
- Source: github.com/kenryu42/claude-code-safety-net
- Type: Plugin
- What: Catches destructive git/fs commands before execution.
- Why STRONG: Programmatic enforcement of CLAUDE.md "Never run rm -rf on root, home, or project root directories". Pairs with mattpocock git-guardrails.
- Action: ADD DIRECTLY

### 29. Anchor (from awesome-ai-plugins list)
- Source: awesome-ai-plugins entry
- Type: Plugin
- What: Engineering discipline pack. Task-scope locking, anti-drift braking, condition-based review, pitfall writeback.
- Why STRONG: anti-drift braking maps to constitution Rule 12 (stop and realign when thread goes wrong). Task-scope locking maps to Rule 22 (scope fixed). Pitfall writeback is durable negative memory like banthis.
- Action: STUDY. Port anti-drift and scope-locking patterns.

### 30. Workaholic (from awesome-totem list)
- Source: awesome-totem entry
- Type: Plugin
- What: Blocks premature "done" from agents. Forces completeness verification.
- Why STRONG: Directly enforces constitution Rule 3 (complete output only, never partial). Programmatic enforcement layer.
- Action: ADD DIRECTLY or STUDY for pattern.

### 31. BRHP (from awesome-totem list)
- Source: github.com/ZanzyTHEbar/brhp
- Type: Plugin
- What: Persistent planning state with TUI sidebar.
- Why STRONG: Mirrors constitution Rule 24 (session state tracking). Persistent state across the conversation.
- Action: STUDY. Port session-state persistence pattern.

### 32. Steering (from awesome-totem list)
- Source: awesome-totem entry
- Type: Plugin
- What: Enforces behavioral contracts via plugin hooks. BLOCK/WARN modes. Profiles (socratic, architecture). Zod-validated YAML.
- Why STRONG: Behavioral contract enforcement is exactly what the constitution is. BLOCK/WARN modes = hard vs soft enforcement.
- Action: STUDY. This is the closest existing implementation of what constitution Tier 2/3 enforcement should look like.

### 33. open-plan-annotator (from awesome-totem list)
- Source: github.com/ndom91/open-plan-annotator
- Type: Plugin
- What: Intercepts plan mode, opens browser annotation UI for plan strikethrough/replace/comment.
- Why STRONG: Maps to constitution Rule 22 (scope control) - visual scope management.
- Action: STUDY if you want visual plan/scope management.

### 34. agent-dotfiles (from awesome-totem list)
- Source: github.com/saqibameen/agent-dotfiles
- Type: Tool
- What: Write AI coding rules once, sync to every agent (Claude Code, Cursor, Codex, Totem).
- Why STRONG: Solves the "keep constitution/AGENTS.md/CLAUDE.md in sync across tools" problem.
- Action: STUDY. Could be the mechanism for keeping constitution.txt synced from DocVault.

---

## TIER 3: WORTH EXPLORING (play with, learn from, maybe integrate later)

### 35. totem-wakatime (angristan)
- Source: github.com/angristan/totem-wakatime
- Type: Plugin (npm)
- What: WakaTime metrics for AI coding activity. Tracks file reads/edits, lines added/removed, time-in-session. Sends --ai-line-changes for WakaTime's AI coding analytics dashboard.
- Why EXPLORE: Pure metrics/telemetry. Only relevant if you use WakaTime. No functional benefit to the agent itself.
- Action: OPTIONAL - add only if you want AI-coding metrics dashboards.

### 36. totem-antigravity-auth (NoeFabris)
- Source: github.com/NoeFabris/totem-antigravity-auth
- Type: Plugin
- What: OAuth bridge to use Google Antigravity rate limits and quota for Claude + Gemini via Google credentials. Multi-account rotation, dual quota, thinking models with configurable budgets.
- ToS risk: Violates Google's TOS. Account bans reported.
- Why EXPLORE: Free/subsidized access to Claude/Gemini through Google credentials. Risk of account ban is real.
- Action: SKIP unless you specifically need Antigravity quota routing and accept the risk.

### 37. totem-agent-skills (joshuadavidthomas)
- Source: github.com/joshuadavidthomas/totem-agent-skills
- Type: Plugin (npm) - maintenance mode
- What: Dynamic skill discovery + loading + semantic auto-matching + compaction-resilient skill reinjection.
- Why EXPLORE: totem now has first-party skill support natively. This plugin's extras (semantic auto-matching, synthetic injection, compaction reinjection) are nice-to-haves, not gaps.
- Action: SKIP - totem native skill support covers this. Only consider if you want auto-triggering of skills without explicit /skill invocation.

### 38. gpt-code-clippy (CodedotAl)
- Source: github.com/CodedotAl/gpt-code-clippy
- Type: VS Code extension
- What: Open-source GitHub Copilot clone.
- Why EXPLORE: Reference implementation for inline code completion. Not directly relevant to a CLI agent like totem.
- Action: SKIP unless building IDE integration later.

### 39. TabbyML/tabby
- Source: github.com/TabbyML/tabby
- Type: Self-hosted AI coding assistant
- What: Self-hosted, runs local models for code completion. Connects to IDEs.
- Why EXPLORE: If you want local model support beyond Ollama. Tabby could be a local completion backend.
- Action: STUDY if you want totem to support local Tabby models alongside Ollama.

### 40. e2b (e2b-dev)
- Source: github.com/e2b-dev/e2b
- Type: Sandboxed code execution platform
- What: Cloud sandboxes for AI code execution. Spins up secure environments for agent-written code.
- Why EXPLORE: Pairs with agent-zero's dual-runtime isolation concept. E2B could be the cloud sandbox layer if local Docker isolation isn't enough.
- Action: STUDY as optional sandboxing backend for risky agent operations.

### 41. AutoGen (Microsoft)
- Source: github.com/microsoft/autogen
- Type: Multi-agent framework
- What: Build AI workflows including code agents. Conversation-driven multi-agent orchestration.
- Why EXPLORE: Reference for multi-agent conversation patterns. Different architecture than totem but worth studying group-chat and role-assignment patterns.
- Action: STUDY for multi-agent conversation patterns. Do not integrate directly - different ecosystem.

### 42. Composio (ComposioHQ)
- Source: github.com/ComposioHQ/composio
- Type: Tool/integration platform
- What: 9000+ app integrations via unified API. GitHub, Slack, Notion, Linear, Jira, Sentry, Gmail, Discord, etc. Agent-ready tools with authentication handled.
- Why EXPLORE: Could replace individual MCP servers (Notion, Sentry, Atlassian, GitHub) with one Composio integration. Single integration point for many services.
- Trade-off: Adds external dependency. Individual MCP servers are more self-contained.
- Action: STUDY. Decision point: Composio (one integration, many apps) vs individual MCP servers (each independent). Recommend individual MCP servers for critical services + Composio for the long tail.

### 43. rowboat (rowboatlabs)
- Source: github.com/rowboatlabs/rowboat
- Type: Agent building platform
- What: Visual multi-agent builder. Build, test, deploy agents through a UI.
- Why EXPLORE: Worth studying for multi-agent workflow design patterns. Not directly integrable into totem.
- Action: STUDY for workflow design patterns only.

### 44. tangle-two
- Source: github.com/tangle-two
- Type: Unknown (repo URL returned 404 on clone - may be private or moved)
- Action: VERIFY URL. Cannot evaluate without access.

### 45. Hermes plugins (composio.dev/explorium.ai)
- Source: composio.dev/content/best-hermes-plugins, explorium.ai blog
- Type: Plugin ecosystem for Hermes
- What: Go-to-market plugin, GTM workflows for Hermes agent.
- Why EXPLORE: If we integrate hermes-agent (item 18), these plugins expand its capabilities.
- Action: EXPLORE after deciding on hermes-agent integration path.

### 46. awesome-claude-code (hesreallyhim)
- Source: github.com/hesreallyhim/awesome-claude-code
- Type: Awesome-list (48k stars)
- What: Hand-picked collection of Claude Code resources. 15 sections: Start Here, From Anthropic, Documentation, Research, Providers, Remote Control, Alternative Clients, Status Lines, Design, Writing, Creative Media, Infrastructure, Security, Multi-Agent Orchestration, Memory, Usage Monitoring, Linting.
- Why EXPLORE: Mass curated resource. Security and Multi-Agent Orchestration sections likely have more integrable items.
- Action: REFERENCE. Mine for additional items not already in this doc.

### 47. awesome-mcp-servers (punkpeye)
- Source: github.com/punkpeye/awesome-mcp-servers
- Type: Awesome-list (90k stars)
- What: Canonical curated list of MCP server implementations. 8000+ commits.
- Why EXPLORE: Any MCP server we want not already listed above, find it here.
- Action: REFERENCE. Mine for additional MCP servers beyond Sentry/Notion/Atlassian/Shadcn.

---

## TIER 4: REFERENCE LISTS (mine for more, not integrable themselves)

### 48. awesome-totem
- Source: github.com/awesome-totem/awesome-totem
- Type: Curated list (8.6k stars, 150+ plugins)
- What: The canonical totem ecosystem list. Already mined for items above.

### 49. Awesome-AI-Agents (Jenqyang)
- Source: github.com/Jenqyang/Awesome-AI-Agents
- Type: Academic catalog of AI agent projects
- What: Autonomous task solvers, multi-agent, frameworks, benchmarks, tools, surveys.
- Notable tools found: Agent OS (governance toolkit), AgentGuard (loop detection, budget, replay), APort Agent Guardrails (pre-action auth), Kontext CLI (local guardrails), Agentic Radar (security scanner), DOS Kernel (verifies "done" from git evidence), IronClaw (security-first platform), harness-starter-kit (failure memory, drift checks).
- Action: REFERENCE. Several governance tools worth deeper evaluation for Tier 2.

### 50. awesome-ai-plugins (hashgraph-online)
- Source: github.com/hashgraph-online/awesome-ai-plugins
- Type: Curated Codex plugins marketplace list
- What: Codex plugins gated by HOL Plugin Scanner. Official (OpenAI: Box, Figma, GitHub, Linear, Notion, Sentry, Slack, Vercel) + Community.
- Notable: Aegis (planning, TDD, debugging), ArmorCodex (intent-based security with policy gating), Boss (BMAD pipeline, 9 agents).
- Action: REFERENCE. Some Codex plugins may be portable to totem with adaptation.

### 51. kyrolabs/awesome-agents
- Source: github.com/kyrolabs/awesome-agents
- Type: Awesome-list of agent frameworks
- What: Lists LangChain, LlamaIndex, CrewAI, AutoGen, Swarms, PraisonAI, etc.
- Action: REFERENCE only.

### 52. e2b-dev/awesome-ai-agents
- Source: github.com/e2b-dev/awesome-ai-agents
- Type: Awesome-list
- Action: REFERENCE only.

### 53. agentskills.io
- Source: agentskills.io
- Type: Web directory
- Action: REFERENCE. Browse for additional skills.

### 54. skillsllm.com
- Source: skillsllm.com/skill/awesome-claude-plugins
- Type: Web directory
- Action: REFERENCE. Browse for Claude plugins.

### 55. awesomeclaude.ai
- Source: awesomeclaude.ai
- Type: Web directory
- Action: REFERENCE. Browse for Claude resources.

### 56. awesomeskill.ai
- Source: awesomeskill.ai
- Type: Web directory
- Action: REFERENCE.

### 57. aitidbits.ai open-source-agents article
- Source: aitidbits.ai/p/open-source-agents-updated
- Type: Blog/article
- Action: REFERENCE. Read for trends and new tools.

### 58. dev.to subagents article
- Source: dev.to/nfrankel/experimenting-with-ai-subagents
- Type: Blog/article
- Action: REFERENCE. Read for subagent design patterns.

### 59. aimultiple.com open-source-ai-agents
- Source: aimultiple.com/open-source-ai-agents
- Type: Article/list
- Action: REFERENCE.

### 60. NVIDIA GB10 forum thread
- Source: forums.developer.nvidia.com/t/agent-harnesses-that-run-really-good-local-ai-for-gb10-systems/371167/6
- Type: Forum thread
- What: Discussion about agent harnesses running local AI on GB10 (Jetson Thor) systems.
- Action: REFERENCE. Relevant if running totem on edge/local GPU hardware.

### 61. kalpathy-skills (multica-ai)
- Source: github.com/multica-ai/andrej-karpathy-skills
- Type: Skills collection
- What: Skills inspired by Andrej Karpathy's work.
- Action: REFERENCE. Browse for ML/AI engineering skills.

### 62. LM Studio
- Source: lmstudio.ai
- Type: GUI to run open models locally
- What: Local model runner that integrates with IDEs.
- Action: OPTIONAL. Already have Ollama (<tower-ip>:11434). LM Studio could be alternative local model provider.

### 63. penpot.app
- Source: penpot.app
- Type: Design tool
- Action: REFERENCE. Design tool, not directly integrable.

### 64. TabbyML
- Source: github.com/TabbyML/tabby (same as item 39)
- Action: See item 39.


---

## SUMMARY: PRIORITY ACTION MATRIX

### ADD DIRECTLY (npm install + plugin/MCP registration, minimal config)
- totem-supermemory (persistent memory)
- totem-pty (background PTY processes)
- totem-dynamic-context-pruning (model-driven context compression)
- envsitter-guard (.env file protection)
- totem-websearch-cited (cited web search)
- ControlFlowMonitor (flow/state enforcement)
- totem-notify (OS notifications)
- totem-worktree (parallel worktree sessions)
- totem-log-sanitizer (secret redaction)
- CC Safety Net (destructive command blocking)
- Workaholic (premature-done blocking)
- Verify context7, Playwright, GitHub MCPs already enabled
- Install Sentry, Notion, Atlassian, Shadcn MCPs as needed

### FORK/RENAME (oh-my-totempole core)
- oh-my-totem-slim -> oh-my-totempole (the orchestration core)

### SPLICE (extract patterns/components)
- agentsys: banthis (durable negative memory), agnix (config linter), phase-gated pipelines, model tiering
- awesome-claude-code-subagents: 11 priority subagents (api-designer, backend, frontend, fullstack, graphql, microservices, security, code-review, test-writer, devops, db-specialist)
- mattpocock-skills: git-guardrails hook, tdd, code-review, handoff, writing-great-skills
- gstack: investigate, context-save/restore, freeze/guard
- antfu-skills: pnpm, turborepo, vitest, web-design-guidelines
- agent-zero patterns: dual-runtime isolation, Time Travel snapshots, DOX AGENTS.md hierarchy
- Anchor: anti-drift braking, task-scope locking
- BRHP: session-state persistence
- Steering: behavioral contract enforcement (BLOCK/WARN modes)
- agent-dotfiles: cross-tool rule sync mechanism

### STUDY (architecture/patterns, do not integrate directly)
- hermes-agent (evaluate as subagent model or pattern source)
- symbiotic-ai (cooperation patterns)
- AutoGen (multi-agent conversation patterns)
- rowboat (visual workflow design)
- e2b (sandboxing backend)
- Daytona (cloud sandboxing)
- Composio (unified integration vs individual MCPs)
- TabbyML (local model alternative)

### REFERENCE (mine for more, do not integrate)
- awesome-totem, Awesome-AI-Agents, awesome-ai-plugins
- awesome-claude-code, awesome-mcp-servers, awesome-agents, awesome-ai-agents
- agentskills.io, skillsllm.com, awesomeclaude.ai, awesomeskill.ai
- All blog/article links
- NVIDIA forum thread

### SKIP/DEFER
- totem-wakatime (metrics only, no agent benefit)
- totem-antigravity-auth (TOS violation risk)
- totem-agent-skills (totem native skill support covers this)
- gpt-code-clippy (VS Code extension, not CLI)
- penpot (design tool)
- tangle-two (404, cannot evaluate)

---

## INTEGRATION ORDER (suggested)

1. Config: Apply compaction/token limit increases (done - in totem.json)
2. Security: envsitter-guard, CC Safety Net, totem-log-sanitizer (immediate protection)
3. Memory: totem-supermemory (cross-session memory)
4. Context: totem-dynamic-context-pruning (context management)
5. Flow: ControlFlowMonitor (Rule 20/21 enforcement)
6. Background ops: totem-pty (dev servers, REPLs)
7. Research: totem-websearch-cited, verify context7 (Rule 2 satisfaction)
8. Workflow: totem-notify, totem-worktree (QoL for parallel work)
9. Completeness: Workaholic (Rule 3 enforcement)
10. MCP servers: Sentry, Notion, Atlassian, Shadcn (as needed)
11. Core: Fork oh-my-totem-slim -> oh-my-totempole (orchestration suite)
12. Splice: agentsys banthis + agnix, mattpocock git-guardrails + skills, gstack patterns
13. Port: awesome-claude-code-subagents priority agents
14. Study: hermes-agent, agent-zero patterns, Steering, BRHP

---

## QUESTIONS FOR REVIEW

1. Composio (one integration, many apps) vs individual MCP servers (each independent)? Which approach?
2. Hermes-agent: integrate as a subagent model, or extract function-calling patterns into totem native?
3. agent-zero: how much of the Docker sandboxing concept do you want to bring into totem (if any)?
4. totem-antigravity-auth: skip due to TOS risk, or accept the risk for free Claude/Gemini quota?
5. awesome-claude-code-subagents: which of the 154 agents do you actually want? All 11 priority picks, or narrower selection?
6. oh-my-totem-slim fork: full port (all 8 agents + 8 skills + tools + hooks), or selective port of only orchestrator + council + key agents?
7. Local model support: keep Ollama only, or add LM Studio / TabbyML as alternatives?
8. Sentry/Notion/Atlassian MCPs: do you actively use these services?

