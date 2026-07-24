import { passed, failed, warning } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const langAttributeRule: RuleDefinition = {
  id: "META-014",
  provenance,
  name: "Document language attribute",
  description:
    "Checks that the document has a lang attribute on the <html> element for accessibility and search engine language detection",
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Missing lang attribute harms accessibility (screen readers) and search engine language detection",
  defaultEffort: "low",
  scored: true,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot) => {
    const lang = snapshot.document.lang;

    if (lang === null) {
      return failed(
        "META-014",
        "Document <html> element is missing the lang attribute",
        null,
        "metadata",
        "valid language code (e.g., 'en')",
        {
          severity: "high",
          effort: "low",
          impact: "Screen readers cannot determine the document language without a lang attribute",
          source: "html-parse",
          responsible: "developer",
          steps: [
            'Add a lang attribute to the <html> element: <html lang="en">',
            "Use the appropriate ISO 639-1 language code for your content",
          ],
          developerNotes:
            "The lang attribute is required by WCAG 2.1 Success Criterion 3.1.1 (Level A)",
        },
      );
    }

    if (lang.trim().length === 0) {
      return warning(
        "META-014",
        "Document has a lang attribute but it is empty",
        lang,
        "metadata",
        "valid language code (e.g., 'en')",
        {
          severity: "high",
          effort: "low",
          impact: "An empty lang attribute is treated as missing by screen readers",
          source: "html-parse",
          responsible: "developer",
          steps: [
            'Set the lang attribute to a valid language code: <html lang="en">',
            "Ensure the language code matches the primary language of the page content",
          ],
        },
      );
    }

    return passed(
      "META-014",
      `Document lang attribute is present: "${lang}"`,
      lang,
      "metadata",
      "valid language code",
      {
        source: "html-parse",
      },
    );
  },
};
