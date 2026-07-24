import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, notApplicable } from "../helpers/result";
import { hasStructuredData } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "schema-types-discovered",
  upstreamSourcePath: "src/rules/schema/types-discovered.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "USE_AS_REFERENCE",
};

export const jsonldTypesDiscoveredRule: RuleDefinition = {
  id: "SCHEMA-005",
  name: "JSON-LD schema types discovered",
  description: "Lists all unique schema.org types found in JSON-LD structured data blocks.",
  category: "structured-data",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact:
    "Understanding which schema types are used helps evaluate structured data coverage and completeness.",
  defaultEffort: "low",
  scored: false,
  provenance,
  signalOwner: "structured-data",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasStructuredData(snapshot)) {
      return notApplicable(
        "SCHEMA-005",
        "No JSON-LD structured data to inspect",
        "structured-data",
        "No structured data blocks exist on the page.",
      );
    }

    const allTypes = snapshot.structuredData.flatMap((block) => block.parsedTypes);
    const uniqueTypes = [...new Set(allTypes)].sort();

    if (uniqueTypes.length === 0) {
      return passed(
        "SCHEMA-005",
        "No schema types discovered in JSON-LD blocks",
        "none",
        "structured-data",
        "at least one type",
        {
          severity: "informational",
          impact: "JSON-LD blocks exist but no @type values were found.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return passed(
      "SCHEMA-005",
      `Discovered schema types: ${uniqueTypes.join(", ")}`,
      uniqueTypes.length,
      "structured-data",
      uniqueTypes.join(", "),
      {
        severity: "informational",
        impact: `Page uses ${uniqueTypes.length} schema type(s): ${uniqueTypes.join(", ")}.`,
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
