#!/usr/bin/env bun

import { $ } from "bun"

await $`bun ./totem-adze/sdk/js/script/build.ts`

await $`bun dev generate > ../sdk/openapi.json`.cwd("totem")

await $`./script/format.ts`
