import { z } from "zod";
import { AI_SUMMARY_DISCLAIMER, type AiExecutiveSummary, type SummaryEvidencePack } from "./types";
import {
  containsGuaranteeLanguage,
  sanitizeSummaryText,
  sanitizeUrlForEvidence,
} from "./sanitization";

const PrioritySchema = z
  .object({
    rank: z.number().int().positive().max(10),
    title: z.string().min(1).max(160),
    reason: z.string().min(1).max(500),
    findingIds: z.array(z.string().min(1)).max(8),
    affectedUrls: z.array(z.string()).max(8),
    state: z.string().min(1).max(40),
    severity: z.string().min(1).max(40),
    effort: z.string().min(1).max(40),
    responsibleRole: z.string().min(1).max(80),
  })
  .strict();

const EvidenceReferenceSchema = z
  .object({
    findingId: z.string().min(1),
    summary: z.string().min(1).max(500),
    affectedUrls: z.array(z.string()).max(8),
  })
  .strict();

export const ProviderSummarySchema = z
  .object({
    headline: z.string().min(1).max(180),
    executiveSummary: z.string().min(1).max(1200),
    businessImpact: z.string().min(1).max(900),
    topPriorities: z.array(PrioritySchema).max(5),
    quickWins: z.array(PrioritySchema).max(5),
    strengths: z.array(z.string().min(1).max(220)).max(6),
    risks: z.array(z.string().min(1).max(260)).max(6),
    recommendedSequence: z.array(z.string().min(1).max(260)).max(8),
    evidenceReferences: z.array(EvidenceReferenceSchema).max(20),
    warnings: z.array(z.string().max(220)).max(8).default([]),
  })
  .strict();

export function parseProviderJson(raw: string): z.infer<typeof ProviderSummarySchema> {
  const parsedJson = JSON.parse(raw) as unknown;
  return ProviderSummarySchema.parse(parsedJson);
}

export function groundProviderSummary(input: {
  parsed: z.infer<typeof ProviderSummarySchema>;
  evidence: SummaryEvidencePack;
  source: "gemini" | "groq";
  model: string;
  fallbackUsed: boolean;
}): AiExecutiveSummary {
  const findingById = new Map(input.evidence.findings.map((finding) => [finding.id, finding]));
  const allowedUrls = new Set(input.evidence.findings.flatMap((finding) => finding.affectedUrls));
  allowedUrls.add(input.evidence.finalUrl);

  const validatePriority = (priority: z.infer<typeof PrioritySchema>) => {
    if (priority.findingIds.length === 0) throw new Error("Priority has no finding IDs");
    for (const id of priority.findingIds) {
      const finding = findingById.get(id);
      if (!finding) throw new Error(`Unsupported finding ID ${id}`);
      if (finding.state !== priority.state) throw new Error(`Altered state for ${id}`);
      if (finding.severity !== priority.severity) throw new Error(`Altered severity for ${id}`);
      if (finding.effort !== priority.effort) throw new Error(`Altered effort for ${id}`);
      if (finding.responsibleRole !== priority.responsibleRole) {
        throw new Error(`Altered responsible role for ${id}`);
      }
    }
    for (const url of priority.affectedUrls) {
      if (!allowedUrls.has(url)) throw new Error(`Unsupported affected URL ${url}`);
    }
  };

  for (const priority of [...input.parsed.topPriorities, ...input.parsed.quickWins])
    validatePriority(priority);
  for (const ref of input.parsed.evidenceReferences) {
    if (!findingById.has(ref.findingId))
      throw new Error(`Unsupported evidence reference ${ref.findingId}`);
    for (const url of ref.affectedUrls)
      if (!allowedUrls.has(url)) throw new Error(`Unsupported reference URL ${url}`);
  }
  const allText = JSON.stringify(input.parsed);
  if (containsGuaranteeLanguage(allText)) throw new Error("Unsupported guarantee language");
  if (input.evidence.findings.length > 0 && input.parsed.topPriorities.length === 0) {
    throw new Error("Provider returned no priorities for available findings");
  }

  return {
    status: "available",
    source: input.source,
    model: input.model,
    generatedAt: new Date().toISOString(),
    disclaimer: AI_SUMMARY_DISCLAIMER,
    headline: sanitizeSummaryText(input.parsed.headline, 180),
    executiveSummary: sanitizeSummaryText(input.parsed.executiveSummary, 1200),
    businessImpact: sanitizeSummaryText(input.parsed.businessImpact, 900),
    topPriorities: input.parsed.topPriorities.map((p) => ({
      ...p,
      title: sanitizeSummaryText(p.title, 160),
      reason: sanitizeSummaryText(p.reason, 500),
      affectedUrls: p.affectedUrls.map(sanitizeUrlForEvidence),
    })),
    quickWins: input.parsed.quickWins.map((p) => ({
      ...p,
      title: sanitizeSummaryText(p.title, 160),
      reason: sanitizeSummaryText(p.reason, 500),
      affectedUrls: p.affectedUrls.map(sanitizeUrlForEvidence),
    })),
    strengths: input.parsed.strengths.map((s) => sanitizeSummaryText(s, 220)),
    risks: input.parsed.risks.map((s) => sanitizeSummaryText(s, 260)),
    recommendedSequence: input.parsed.recommendedSequence.map((s) => sanitizeSummaryText(s, 260)),
    evidenceReferences: input.parsed.evidenceReferences.map((ref) => ({
      ...ref,
      summary: sanitizeSummaryText(ref.summary, 500),
      affectedUrls: ref.affectedUrls.map(sanitizeUrlForEvidence),
    })),
    warnings: input.parsed.warnings.map((w) => sanitizeSummaryText(w, 220)),
    providerAttempt: { primary: "gemini", fallbackUsed: input.fallbackUsed, failureReason: null },
  };
}
