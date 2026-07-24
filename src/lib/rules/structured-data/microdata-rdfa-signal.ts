import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, notApplicable } from "../helpers/result";
import { hasMicrodata, hasRdfa } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "SCHEMA-006",
  upstreamSourcePath: "src/rules/structured-data/microdata-rdfa-signal.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const microdataRdfaSignalRule: RuleDefinition = {
  id: "SCHEMA-006",
  name: "Microdata or RDFa structured data presence",
  description:
    "Checks whether the page uses microdata or RDFa as alternative structured data formats.",
  category: "structured-data",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact:
    "Microdata and RDFa are alternative structured data formats that can supplement or replace JSON-LD.",
  defaultEffort: "low",
  scored: false,
  provenance,
  signalOwner: "structured-data",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const hasMD = hasMicrodata(snapshot);
    const hasRD = hasRdfa(snapshot);

    if (!hasMD && !hasRD) {
      return notApplicable(
        "SCHEMA-006",
        "No microdata or RDFa found on the page",
        "structured-data",
        "Page uses neither microdata nor RDFa.",
      );
    }

    const signals: string[] = [];
    if (hasMD) signals.push("microdata");
    if (hasRD) signals.push("RDFa");

    return passed(
      "SCHEMA-006",
      `Page uses ${signals.join(" and ")} structured data`,
      signals.join(", "),
      "structured-data",
      "present",
      {
        severity: "informational",
        impact: `Alternative structured data formats detected: ${signals.join(", ")}.`,
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
