import { titlePresentRule } from "./title-present";
import { titleLengthRule } from "./title-length";
import { titleDuplicateRule } from "./title-duplicate";
import { descriptionPresentRule } from "./description-present";
import { descriptionLengthRule } from "./description-length";
import { descriptionDuplicateRule } from "./description-duplicate";
import { canonicalPresentRule } from "./canonical-present";
import { canonicalValidRule } from "./canonical-valid";
import { canonicalFragmentRule } from "./canonical-fragment";
import { canonicalMultipleRule } from "./canonical-multiple";
import { robotsMetaRule } from "./robots-meta";
import { viewportCharsetRule } from "./viewport-charset";
import { faviconPresentRule } from "./favicon-present";
import { langAttributeRule } from "./lang-attribute";
import type { RuleDefinition } from "../types";

export const metadataRules: RuleDefinition[] = [
  titlePresentRule,
  titleLengthRule,
  titleDuplicateRule,
  descriptionPresentRule,
  descriptionLengthRule,
  descriptionDuplicateRule,
  canonicalPresentRule,
  canonicalValidRule,
  canonicalFragmentRule,
  canonicalMultipleRule,
  robotsMetaRule,
  viewportCharsetRule,
  faviconPresentRule,
  langAttributeRule,
];
