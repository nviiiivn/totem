import { $ } from "bun"

await $`bun ./scripts/copy-icons.ts ${process.env.TOTEM_CHANNEL ?? "dev"}`

await $`cd ../totem && bun script/build-node.ts`
