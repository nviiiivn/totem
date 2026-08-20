// @ts-nocheck

import { Totem } from "@totem-ai/core"
import { ReadTool } from "@totem-ai/core/tools"

const totem = Totem.make({})

totem.tool.add(ReadTool)

totem.tool.add({
  name: "bash",
  schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to run.",
      },
    },
    required: ["command"],
  },
  execute(input, ctx) {},
})

totem.auth.add({
  provider: "openai",
  type: "api",
  value: process.env.OPENAI_API_KEY,
})

totem.agent.add({
  name: "build",
  permissions: [],
  model: {
    id: "gpt-5-5",
    provider: "openai",
    variant: "xhigh",
  },
})

const sessionID = await totem.session.create({
  agent: "build",
})

totem.subscribe((event) => {
  console.log(event)
})

await totem.session.prompt({
  sessionID,
  text: "hey what is up",
})

await totem.session.prompt({
  sessionID,
  text: "what is up with this",
  files: [
    {
      mime: "image/png",
      uri: "data:image/png;base64,xxxx",
    },
  ],
})

await totem.session.wait()

console.log(await totem.session.messages(sessionID))
