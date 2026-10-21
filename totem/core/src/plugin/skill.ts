/// <reference path="../markdown.d.ts" />

export * as SkillPlugin from "./skill"

import { define } from "./internal"
import { Effect } from "effect"
import { AbsolutePath } from "../schema"
import { SkillV2 } from "../skill"
import customizeTotemContent from "./skill/customize-totem.md" with { type: "text" }

export const CustomizeTotemContent = customizeTotemContent

export const Plugin = define({
  id: "skill",
  effect: Effect.fn(function* (ctx) {
    yield* ctx.skill.transform((draft) => {
      draft.source(
        SkillV2.EmbeddedSource.make({
          type: "embedded",
          skill: SkillV2.Info.make({
            name: "customize-totem",
            description:
              "Use ONLY when the user is editing or creating Totem's own configuration: totem.json, totem.jsonc, files under .totem/, or files under ~/.config/totem/. Also use when creating or fixing Totem agents, subagents, commands, skills, plugins, MCP servers, or permission rules. Do not use for the user's own application code, or for any project that is not configuring Totem itself.",
            location: AbsolutePath.make("/builtin/customize-totem.md"),
            content: CustomizeTotemContent,
          }),
        }),
      )
    })
  }),
})
