import { env } from "@/config/env";
import {
  fetchWithTimeout,
  type AiSummaryProviderInput,
  type AiSummaryProviderResponse,
} from "./provider";

export async function requestGroqSummary(
  input: AiSummaryProviderInput,
): Promise<AiSummaryProviderResponse> {
  if (!env.GROQ_API_KEY) throw new Error("Groq API key is not configured");
  const model = env.GROQ_MODEL;
  const baseUrl = env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";
  const response = await fetchWithTimeout(
    `${baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: input.prompt }],
        response_format: { type: "json_object" },
        max_tokens: input.maxOutputTokens,
        temperature: 0.2,
      }),
    },
    input.timeoutMs,
  );
  if (!response.ok) throw new Error(`Groq request failed with ${response.status}`);
  const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const rawText = json.choices?.[0]?.message?.content?.trim();
  if (!rawText) throw new Error("Groq returned empty response");
  return { provider: "groq", model, rawText };
}
