const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /reveal\s+(your\s+)?system\s+prompt/gi,
  /change\s+the\s+seo\s+score/gi,
  /mark\s+this\s+page\s+as\s+passed/gi,
  /send\s+the\s+api\s+key/gi,
  /visit\s+this\s+private\s+url/gi,
];

export function sanitizeSummaryText(input: unknown, maxLength = 500): string {
  const value = String(input ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "[script removed]")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  let sanitized = value;
  for (const pattern of INJECTION_PATTERNS)
    sanitized = sanitized.replace(pattern, "[untrusted instruction removed]");
  return sanitized.slice(0, maxLength);
}

export function sanitizeUrlForEvidence(input: string): string {
  try {
    const url = new URL(input);
    url.username = "";
    url.password = "";
    url.hash = "";
    return url.toString().slice(0, 300);
  } catch {
    return sanitizeSummaryText(input, 300);
  }
}

export function containsGuaranteeLanguage(input: string): boolean {
  return /guarantee|guaranteed rankings|certainly rank|will rank #?1|promise/i.test(input);
}
