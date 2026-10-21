export * from "./client.js"
export * from "./server.js"

import { createTotemClient } from "./client.js"
import { createTotemServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export * as data from "./data.js"

export async function createTotem(options?: ServerOptions) {
  const server = await createTotemServer({
    ...options,
  })

  const client = createTotemClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
