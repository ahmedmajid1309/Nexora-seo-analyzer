import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, warning, notApplicable } from "../helpers/result";
import { hasTables } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-008",
  upstreamSourcePath: "src/rules/accessibility/table-headers.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const tableHeadersRule: RuleDefinition = {
  id: "A11Y-008",
  name: "Table header cells",
  description: "Checks that tables contain <th> elements to provide header context for data cells.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact:
    "Tables without header cells force screen reader users to navigate without column or row context.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasTables(snapshot)) {
      return notApplicable(
        "A11Y-008",
        "No tables found on page",
        "accessibility",
        "No table elements present in document",
      );
    }

    const thCount = snapshot.accessibility.tableHeaderCells.totalTh;

    if (thCount > 0) {
      return passed(
        "A11Y-008",
        "Tables have header cells",
        thCount,
        "accessibility",
        "> 0 header cells",
        {
          severity: "low",
          impact: "Table data is navigable for screen reader users.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return warning(
      "A11Y-008",
      "Tables are present but no <th> header cells were found",
      0,
      "accessibility",
      "> 0 header cells",
      {
        severity: "medium",
        impact:
          "Data tables without header cells are difficult to interpret with assistive technology.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
