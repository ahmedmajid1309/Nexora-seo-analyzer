import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "SCHEMA-002",
  upstreamSourcePath: "src/rules/structured-data/jsonld-parse-success.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const jsonldParseSuccessRule: RuleDefinition = {
  id: "SCHEMA-002",
  name: "JSON-LD blocks parse successfully",
  description: "Checks that all JSON-LD structured data blocks parse without syntax errors.",
  category: "structured-data",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Malformed JSON-LD is ignored by search engines and can cause structured data validation errors.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "structured-data",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const invalidBlocks = snapshot.extractionWarnings.filter((w) => w.code === "INVALID_JSON_LD");

    if (invalidBlocks.length === 0) {
      return passed(
        "SCHEMA-002",
        "All JSON-LD blocks parsed successfully",
        true,
        "structured-data",
        true,
        {
          severity: "low",
          impact: "No JSON-LD parse errors detected.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "SCHEMA-002",
      `${invalidBlocks.length} JSON-LD block(s) failed to parse`,
      invalidBlocks.length,
      "structured-data",
      0,
      {
        severity: "high",
        impact: "Invalid JSON-LD is ignored by search engines, preventing rich result eligibility.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
        samples: invalidBlocks.map((w) => w.message),
      },
    );
  },
};
