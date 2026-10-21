# Installation Guide

Complete installation instructions for totempole.

## Table of Contents

- [For Humans](#for-humans)
- [For LLM Agents](#for-llm-agents)
- [Troubleshooting](#troubleshooting)
- [Uninstallation](#uninstallation)

---

## For Humans

### Quick Install

Run the interactive installer:

```bash
bunx totempole@latest install
```

Or use non-interactive mode:

```bash
bunx totempole@latest install --no-tui --skills=yes --background-subagents=yes
```

### Configuration Options

The installer supports the following options:

| Option | Description |
|--------|-------------|
| `--skills=yes|no` | Install bundled skills (default: yes) |
| `--companion=ask\|yes\|no` | Install and enable the desktop Companion (`ask` by default; prompt defaults to no) |
| `--preset=<name>` | Active generated config preset: `openai` or `totem-go` (default: `openai`) |
| `--background-subagents=ask\|yes\|no` | Configure the required background-subagents environment export (`ask` by default; prompt defaults to yes) |
| `--background-subagents-target=<path>` | Write the background-subagents export to a specific shell/profile file |
| `--no-tui` | Non-interactive mode |
| `--dry-run` | Simulate install without writing files |
| `--reset` | Force overwrite of existing configuration |

### Background Subagents Environment Setup

Background orchestration is the default workflow. It depends on Totem's native
background subagents, which are enabled by this environment variable:

```bash
TOTEM_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true
```

The installer asks before adding that export to your shell startup file. The
prompt defaults to `yes` because V2's default orchestration depends on it.

```bash
bunx totempole@latest install
```

For non-interactive setup, pass the choice explicitly:

```bash
bunx totempole@latest install --no-tui --background-subagents=yes
```

After the installer updates a shell startup file, restart your terminal or source
the file before launching Totem. Examples:

```bash
source ~/.zshrc
# or
source ~/.bashrc
```

For a one-shot manual launch without restarting your terminal:

```bash
TOTEM_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true totem
```

### Non-Destructive Behavior

By default, the installer is non-destructive. If an `totempole.json` configuration file already exists, the installer will **not** overwrite it. Instead, it will display a message:

```
[i] Configuration already exists at ~/.config/totem/totempole.json. Use --reset to overwrite.
```

To force overwrite of your existing configuration, use the `--reset` flag:

```bash
bunx totempole@latest install --reset
```

**Note:** When using `--reset`, the installer creates a `.bak` backup file before overwriting, so your previous configuration is preserved.

### After Installation

The installer generates both OpenAI and Totem Go presets, with OpenAI active by default (using variant-aware `gpt-5.5` and `gpt-5.4-mini` models, including `gpt-5.5 (medium)` for Orchestrator, `gpt-5.5 (high)` for Oracle, `gpt-5.5 (low)` for Fixer, and `gpt-5.4-mini` variants for other specialists). To make Totem Go active during install, run `bunx totempole@latest install --preset=totem-go`. That preset uses GLM-5.1 for Orchestrator, so the installer also enables Observer with `totem-go/kimi-k2.6` for visual analysis. To switch providers later or build a mixed setup, use **[Configuration Reference](configuration.md)** for the full option reference and the preset docs for copyable examples.

The plugin safely reconciles bundled skills on startup and after successful
auto-updates. Missing bundled skills are installed, and previously managed skills
are updated only when their local files still match a known plugin-installed
version. If you customized a skill locally, the plugin preserves your active copy
and stages the new bundled version under
`~/.config/totem/.totempole/skill-updates/` for manual review.
Restart Totem after an auto-update to load the updated plugin and any changed
skills.

Then:

```bash
totem auth login
# Select your provider and complete OAuth flow
```

```bash
totem models --refresh
```

Open your generated config at `~/.config/totem/totempole.json`
and adjust models if needed.

Then run Totem and verify the agents:

```text
ping all agents
```

> **💡 Tip: Models are fully customizable.** The installer sets sensible defaults, but you can assign *any* model to *any* agent. Edit `~/.config/totem/totempole.json` (or `.jsonc` for comments support) to override models, adjust reasoning effort, or disable agents entirely.

### Alternative: Ask Any Coding Agent

Paste this into Claude Code, AmpCode, Cursor, or any coding agent:

```
Install and configure by following the instructions here:
https://raw.githubusercontent.com/alvinunreal/totempole/refs/heads/master/README.md
```

---

## For LLM Agents

If you're an LLM Agent helping set up totempole, follow these steps.

### Step 1: Check Totem Installation

```bash
totem --version
```

If not installed, direct the user to https://totem.ai/docs first.

### Step 2: Run the Installer

The installer generates OpenAI and Totem Go presets, with OpenAI active by default:

```bash
bunx totempole@latest install --no-tui --skills=yes
```

**Examples:**
```bash
# Interactive install
bunx totempole@latest install

# Non-interactive with bundled skills
bunx totempole@latest install --no-tui --skills=yes --background-subagents=yes

# Make the generated Totem Go preset active
bunx totempole@latest install --preset=totem-go

# Non-interactive without skills
bunx totempole@latest install --no-tui --skills=no

# Force overwrite existing configuration
bunx totempole@latest install --reset
```

The installer automatically:
- Adds the plugin to `totem.json` or `totem.jsonc` in
  `$TOTEM_CONFIG_DIR` when set, otherwise `~/.config/totem`
- Disables default Totem agents
- Enables Totem LSP integration when no explicit `lsp` setting exists
- Configures `TOTEM_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true` when approved
- Generates agent model mappings in the same Totem config directory as
  `totempole.json` (or `.jsonc`)

### Step 3: Authenticate with Providers

Ask user to run the following command. Don't run it yourself, it requires user interaction.

```bash
totem auth login
# Select your provider and complete OAuth flow
```

### Step 4: Verify Installation

Ask the user to:

1. Authenticate: `totem auth login`
2. Refresh models: `totem models --refresh`
3. Restart the terminal or source the shell file updated by the installer
   (`source ~/.zshrc` or `source ~/.bashrc`), then start Totem: `totem`
   - One-shot alternative: `TOTEM_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true totem`
4. Run: `ping all agents`

Verify all agents respond successfully.

**Crucial Advice for the User:**
- They can easily assign **different models to different agents** by editing `~/.config/totem/totempole.json` (or `.jsonc`).
- If they want to add a different provider later (Totem Go, Kimi, GitHub Copilot, ZAI), they can update this file manually. See **[Configuration Reference](configuration.md)** and the preset docs for examples.
- Read the generated `~/.config/totem/totempole.json` (or `.jsonc`) file to understand the current configuration.

---

## Troubleshooting

### Installer Fails

Check the expected config format:
```bash
bunx totempole@latest install --help
```

Then manually create the config files at:
- `~/.config/totem/totempole.json` (or `.jsonc`)

### Configuration Already Exists

If the installer reports that the configuration already exists, you have two options:

1. **Keep existing config**: The installer will skip the configuration step and continue with other operations (like adding the plugin or installing skills).

2. **Reset configuration**: Use `--reset` to overwrite:
   ```bash
   bunx totempole@latest install --reset
   ```
   A `.bak` backup file will be created automatically.

### Agents Not Responding

1. Check your authentication:
   ```bash
   totem auth status
   ```

2. From your project root, verify your config file exists and is valid:
   ```bash
   bunx totempole@latest doctor
   ```

3. Check that your provider is configured in `~/.config/totem/totem.json`

### Missing Background Task Tools

If background tasks never
return task IDs, or delegation behaves like a blocking foreground call:

1. Confirm Totem was launched with the environment variable:
   ```bash
   env | grep TOTEM_EXPERIMENTAL_BACKGROUND_SUBAGENTS
   ```
   It should show `TOTEM_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true`.

   Also use an Totem release that includes native background
   subagents; run `totem --version` and update Totem if background tasks are missing.

2. Restart your terminal or source the shell file the installer updated, then
   start Totem again. Plain `totem` is only sufficient after that
   environment is active.

3. For a quick manual test, launch Totem with a one-shot export:
   ```bash
   TOTEM_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true totem
   ```

4. If shell setup was missing, rerun the installer:
   ```bash
   bunx totempole@latest install
   ```

### Authentication Issues

If providers are not working:

1. Check your authentication status:
   ```bash
   totem auth status
   ```

2. Re-authenticate if needed:
   ```bash
   totem auth login
   ```

3. Verify your config file has the correct provider configuration:
   ```bash
   cat ~/.config/totem/totempole.json
   ```

### Editor Validation

Add a `$schema` reference to your config for autocomplete and inline validation:

```jsonc
{
  "$schema": "https://unpkg.com/totempole@latest/totempole.schema.json",
  // your config...
}
```

Works in VS Code, Neovim (with `jsonls`), and any editor that supports JSON Schema. Catches typos and wrong nesting immediately.

### Tmux Integration Not Working

Make sure you're running Totem with the `--port` flag and the port matches your `TOTEM_PORT` environment variable:

```bash
tmux
export TOTEM_PORT=4096
totem --port 4096
```

See the [Multiplexer Integration Guide](multiplexer-integration.md) for more details.

---

## Uninstallation

1. **Remove the plugin from your Totem config**:

   Edit `~/.config/totem/totem.json` and remove `"totempole"` from the `plugin` array.

2. **Remove configuration files (optional)**:
   ```bash
   rm -f ~/.config/totem/totempole.json
   rm -f ~/.config/totem/totempole.json.bak
   ```

3. **Remove skills (optional)**:
   ```bash
   rm -rf ~/.config/totem/skills/simplify
   rm -rf ~/.config/totem/skills/codemap
   rm -rf ~/.config/totem/skills/clonedeps
   rm -rf ~/.config/totem/skills/deepwork
   rm -rf ~/.config/totem/skills/reflect
   rm -rf ~/.config/totem/skills/worktrees
   rm -rf ~/.config/totem/skills/totempole
   ```
