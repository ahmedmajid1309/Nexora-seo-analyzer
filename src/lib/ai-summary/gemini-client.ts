import { env } from "@/config/env";
import {
  fetchWithTimeout,
  type AiSummaryProviderInput,
  type AiSummaryProviderResponse,
} from "./provider";

export async function requestGeminiSummary(
  input: AiSummaryProviderInput,
): Promise<AiSummaryProviderResponse> {
  if (!env.GEMINI_API_KEY) throw new Error("Gemini API key is not configured");
  const model = env.GEMINI_MODEL;
  const baseUrl = env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta";
  const response = await fetchWithTimeout(
    `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: input.prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: input.maxOutputTokens,
          temperature: 0.2,
        },
      }),
    },
    input.timeoutMs,
  );
  if (!response.ok) throw new Error(`Gemini request failed with ${response.status}`);
  const json = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const rawText = json.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!rawText) throw new Error("Gemini returned empty response");
  return { provider: "gemini", model, rawText };
}
