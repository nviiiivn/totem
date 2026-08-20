# Totem Go Preset

`totem-go` is a bundled generated preset for users who want to run the
Pantheon agents through Totem Go models instead of the default OpenAI setup.

The installer generates both `openai` and `totem-go` presets. OpenAI stays
active by default unless you select Totem Go during install or switch to it
later.

Because the `totem-go` preset uses GLM-5.1 for Orchestrator and GLM is not
multimodal, installing with `--preset=totem-go` also enables the Observer
agent and configures it with `totem-go/kimi-k2.6` for visual analysis.

## Install with Totem Go Active

```bash
bunx totempole@latest install --preset=totem-go
```

Then authenticate and refresh models:

```bash
totem auth login
totem models --refresh
```

## Switch at Runtime

If both presets are already in your config, switch from inside Totem:

```text
/preset totem-go
```

See [Preset Switching](preset-switching.md) for the full runtime switching
workflow. If you originally installed with the default OpenAI preset, also add
`"disabled_agents": []` to your config and restart Totem so Observer is
available before switching to `totem-go`.

`disabled_agents` is global, not per-preset. If you later switch back to OpenAI
and restart while keeping `"disabled_agents": []`, Observer will remain enabled
and use the default Observer model unless you configure one explicitly.

## Bundled Model Mapping

The generated `totem-go` preset maps each specialist to a model tuned for its
role:

| Agent | Model |
|-------|-------|
| Orchestrator | `totem-go/glm-5.2` |
| Oracle | `totem-go/qwen3.7-max` (`max`) |
| Librarian | `totem-go/deepseek-v4-flash` |
| Explorer | `totem-go/deepseek-v4-flash` |
| Designer | `totem-go/kimi-k2.7-code` (`medium`) |
| Fixer | `totem-go/deepseek-v4-flash` (`high`) |
| Observer | `totem-go/kimi-k2.6` |

## Generated Config Shape

Your generated config includes `totem-go` under `presets` and activates it by
setting the top-level `preset` field:

```jsonc
{
  "preset": "totem-go",
  "disabled_agents": [],
  "presets": {
    "totem-go": {
      "orchestrator": { "model": "totem-go/glm-5.2" },
      "oracle": {
        "model": "totem-go/qwen3.7-max",
        "variant": "max"
      },
      "librarian": { "model": "totem-go/deepseek-v4-flash" },
      "explorer": { "model": "totem-go/deepseek-v4-flash" },
      "designer": {
        "model": "totem-go/kimi-k2.7-code",
        "variant": "medium"
      },
      "fixer": {
        "model": "totem-go/deepseek-v4-flash",
        "variant": "high"
      },
      "observer": { "model": "totem-go/kimi-k2.6" }
    }
  }
}
```

For the complete configuration reference, see
[Configuration](configuration.md).
