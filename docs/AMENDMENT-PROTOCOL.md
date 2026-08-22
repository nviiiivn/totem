# Amendment Protocol (O2)

**Status:** structural gaps closed 2026-08-21. The human-process half is a proposal awaiting nvii's decision.

O2 as written in `ROADMAP.md` asks: *"Who changes the constitution, and via what path the agent cannot author?"*

Audited on 2026-08-21, that question turns out to be **mostly already answered by the architecture** — and the parts that weren't are now closed. What remains is a policy choice, not a technical one.

> Not to be confused with `docs/totemic/amendment-protocol.md` in the totem-wiki repo. That one governs **UmbrealityAI's** 7-layer system (Gods / Illuminati / Core Directives) — a different system with a different constitution. Its *mechanisms* (git-tagged versions, tiered approval, an unamendable core) are good and are borrowed below; its content does not apply here.

## What was already true (verified, not assumed)

**1. The running agent cannot change the constitution it is running under.** `constitution.txt` is imported as text in `totem/src/session/system.ts:15` and **compiled into the binary at build time**. Verified: `grep -ac "Standing orders" totem/dist/@totem-ai/totem-linux-arm64/bin/totem` → 1 match inside the compiled binary. Even a successful file edit changes nothing until someone rebuilds and reinstalls.

**2. The agent cannot edit the enforced source file.** `write-guard.ts` (carve 4) blocks `/session/prompt/*.txt`. Verified by calling `assertWritable()` on the real path — throws `ProtectedPathError`.

So "a path the agent cannot author" was **already structurally guaranteed, twice over**, before this audit.

## What was actually broken (found and fixed 2026-08-21)

**The repo-root `CONSTITUTION.md` was writable by the agent.** `write-guard` protected `constitution.txt` but not the human-facing copy of the same document.

Why that mattered more than it looks: the agent could have rewritten *the document the human reads and reasons about* while the enforced rules silently stayed exactly the same. The human's model of the rules and the machine's enforcement of them would diverge, with nothing observable to reveal it. That is a quieter, worse failure than editing the enforced copy — which would at least eventually show up in behavior.

**Fixed:** `CONSTITUTION.md` added to `PROTECTED_PATTERNS` in `totem/src/enforcement/write-guard.ts`. Both copies are now equally read-only to the agent.

**Also added:** `totem/test/constitution-sync.test.ts` — fails loudly if the two copies drift, and asserts both stay agent-unwritable while ordinary markdown stays writable (so the guard can't quietly over-broaden). The two copies were verified in sync at the time of writing; the root file additionally carries an `=============ARCHIVED===============` section of prior versions below the live text, which the test deliberately ignores.

## The remaining gap: there is no defined human process

Nothing above says *how a human should amend the constitution*. Today the de facto process is "edit two files and remember to rebuild," with no versioning and no rollback. Proposal:

### Proposed process

1. **Propose.** Write the change with: exact text, the problem it solves, what breaks, and the rollback. (Borrowed from the Umbreality protocol — the shape is sound.)
2. **Edit both copies together, in one commit.** `constitution.txt` (enforced) and `CONSTITUTION.md` (human-facing). `constitution-sync.test.ts` fails the build if only one is touched — this is the enforcement, not a convention to remember.
3. **Archive the prior text.** Move the superseded rules below the `=============ARCHIVED===============` marker in `CONSTITUTION.md`. The file already works this way; this just makes it the rule.
4. **Tag the commit** `constitution-vN`. Gives real version history and a rollback target.
5. **Rebuild and reinstall.** Until this happens the change is *not in force* — the old text is still compiled into the running binary. This step is easy to forget and produces exactly the human/machine divergence described above.
6. **Verify in a live session** that the new rule actually behaves as intended, rather than assuming the text alone did the job.

### What should never be amendable

Proposed, mirroring the Umbreality protocol's "absolutes":
- **The enforcement layer itself is not negotiable by the model.** Carves may be improved by the human; they may never be disabled at the model's request or through conversational pressure.
- **The write-guard's protected list may only grow, never shrink**, without an explicit, deliberate human decision recorded in `DECISIONS.md`.
- **The human is always priority 0** (carve 2). No amendment may invert this.

### Open question for nvii

The process above deliberately has **no approval gate** — you are the sole authority, so a review board would be theater. If you ever want a real gate (e.g. a second machine, a second person, or a cooling-off period before a constitution commit can be tagged), that is a genuine decision and it belongs in `DECISIONS.md`, not here.

This document stays a proposal until you say otherwise.

---

## Carve 9 — what the gate actually enforces (2026-08-21)

Honest scope, because a gate that *looks* complete while half of it is dead is worse than a small one that works.

**Enforced live, verified by forcing real violations through a real session:**

| Check | Rule | Action |
|---|---|---|
| Sycophancy ("you're right", "my apologies", "great question") | 6 / 18 | **Refused** |
| Phrases Rule 5 names verbatim ("keep in mind", "I'd suggest", "you might want to", "just to note") | 5 | **Refused** |
| Deferring work to the user ("add this to your file") | 3 | **Refused** |
| Elided code (`// ...rest of the implementation`) | 3 | **Refused** |

A refused response **never reaches the user** — `experimental.text.complete`'s return value *is* the delivered text, so the violation replaces it and the model must rewrite.

**Anti-wall-banging:** three strikes on the same check, then the gate escalates and *ships* rather than looping. Burning credits against a wall it cannot climb is treated as its own failure, not as diligence.

**Written and unit-tested, but NOT active yet** — these need to know what was asked, which this hook cannot currently supply: Rule 4's discursive length ceiling, and Rule 2's research/citation/hedging checks. They are implemented in `response-gate.ts` and covered by `test/response-gate.test.ts`; only the wiring is missing.

**Two approaches were tried and both failed. Recorded so nobody burns the time again:**
1. `experimental.chat.messages.transform` — context never arrived; the dependent checks silently never fired.
2. `client.session.messages()` from inside `text.complete` — **re-entrant**. The hook fires while the session is still streaming, so asking that session for its own messages hangs the response. (The session-transcript plugin can do this only because it runs at `session.compacting`, a different lifecycle point.)

A third approach would be to pass the query down through `processor.ts` at the point the hook is triggered — an engine change rather than a plugin change. Not attempted yet.
