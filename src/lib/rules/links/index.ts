import type { RuleDefinition } from "../types";
import { emptyHref } from "./empty-href";
import { excessiveLinks } from "./excessive-links";
import { genericAnchorText } from "./generic-anchor-text";
import { internalHttpLinks } from "./internal-http-links";
import { javascriptUrl } from "./javascript-url";
import { linkAccessible } from "./link-accessible";
import { malformedHref } from "./malformed-href";
import { noopenerMissing } from "./noopener-missing";

export const linkRules: RuleDefinition[] = [
  malformedHref,
  emptyHref,
  javascriptUrl,
  noopenerMissing,
  genericAnchorText,
  internalHttpLinks,
  excessiveLinks,
  linkAccessible,
];
