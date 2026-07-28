import { describe, expect, it } from "vitest";
import { buildDeterministicSummary } from "../deterministic-summary";
import { groundProviderSummary } from "../schemas";
import type { SummaryEvidencePack } from "../types";

const evidence: SummaryEvidencePack = {
  schemaVersion: "1.0.0",
  auditType: "quick",
  requestId: "req-1",
  finalUrl: "https://example.com/",
  generatedAt: "2026-01-01T00:00:00.000Z",
  scores: { Technical: 70 },
  confidence: 0.9,
  appliedCaps: [],
  findings: [
    {
      id: "META-001",
      summary: "Missing title",
      severity: "high",
      state: "failed",
      effort: "low",
      responsibleRole: "seo",
      impact: "Search snippets may be unclear.",
      remediation: "Add a unique title.",
      affectedUrls: ["https://example.com/"],
    },
  ],
  quickWins: [],
  strongestArea: "Technical",
  weakestArea: "Metadata",
  performance: { status: "unavailable", source: null, score: null },
  renderedDom: { status: "disabled", findingIds: [] },
};

describe("AI summary grounding", () => {
  it("accepts provider summaries that only cite known evidence", () => {
    const summary = groundProviderSummary({
      evidence,
      source: "gemini",
      model: "test-model",
      fallbackUsed: false,
      parsed: {
        headline: "Metadata needs attention",
        executiveSummary: "The audit found a missing title.",
        businessImpact: "Search snippets may be unclear.",
        topPriorities: [
          {
            rank: 1,
            title: "Add a unique title",
            reason: "Search snippets may be unclear.",
            findingIds: ["META-001"],
            affectedUrls: ["https://example.com/"],
            state: "failed",
            severity: "high",
            effort: "low",
            responsibleRole: "seo",
          },
        ],
        quickWins: [],
        strengths: ["Technical"],
        risks: ["Missing title"],
        recommendedSequence: ["Add title"],
        evidenceReferences: [
          {
            findingId: "META-001",
            summary: "Missing title",
            affectedUrls: ["https://example.com/"],
          },
        ],
        warnings: [],
      },
    });

    expect(summary.source).toBe("gemini");
    expect(summary.topPriorities[0]?.findingIds).toEqual(["META-001"]);
  });

  it("rejects provider summaries that invent findings", () => {
    expect(() =>
      groundProviderSummary({
        evidence,
        source: "groq",
        model: "test-model",
        fallbackUsed: true,
        parsed: {
          headline: "Bad",
          executiveSummary: "Invented issue",
          businessImpact: "Impact",
          topPriorities: [
            {
              rank: 1,
              title: "Invented",
              reason: "Invented",
              findingIds: ["NEW-999"],
              affectedUrls: ["https://example.com/"],
              state: "failed",
              severity: "high",
              effort: "low",
              responsibleRole: "seo",
            },
          ],
          quickWins: [],
          strengths: [],
          risks: [],
          recommendedSequence: [],
          evidenceReferences: [],
          warnings: [],
        },
      }),
    ).toThrow(/Unsupported finding ID/);
  });

  it("rejects provider summaries that alter finding state, effort, or responsible role", () => {
    const parsed = {
      headline: "Metadata needs attention",
      executiveSummary: "The audit found a missing title.",
      businessImpact: "Search snippets may be unclear.",
      topPriorities: [
        {
          rank: 1,
          title: "Add a unique title",
          reason: "Search snippets may be unclear.",
          findingIds: ["META-001"],
          affectedUrls: ["https://example.com/"],
          state: "passed",
          severity: "high",
          effort: "low",
          responsibleRole: "seo",
        },
      ],
      quickWins: [],
      strengths: [],
      risks: [],
      recommendedSequence: [],
      evidenceReferences: [],
      warnings: [],
    };

    expect(() =>
      groundProviderSummary({
        evidence,
        source: "groq",
        model: "test-model",
        fallbackUsed: true,
        parsed,
      }),
    ).toThrow(/Altered state/);
    expect(() =>
      groundProviderSummary({
        evidence,
        source: "groq",
        model: "test-model",
        fallbackUsed: true,
        parsed: {
          ...parsed,
          topPriorities: [{ ...parsed.topPriorities[0], state: "failed", effort: "high" }],
        },
      }),
    ).toThrow(/Altered effort/);
    expect(() =>
      groundProviderSummary({
        evidence,
        source: "groq",
        model: "test-model",
        fallbackUsed: true,
        parsed: {
          ...parsed,
          topPriorities: [
            { ...parsed.topPriorities[0], state: "failed", responsibleRole: "developer" },
          ],
        },
      }),
    ).toThrow(/Altered responsible role/);
  });

  it("deterministic fallback keeps authoritative evidence references", () => {
    const summary = buildDeterministicSummary({ evidence, status: "disabled" });

    expect(summary.source).toBe("deterministic");
    expect(summary.topPriorities[0]?.findingIds).toEqual(["META-001"]);
    expect(summary.topPriorities[0]?.state).toBe("failed");
    expect(summary.disclaimer).toContain("verified audit findings");
  });
});
