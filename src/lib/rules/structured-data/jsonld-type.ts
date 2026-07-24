import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, failed, notApplicable } from "../helpers/result";
import { hasStructuredData } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "SCHEMA-004",
  upstreamSourcePath: "src/rules/structured-data/jsonld-type.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const jsonldTypeRule: RuleDefinition = {
  id: "SCHEMA-004",
  name: "JSON-LD blocks include @type",
  description: "Checks that JSON-LD structured data blocks include a @type property.",
  category: "structured-data",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Without @type, search engines cannot determine the kind of entity being described.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "structured-data",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasStructuredData(snapshot)) {
      return notApplicable(
        "SCHEMA-004",
        "No JSON-LD structured data to check for @type",
        "structured-data",
        "No structured data blocks exist on the page.",
      );
    }

    const blocksMissingType = snapshot.structuredData.filter(
      (block) => block.parsedTypes.length === 0,
    );

    if (blocksMissingType.length === 0) {
      return passed(
        "SCHEMA-004",
        "All JSON-LD blocks include @type",
        true,
        "structured-data",
        true,
        {
          severity: "low",
          impact: "All structured data blocks have a defined @type.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "SCHEMA-004",
      `${blocksMissingType.length} JSON-LD block(s) missing @type`,
      blocksMissingType.length,
      "structured-data",
      0,
      {
        severity: "high",
        impact: "Missing @type prevents search engines from determining the entity type.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
