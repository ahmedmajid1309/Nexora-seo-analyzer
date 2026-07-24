import type { RuleDefinition } from "../types";
import { jsonldPresentRule } from "./jsonld-present";
import { jsonldParseSuccessRule } from "./jsonld-parse-success";
import { jsonldContextRule } from "./jsonld-context";
import { jsonldTypeRule } from "./jsonld-type";
import { jsonldTypesDiscoveredRule } from "./jsonld-types-discovered";
import { microdataRdfaSignalRule } from "./microdata-rdfa-signal";

export const structuredDataRules: RuleDefinition[] = [
  jsonldPresentRule,
  jsonldParseSuccessRule,
  jsonldContextRule,
  jsonldTypeRule,
  jsonldTypesDiscoveredRule,
  microdataRdfaSignalRule,
];
