import type { RuleDefinition } from "../types";
import { documentLanguageRule } from "./document-language";
import { imageAltPresentRule } from "./image-alt-present";
import { formLabelsRule } from "./form-labels";
import { buttonNamesRule } from "./button-names";
import { linkNamesRule } from "./link-names";
import { duplicateIdsRule } from "./duplicate-ids";
import { iframeTitlesRule } from "./iframe-titles";
import { tableHeadersRule } from "./table-headers";
import { tabindexValuesRule } from "./tabindex-values";
import { zoomRestrictionRule } from "./zoom-restriction";
import { mediaCaptionsRule } from "./media-captions";
import { skipLinksRule } from "./skip-links";
import { landmarkElementsRule } from "./landmark-elements";

export const accessibilityRules: RuleDefinition[] = [
  documentLanguageRule,
  imageAltPresentRule,
  formLabelsRule,
  buttonNamesRule,
  linkNamesRule,
  duplicateIdsRule,
  iframeTitlesRule,
  tableHeadersRule,
  tabindexValuesRule,
  zoomRestrictionRule,
  mediaCaptionsRule,
  skipLinksRule,
  landmarkElementsRule,
];
