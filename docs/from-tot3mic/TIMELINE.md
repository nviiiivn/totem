# TIMELINE

> The story, newest first. One line per meaningful event.

- **2026-08-19 to 2026-08-21** — Track A resumed after being parked since Jul 28. All 8 enforcement carves (Phase 2) built and tested. nes-cartridge knowledge-packaging system built end-to-end (packer + local-vision PDF/image extractor via Tower's `deepseek-ocr:3b` + translator). Discovered the project's own `turbo.json` had two silently-broken task keys, meaning the two biggest test suites had never once run correctly before — fixed that, then found and fixed 20 real bugs (mostly opencode→totem rename artifacts: wrong integration IDs, wrong provider checks, wrong referer URLs, one bad relative path, a missing test context provider). See `STATE.md` for full detail.
- **2026-07-28** — Day 0. Root laid down at `/home/nvii/TOT3MIC`. Plan drafted, D1–D4 locked. Substrate (O1) open. [Journal →](JOURNAL/2026-07-28.md)
- **~2026-07-21** — Disaster. `totem` destroyed from the inside by a compaction-amnesia loop; sessions deleted; providers/ollama broken; 4 quotas burned in days. The trigger for this rebuild.
- **2026-06-22** — `sisyphus-autopsy` written (source wiki). Named the seven failure modes this project exists to make impossible.
