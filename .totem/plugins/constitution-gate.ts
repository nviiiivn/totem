// Live wiring for carve 9 (the constitution gate).
//
// `experimental.text.complete` fires when the model finishes a text block, and
// whatever this hook puts back in `output.text` is what actually gets delivered.
// That makes it the real interception point: a refused response never reaches
// the user, it's replaced with the violation and the demand to rewrite.
//
// The gate logic itself lives in totem/src/enforcement/response-gate.ts so it is
// unit-testable without booting a session (see totem/test/response-gate.test.ts).
import { evaluate } from "../../totem/src/enforcement/response-gate"

export default async () => {
  return {
    "experimental.text.complete": async (
      input: { sessionID: string; messageID: string; partID: string },
      output: { text: string },
    ) => {
      const verdict = evaluate(input.sessionID, { text: output.text })
      if (verdict.replacement !== undefined) {
        output.text = verdict.replacement
      }
    },
  }
}
