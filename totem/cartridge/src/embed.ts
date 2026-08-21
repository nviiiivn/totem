export interface EmbedOptions {
  model: string
  baseUrl?: string
}

export async function embedText(text: string, options: EmbedOptions): Promise<number[]> {
  const baseUrl = options.baseUrl ?? "http://localhost:11434"
  const res = await fetch(`${baseUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: options.model, prompt: text }),
  })
  if (!res.ok) {
    throw new Error(`ollama embeddings request failed: ${res.status} ${await res.text()}`)
  }
  const data = (await res.json()) as { embedding: number[] }
  return data.embedding
}

// Sequential, not parallel: ollama serves one request at a time on CPU-only
// hardware, so concurrent calls just queue up and add overhead.
export async function embedAll(texts: string[], options: EmbedOptions): Promise<number[][]> {
  const vectors: number[][] = []
  for (const text of texts) {
    vectors.push(await embedText(text, options))
  }
  return vectors
}
