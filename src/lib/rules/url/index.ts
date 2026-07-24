import type { RuleDefinition } from "../types";
import { httpsCheckRule } from "./https-check";
import { urlLengthRule } from "./url-length";
import { uppercasePathRule } from "./uppercase-path";
import { underscorePathRule } from "./underscore-path";
import { repeatedSeparatorsRule } from "./repeated-separators";
import { trackingParamsRule } from "./tracking-params";
import { sessionParamsRule } from "./session-params";
import { fragmentCanonicalRule } from "./fragment-canonical";
import { nonHttpCanonicalRule } from "./non-http-canonical";
import { defaultPortRule } from "./default-port";

export const urlRules: RuleDefinition[] = [
  httpsCheckRule,
  urlLengthRule,
  uppercasePathRule,
  underscorePathRule,
  repeatedSeparatorsRule,
  trackingParamsRule,
  sessionParamsRule,
  fragmentCanonicalRule,
  nonHttpCanonicalRule,
  defaultPortRule,
];
