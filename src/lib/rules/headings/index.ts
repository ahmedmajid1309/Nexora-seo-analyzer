import type { RuleDefinition } from "../types";
import { h1PresentRule } from "./h1-present";
import { h1MultipleRule } from "./h1-multiple";
import { h1EmptyRule } from "./h1-empty";
import { headingHierarchyRule } from "./heading-hierarchy";
import { headingLongRule } from "./heading-long";
import { headingRepeatedRule } from "./heading-repeated";
import { headingMeaningfulRule } from "./heading-meaningful";
import { headingSummaryRule } from "./heading-summary";

export const headingRules: RuleDefinition[] = [
  h1PresentRule,
  h1MultipleRule,
  h1EmptyRule,
  headingHierarchyRule,
  headingLongRule,
  headingRepeatedRule,
  headingMeaningfulRule,
  headingSummaryRule,
];
