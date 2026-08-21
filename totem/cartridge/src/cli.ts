#!/usr/bin/env bun
import { pack } from "./pack"
import { verify } from "./verify"

function arg(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}

async function main() {
  const [command, ...rest] = process.argv.slice(2)

  if (command === "pack") {
    const inputDir = rest[0]
    if (!inputDir || inputDir.startsWith("--")) {
      console.error("usage: cartridge pack <input-dir> --output <dir> --id <urn:cartridge:...> --title <title>")
      process.exit(1)
    }
    const outputDir = arg(rest, "--output")
    const id = arg(rest, "--id")
    const title = arg(rest, "--title")
    if (!outputDir || !id || !title) {
      console.error("missing required flags: --output, --id, --title")
      process.exit(1)
    }
    const chunkSize = arg(rest, "--chunk-size")
    const overlap = arg(rest, "--overlap")
    const embeddingModel = arg(rest, "--embedding-model")

    const result = await pack({
      inputDir,
      outputDir,
      id,
      title,
      description: arg(rest, "--description"),
      chunkSize: chunkSize ? Number(chunkSize) : undefined,
      overlap: overlap ? Number(overlap) : undefined,
      embeddingModel,
    })
    console.log(`packed ${result.chunkCount} chunks -> ${result.outputDir}`)
    return
  }

  if (command === "verify") {
    const cartridgeDir = rest[0]
    if (!cartridgeDir) {
      console.error("usage: cartridge verify <cartridge-dir>")
      process.exit(1)
    }
    const issues = await verify(cartridgeDir)
    if (issues.length === 0) {
      console.log(`${cartridgeDir}: OK`)
      return
    }
    console.error(`${cartridgeDir}: ${issues.length} issue(s)`)
    for (const issue of issues) console.error(`  [${issue.check}] ${issue.message}`)
    process.exit(1)
  }

  console.error("usage: cartridge <pack|verify> ...")
  process.exit(1)
}

main()
