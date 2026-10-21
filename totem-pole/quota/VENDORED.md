# Vendored: opencode-quota

Source: **[slkiser/opencode-quota](https://github.com/slkiser/opencode-quota)** (MIT, 901★)
Vendored: 2026-08-21 · Upstream: `src/` copied verbatim, unmodified.

Shows provider quota and token usage (OpenCode Go, Cursor, Copilot, OpenAI, Kimi,
Alibaba, Chutes, Antigravity, Z.ai) without polluting the context window.

## Why vendored instead of installed from npm

Deliberate: totem should not depend on a third-party package staying published,
unrenamed, and unmodified. Vendoring means this keeps working if upstream is
deleted, renamed, or changes hands — the same reasoning applied to
`totem-pole/totempole/`.

The tradeoff is real and worth stating: **upstream fixes and new provider support
do not arrive automatically.** Re-vendoring is a manual step. See upstream's
releases when a provider's quota API changes.

## License

MIT, upstream's `LICENSE` preserved verbatim in this directory. All credit to
slkiser and contributors. This project claims no authorship of the code in `src/`.
