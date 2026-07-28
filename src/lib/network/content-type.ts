const ACCEPTABLE_TYPES = new Set(["text/html", "application/xhtml+xml"]);

const BINARY_SIGNATURES: [number[], string][] = [
  [[0x42, 0x4d], "image/bmp"],
  [[0x89, 0x50, 0x4e, 0x47], "image/png"],
  [[0xff, 0xd8, 0xff], "image/jpeg"],
  [[0x47, 0x49, 0x46], "image/gif"],
  [[0x25, 0x50, 0x44, 0x46], "application/pdf"],
  [[0x50, 0x4b], "application/zip"],
  [[0x1f, 0x8b], "application/gzip"],
];

function matchesSignature(buffer: Buffer, signature: number[]): boolean {
  for (let i = 0; i < signature.length; i++) {
    if (i >= buffer.length) return false;
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
}

export function classifyContentType(contentType: string | null): {
  isAllowed: boolean;
  detectedType: string;
} {
  if (!contentType) {
    return { isAllowed: false, detectedType: "unknown" };
  }

  const lower = contentType.toLowerCase().split(";")[0].trim();

  if (ACCEPTABLE_TYPES.has(lower)) {
    return { isAllowed: true, detectedType: lower };
  }

  for (const mediaType of [
    "image/",
    "audio/",
    "video/",
    "application/pdf",
    "application/zip",
    "application/gzip",
    "application/x-rar",
  ]) {
    if (lower.startsWith(mediaType)) {
      return { isAllowed: false, detectedType: lower };
    }
  }

  if (
    lower.startsWith("text/") ||
    lower.startsWith("application/xhtml") ||
    lower.startsWith("application/xml")
  ) {
    return { isAllowed: false, detectedType: lower };
  }

  return { isAllowed: false, detectedType: lower };
}

export function isAllowedContentType(contentType: string | null, allowedTypes: string[]): boolean {
  if (!contentType) return false;
  const lower = contentType.toLowerCase().split(";")[0]?.trim() ?? "";
  return allowedTypes.includes(lower);
}

export function sniffIsHtml(buffer: Buffer): boolean {
  const text = buffer.toString("utf-8").slice(0, 4096).toLowerCase().trimStart();

  if (
    text.startsWith("<html") ||
    text.startsWith("<!doctype html") ||
    text.startsWith("<!doctype")
  ) {
    return true;
  }

  if (
    text.startsWith("<") &&
    (text.includes("<head") ||
      text.includes("<body") ||
      text.includes("<title") ||
      text.includes("<div"))
  ) {
    return true;
  }

  const isBinary = BINARY_SIGNATURES.some(([sig]) => matchesSignature(buffer, sig));
  if (isBinary) {
    return false;
  }

  return false;
}
