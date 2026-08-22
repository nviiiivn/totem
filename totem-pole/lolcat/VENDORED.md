# Vendored: lolcat-theme

Source: **[nviiiivn/lolcat-theme](https://github.com/nviiiivn/lolcat-theme)** — nvii's own plugin.
Also published standalone so opencode users can install it independently.

Animated rainbow home logo for the TUI. Replaces the logo via the `home_logo`
replace-slot; toggle with the `lolcat.toggle` palette command or `ctrl+l`,
persisted in plugin kv key `lolcat_on` (default on).

## Why vendored

Ships built into totem rather than requiring a separate install, so a fresh
clone has it without downloading anything. The standalone repo stays the
canonical source for opencode users and for upstream development.

Zero runtime dependencies of its own — only `@opentui` and `solid-js`, which
totem already uses for the TUI.

## Keeping the two in sync

This is a copy. Changes made here do not flow back to the standalone repo, and
vice versa — that is a real maintenance cost, not a solved problem. Treat
`nviiiivn/lolcat-theme` as canonical and re-vendor when it changes.
