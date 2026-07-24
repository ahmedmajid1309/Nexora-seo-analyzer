import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, failed, notApplicable } from "../helpers/result";
import { hasStructuredData } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "SCHEMA-003",
  upstreamSourcePath: "src/rules/structured-data/jsonld-context.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const jsonldContextRule: RuleDefinition = {
  id: "SCHEMA-003",
  name: "JSON-LD blocks include @context",
  description: "Checks that JSON-LD structured data blocks include the @context property.",
  category: "structured-data",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Without @context, search engines cannot interpret the vocabulary used in the structured data.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "structured-data",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasStructuredData(snapshot)) {
      return notApplicable(
        "SCHEMA-003",
        "No JSON-LD structured data to check for @context",
        "structured-data",
        "No structured data blocks exist on the page.",
      );
    }

    const blocksMissingContext = snapshot.structuredData.filter((block) => block.context === null);

    if (blocksMissingContext.length === 0) {
      return passed(
        "SCHEMA-003",
        "All JSON-LD blocks include @context",
        true,
        "structured-data",
        true,
        {
          severity: "low",
          impact: "All structured data blocks have a defined @context.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "SCHEMA-003",
      `${blocksMissingContext.length} JSON-LD block(s) missing @context`,
      blocksMissingContext.length,
      "structured-data",
      0,
      {
        severity: "high",
        impact: "Missing @context prevents search engines from interpreting the schema vocabulary.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
