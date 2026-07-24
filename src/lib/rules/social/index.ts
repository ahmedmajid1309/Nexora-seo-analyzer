import type { RuleDefinition } from "../types";
import { ogTitleRule } from "./og-title";
import { ogDescriptionRule } from "./og-description";
import { ogImageRule } from "./og-image";
import { ogUrlRule } from "./og-url";
import { twitterCardRule } from "./twitter-card";
import { socialTitleConsistencyRule } from "./social-title-consistency";

export const socialRules: RuleDefinition[] = [
  ogTitleRule,
  ogDescriptionRule,
  ogImageRule,
  ogUrlRule,
  twitterCardRule,
  socialTitleConsistencyRule,
];
