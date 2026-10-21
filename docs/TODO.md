# TODO

> Concrete, checkable next actions. Checked items move to the journal.

## Now

- [ ] Fork/greenlight conversation — decide substrate (O1) with the human.
- [ ] Verify websearch fix works on next totem run (config applied; check auth).
- [ ] First public snapshot + write the "why this exists" doc.

## After substrate is chosen (Phase 1)

- [ ] Fork the chosen substrate into a working tree.
- [ ] Inventory inherited plugins → `SALVAGE/` (keep / adapt / drop each).
- [ ] Remove umbreality tangle, OMO plugins, prompt-constitution.
- [ ] Mark the self-eating seams (agent-writable rule/prompt/hook paths).
- [ ] Fix gemma4-26b max_tokens/timeout cutoff.
- [ ] Audit inherited bones (engine core, TUI, provider plumbing, session store).

## Phase 2 (the adze)

- [ ] Implement carve #8 first (durable task-state store) — the compaction-amnesia killer and the foundation the others build on.
- [ ] Implement carves #1–#7 against the spec in `ROADMAP.md`.
- [ ] Write-scope guard (#4) before anything else can rewrite config.
