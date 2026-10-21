export interface TranslateOptions {
  model?: string
  baseUrl?: string
}

const DEFAULT_TRANSLATE_MODEL = "llama3.2:3b"

// Deliberately a separate text-model call, not part of the VLM transcription
// prompt: small vision models are noticeably worse translators than dedicated
// text models of the same size class. Transcribe with the VLM, translate with this.
export async function translateText(text: string, targetLanguage: string, options: TranslateOptions = {}): Promise<string> {
  const baseUrl = options.baseUrl ?? "http://localhost:11434"
  const model = options.model ?? DEFAULT_TRANSLATE_MODEL

  const prompt = `Translate the following text to ${targetLanguage}. Preserve markdown formatting and paragraph structure. Output only the translation, no commentary.\n\n${text}`

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  })
  if (!res.ok) {
    throw new Error(`ollama translate request failed: ${res.status} ${await res.text()}`)
  }
  const data = (await res.json()) as { response: string }
  return data.response.trim()
}
