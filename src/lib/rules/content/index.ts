import type { RuleDefinition } from "../types";
import { mainElementRule } from "./main-element";
import { textPresentRule } from "./text-present";
import { textAmountRule } from "./text-amount";
import { paragraphsRule } from "./paragraphs";
import { listsRule } from "./lists";
import { semanticLandmarksRule } from "./semantic-landmarks";
import { questionHeadingsRule } from "./question-headings";

export const contentRules: RuleDefinition[] = [
  mainElementRule,
  textPresentRule,
  textAmountRule,
  paragraphsRule,
  listsRule,
  semanticLandmarksRule,
  questionHeadingsRule,
];
