import type { RuleDefinition, RuleCategory } from "./types";
import { metadataRules } from "./metadata/index";
import { headingRules } from "./headings/index";
import { urlRules } from "./url/index";
import { linkRules } from "./links/index";
import { imageRules } from "./images/index";
import { structuredDataRules } from "./structured-data/index";
import { socialRules } from "./social/index";
import { contentRules } from "./content/index";
import { accessibilityRules } from "./accessibility/index";
import { formRules } from "./forms/index";

export const ruleRegistry = {
  metadata: metadataRules,
  headings: headingRules,
  url: urlRules,
  links: linkRules,
  images: imageRules,
  "structured-data": structuredDataRules,
  social: socialRules,
  content: contentRules,
  accessibility: accessibilityRules,
  forms: formRules,
} as const satisfies Record<string, readonly RuleDefinition[]>;

export type RuleCategoryKey = keyof typeof ruleRegistry;

export type AuditCheckId = (typeof ruleRegistry)[keyof typeof ruleRegistry][number]["id"];

export function getAllRules(): RuleDefinition[] {
  const all: RuleDefinition[] = [];
  for (const category of Object.values(ruleRegistry)) {
    for (const rule of category) {
      all.push(rule);
    }
  }
  return all;
}

export function getRuleById(id: string): RuleDefinition | undefined {
  return getAllRules().find((r) => r.id === id);
}

export function getRulesByCategory(category: RuleCategory): RuleDefinition[] {
  const key = category as RuleCategoryKey;
  return (ruleRegistry[key] as readonly RuleDefinition[] | undefined)?.slice() ?? [];
}

export function validateRegistry(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const signalOwners = new Map<string, string[]>();
  const allRules = getAllRules();

  for (const rule of allRules) {
    if (ids.has(rule.id)) {
      errors.push(`Duplicate rule ID: ${rule.id}`);
    }
    ids.add(rule.id);

    if (rule.scored) {
      const existing = signalOwners.get(rule.signalOwner) ?? [];
      existing.push(rule.id);
      signalOwners.set(rule.signalOwner, existing);
    }
  }

  for (const [owner, ruleIds] of signalOwners) {
    if (ruleIds.length > 1) {
      errors.push(
        `Signal owner "${owner}" is used by multiple scored rules: ${ruleIds.join(", ")}`,
      );
    }
  }

  return errors;
}

export function getRuleCount(): number {
  return getAllRules().length;
}
