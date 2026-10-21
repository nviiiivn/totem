import { tool } from "@totem-ai/plugin/tool"
import { pack } from "../../totem/cartridge/src/pack"
import { verify } from "../../totem/cartridge/src/verify"

const z = tool.schema

export default tool({
  description:
    "Pack a directory of markdown/text files into a nes-cartridge knowledge package (.nescart), or " +
    "verify an existing cartridge is spec-compliant. Cartridges chunk + embed content (via local " +
    "nomic-embed-text) into a portable, versioned format — see docs/from-nes-cartridge for the spec.",
  args: {
    action: z.enum(["pack", "verify"]).describe("pack: build a new cartridge. verify: check an existing one."),
    inputDir: z.string().optional().describe("Directory of .md/.txt files to pack. Required for action=pack."),
    outputDir: z.string().describe("For pack: where to write the cartridge. For verify: the cartridge to check."),
    id: z
      .string()
      .optional()
      .describe("Cartridge id, e.g. urn:cartridge:networking:tcpip-guide:v1. Required for action=pack."),
    title: z.string().optional().describe("Cartridge title. Required for action=pack."),
  },
  async execute(args, ctx) {
    if (args.action === "verify") {
      const issues = await verify(args.outputDir)
      if (issues.length === 0) return { output: `${args.outputDir}: OK, 0 issues` }
      return {
        output: `${args.outputDir}: ${issues.length} issue(s)\n${issues.map((i) => `  [${i.check}] ${i.message}`).join("\n")}`,
      }
    }

    if (!args.inputDir || !args.id || !args.title) {
      return { output: "action=pack requires inputDir, id, and title" }
    }
    const result = await pack({
      inputDir: args.inputDir,
      outputDir: args.outputDir,
      id: args.id,
      title: args.title,
    })
    return {
      output: `Packed ${result.chunkCount} chunks -> ${result.outputDir}`,
      metadata: { chunkCount: result.chunkCount, manifest: result.manifest },
    }
  },
})
