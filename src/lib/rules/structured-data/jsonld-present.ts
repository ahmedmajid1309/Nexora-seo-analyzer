import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, failed } from "../helpers/result";
import { hasStructuredData } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "SCHEMA-001",
  upstreamSourcePath: "src/rules/structured-data/jsonld-present.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const jsonldPresentRule: RuleDefinition = {
  id: "SCHEMA-001",
  name: "JSON-LD structured data is present",
  description: "Checks that the page contains at least one JSON-LD structured data block.",
  category: "structured-data",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Structured data helps search engines understand page content and enables rich results in search listings.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "structured-data",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (hasStructuredData(snapshot)) {
      return passed(
        "SCHEMA-001",
        "JSON-LD structured data is present",
        true,
        "structured-data",
        true,
        {
          severity: "low",
          impact: "Page contains JSON-LD structured data which aids search engine understanding.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "SCHEMA-001",
      "No JSON-LD structured data found",
      false,
      "structured-data",
      true,
      {
        severity: "high",
        impact: "Pages without structured data miss opportunities for rich results in search.",
        effort: "medium",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
