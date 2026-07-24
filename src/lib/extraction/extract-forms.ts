import type { CheerioAPI } from "cheerio";
import type { FormInfo, FormDetail, FormInputInfo } from "./types";
import { MAX_FORMS, MAX_FORM_INPUTS } from "./constants";

const SENSITIVE_TYPES = new Set(["password", "hidden", "token", "secret", "api_key", "apikey"]);

export function extractForms($: CheerioAPI): FormInfo {
  const forms: FormDetail[] = [];

  $("form").each((_i, el) => {
    if (forms.length >= MAX_FORMS) return false;
    const $form = $(el);
    const inputs: FormInputInfo[] = [];
    let submitCount = 0;

    $form.find("input, textarea, select, button").each((_j, inputEl) => {
      if (inputs.length >= MAX_FORM_INPUTS) return false;
      const $input = $(inputEl);
      const tag = (inputEl.tagName ?? "").toLowerCase();
      const type =
        $input.attr("type") ??
        (tag === "textarea" ? "textarea" : tag === "select" ? "select" : null);
      const isSubmit = type === "submit" || tag === "button";
      const isPassword = type === "password";
      const isHidden = type === "hidden";
      const isFile = type === "file";
      const id = $input.attr("id") ?? null;

      let associatedLabel: string | null = null;
      let labelRelationship: FormInputInfo["labelRelationship"] = "none";

      if (id) {
        const label = $(`label[for='${id}']`);
        if (label.length > 0) {
          associatedLabel = label.first().text().trim() || null;
          labelRelationship = "explicit";
        }
      }
      if (!associatedLabel) {
        const parentLabel = $input.closest("label");
        if (parentLabel.length > 0) {
          associatedLabel = parentLabel.text().trim() || null;
          labelRelationship = "implicit";
        }
      }
      if (!associatedLabel && $input.attr("aria-label")) {
        associatedLabel = $input.attr("aria-label") ?? null;
        labelRelationship = "aria-label";
      }
      if (!associatedLabel && $input.attr("aria-labelledby")) {
        const refId = $input.attr("aria-labelledby") ?? null;
        const labelEl = refId ? $(`#${refId}`) : null;
        associatedLabel =
          labelEl && labelEl.length > 0 ? labelEl.first().text().trim() || null : null;
        labelRelationship = "aria-labelledby";
      }

      inputs.push({
        type,
        name: $input.attr("name") ?? null,
        id,
        hasPlaceholder: $input.attr("placeholder") != null,
        required: $input.attr("required") !== undefined,
        disabled: $input.attr("disabled") !== undefined,
        associatedLabel,
        labelRelationship,
        isSubmit,
        isPassword,
        isFile,
        isHidden,
        redactedValue: isPassword || isHidden || isSensitiveName($input.attr("name") ?? null),
        elementOrder: inputs.length,
      });

      if (isSubmit) submitCount++;
    });

    forms.push({
      action: $form.attr("action") ?? null,
      method: ($form.attr("method") ?? "get").toLowerCase(),
      autocomplete: $form.attr("autocomplete") ?? null,
      novalidate: $form.attr("novalidate") !== undefined,
      inputs,
      submitCount,
      elementOrder: forms.length,
    });
  });

  return { formCount: forms.length, forms };
}

function isSensitiveName(name: string | null): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  for (const s of SENSITIVE_TYPES) {
    if (lower.includes(s)) return true;
  }
  return false;
}
