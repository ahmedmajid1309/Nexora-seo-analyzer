import type { RuleDefinition } from "../types";
import { formLabelsExplicitRule } from "./form-labels-explicit";
import { passwordGetRule } from "./password-get";
import { insecureFormActionRule } from "./insecure-form-action";
import { autocompleteOffRule } from "./autocomplete-off";
import { duplicateFormIdsRule } from "./duplicate-form-ids";

export const formRules: RuleDefinition[] = [
  formLabelsExplicitRule,
  passwordGetRule,
  insecureFormActionRule,
  autocompleteOffRule,
  duplicateFormIdsRule,
];
