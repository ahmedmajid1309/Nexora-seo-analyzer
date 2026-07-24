import { describe, it, expect } from "vitest";
import {
  AuditModeSchema,
  CategoryIdSchema,
  FindingStateSchema,
  SeveritySchema,
  EffortSchema,
  EvidenceSchema,
  RemediationSchema,
  ResultSourceSchema,
  PartialCompletionStatusSchema,
  ReportVisibilitySchema,
} from "@/contracts";

describe("Domain contracts", () => {
  describe("AuditModeSchema", () => {
    it("accepts quick", () => {
      expect(AuditModeSchema.parse("quick")).toBe("quick");
    });

    it("accepts site", () => {
      expect(AuditModeSchema.parse("site")).toBe("site");
    });

    it("rejects invalid mode", () => {
      expect(() => AuditModeSchema.parse("invalid")).toThrow();
    });
  });

  describe("CategoryIdSchema", () => {
    it("accepts valid category", () => {
      expect(CategoryIdSchema.parse("metadata")).toBe("metadata");
    });

    it("rejects invalid category", () => {
      expect(() => CategoryIdSchema.parse("nonexistent")).toThrow();
    });
  });

  describe("FindingStateSchema", () => {
    it("accepts all five states", () => {
      const states = ["passed", "warning", "failed", "not-applicable", "unavailable"] as const;
      for (const s of states) {
        expect(FindingStateSchema.parse(s)).toBe(s);
      }
    });
  });

  describe("SeveritySchema", () => {
    it("accepts all severities", () => {
      const severities = ["critical", "high", "medium", "low", "informational"] as const;
      for (const s of severities) {
        expect(SeveritySchema.parse(s)).toBe(s);
      }
    });
  });

  describe("EffortSchema", () => {
    it("accepts low, medium, high", () => {
      expect(EffortSchema.parse("low")).toBe("low");
      expect(EffortSchema.parse("medium")).toBe("medium");
      expect(EffortSchema.parse("high")).toBe("high");
    });
  });

  describe("EvidenceSchema", () => {
    it("validates evidence object", () => {
      const evidence = {
        summary: "Test",
        observedValue: "value",
        expectedValue: "expected",
      };
      expect(EvidenceSchema.parse(evidence)).toEqual(evidence);
    });

    it("allows optional fields", () => {
      const evidence = {
        summary: "Test",
        observedValue: null,
        expectedValue: null,
        selector: "h1",
        samples: ["a", "b"],
      };
      const result = EvidenceSchema.parse(evidence);
      expect(result.selector).toBe("h1");
      expect(result.samples).toHaveLength(2);
    });
  });

  describe("RemediationSchema", () => {
    it("validates remediation object", () => {
      const remediation = {
        summary: "Fix it",
        steps: ["Step 1", "Step 2"],
        responsible: "developer" as const,
      };
      expect(RemediationSchema.parse(remediation)).toEqual(remediation);
    });
  });

  describe("ResultSourceSchema", () => {
    it("accepts all sources", () => {
      const sources = [
        "http-response",
        "html-parse",
        "rendered-dom",
        "cross-page-analysis",
        "external-api",
      ] as const;
      for (const s of sources) {
        expect(ResultSourceSchema.parse(s)).toBe(s);
      }
    });
  });

  describe("PartialCompletionStatusSchema", () => {
    it("accepts all statuses", () => {
      const statuses = ["completed", "partial", "pending", "skipped"] as const;
      for (const s of statuses) {
        expect(PartialCompletionStatusSchema.parse(s)).toBe(s);
      }
    });
  });

  describe("ReportVisibilitySchema", () => {
    it("accepts unlisted and public", () => {
      expect(ReportVisibilitySchema.parse("unlisted")).toBe("unlisted");
      expect(ReportVisibilitySchema.parse("public")).toBe("public");
    });
  });
});
