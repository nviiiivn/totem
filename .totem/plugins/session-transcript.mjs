import { mkdir, readdir, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"

// Where transcripts get written on compaction. Override with TOTEM_SESSION_ARCHIVE_DIR.
// Defaults under the user's home rather than a hardcoded absolute path, so this
// plugin works for anyone who clones the repo, not just the machine it was written on.
const ARCHIVE_DIR =
  process.env.TOTEM_SESSION_ARCHIVE_DIR ?? join(homedir(), "DocVault", "SessionArchives")

export default async (input) => {
  return {
    "experimental.session.compacting": async (hookInput, hookOutput) => {
      const { sessionID } = hookInput

      // Get session title
      let title = "untitled"
      try {
        const session = await input.client.session.get({ path: { id: sessionID } })
        if (session?.data?.title) title = session.data.title
      } catch {}

      // Sanitize title for filesystem
      const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80)

      // Build folder name
      const now = new Date()
      const dateStr = now.toISOString().split("T")[0]
      const folderName = `SESSION:${dateStr}-${safeTitle}`
      const folderPath = join(ARCHIVE_DIR, folderName)

      // Create folder
      await mkdir(folderPath, { recursive: true })

      // Count existing files for sequence number
      let seq = 1
      try {
        const existing = await readdir(folderPath)
        seq = existing.filter(f => f.endsWith(".md")).length + 1
      } catch {}

      // Build filename
      const epoch = Math.floor(now.getTime() / 1000)
      const filename = `${epoch}-${String(seq).padStart(3, "0")}.md`
      const filePath = join(folderPath, filename)

      // Fetch all messages
      let messages = []
      try {
        const resp = await input.client.session.messages({ path: { id: sessionID } })
        messages = resp?.data || []
      } catch {}

      // Format as markdown
      const lines = []
      lines.push(`# Session Transcript`)
      lines.push(`- **Session ID:** ${sessionID}`)
      lines.push(`- **Title:** ${title}`)
      lines.push(`- **Exported:** ${now.toISOString()}`)
      lines.push(`- **Messages:** ${messages.length}`)
      lines.push("")
      lines.push("---")
      lines.push("")

      for (const msg of messages) {
        const info = msg.info
        const role = info.role || "unknown"
        const agent = info.agent || ""
        const model = info.modelID || ""

        lines.push(`## ${role.toUpperCase()}${agent ? ` (${agent})` : ""}${model ? ` — ${model}` : ""}`)
        lines.push("")

        for (const part of msg.parts || []) {
          if (part.type === "text") {
            lines.push(part.text || "")
          } else if (part.type === "tool-invocation") {
            lines.push(`### Tool: ${part.toolInvocation?.toolName || "unknown"}`)
            lines.push("```json")
            lines.push(JSON.stringify(part.toolInvocation?.args || {}, null, 2))
            lines.push("```")
            if (part.toolInvocation?.state === "result" && part.toolInvocation?.result != null) {
              lines.push("**Result:**")
              lines.push("```")
              const resultStr = typeof part.toolInvocation.result === "string"
                ? part.toolInvocation.result
                : JSON.stringify(part.toolInvocation.result, null, 2)
              lines.push(resultStr.slice(0, 50000))
              lines.push("```")
            }
          } else if (part.type === "reasoning") {
            lines.push("**Thinking:**")
            lines.push("```")
            lines.push(part.reasoning || "")
            lines.push("```")
          } else {
            lines.push(`**[${part.type}]**`)
            lines.push("```")
            lines.push(JSON.stringify(part, null, 2).slice(0, 20000))
            lines.push("```")
          }
        }

        lines.push("")
        lines.push("---")
        lines.push("")
      }

      // Write file
      await writeFile(filePath, lines.join("\n"), "utf-8")
    },
  }
}
