import { passed, failed } from "../helpers/result";
import type { RuleDefinition } from "../types";

export const viewportCharsetRule: RuleDefinition = {
  id: "META-012",
  name: "Viewport meta tag and character set declaration",
  description:
    'Checks that <meta name="viewport"> and character set declaration (<meta charset> or <meta http-equiv="Content-Type">) are present',
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Missing viewport or charset declarations harm mobile rendering and cause encoding issues",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  provenance: {
    upstreamRuleId: "core-viewport-present",
    upstreamSourcePath: "src/rules/core/viewport-present.ts",
    upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
    disposition: "PORT_WITH_MODIFICATIONS",
    modifications:
      "Adapted for Nexora PageSnapshot-based evaluator; expanded to also check charset declaration",
  },
  evaluator: (snapshot) => {
    const issues: string[] = [];

    const viewportDeclarations = snapshot.document.viewportDeclarations;
    const charsetDeclarations = snapshot.document.charsetDeclarations;

    if (viewportDeclarations.length === 0) {
      issues.push('Missing <meta name="viewport"> tag required for mobile-responsive rendering');
    }

    if (charsetDeclarations.length === 0) {
      issues.push("Missing character set declaration (<meta charset> or http-equiv Content-Type)");
    }

    if (issues.length > 0) {
      const observedStr = `viewport=${viewportDeclarations.length > 0 ? viewportDeclarations[0].raw : "missing"}, charset=${charsetDeclarations.length > 0 ? charsetDeclarations[0].raw : "missing"}`;
      return failed(
        "META-012",
        issues.join("; "),
        observedStr,
        "metadata",
        "viewport=present, charset=present",
        {
          severity: "high",
          effort: "low",
          impact:
            "Missing viewport harms mobile usability and SEO; missing charset causes rendering and encoding issues",
          source: "html-parse",
          responsible: "developer",
          steps: [
            ...(viewportDeclarations.length === 0
              ? [
                  'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the document head',
                ]
              : []),
            ...(charsetDeclarations.length === 0
              ? ['Add <meta charset="utf-8"> as the first element in the document head']
              : []),
          ],
          developerNotes:
            "Viewport meta is essential for mobile-friendly ranking; charset should be declared as early as possible, ideally within the first 1024 bytes",
        },
      );
    }

    const viewportRaw = viewportDeclarations[0]?.raw ?? "missing";
    const charsetRaw = charsetDeclarations[0]?.raw ?? "missing";

    return passed(
      "META-012",
      `Required metadata declarations present: viewport="${viewportRaw}", charset="${charsetRaw}"`,
      `viewport=${viewportRaw}, charset=${charsetRaw}`,
      "metadata",
      "viewport=present, charset=present",
      {
        source: "html-parse",
      },
    );
  },
};
