import { describe, it, expect } from "vitest";
import { createMockSnapshot } from "../../__tests__/test-utils";
import { formLabelsExplicitRule } from "../form-labels-explicit";
import { passwordGetRule } from "../password-get";
import { insecureFormActionRule } from "../insecure-form-action";
import { autocompleteOffRule } from "../autocomplete-off";
import { duplicateFormIdsRule } from "../duplicate-form-ids";

describe("formLabelsExplicitRule (FORM-001)", () => {
  it("returns not-applicable when no forms exist", () => {
    const result = formLabelsExplicitRule.evaluator(createMockSnapshot());
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("FORM-001");
  });

  it("returns passed when all inputs have explicit labels", () => {
    const result = formLabelsExplicitRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: null,
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "text",
                  name: "email",
                  id: "email",
                  hasPlaceholder: false,
                  required: true,
                  disabled: false,
                  associatedLabel: "Email",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("FORM-001");
  });

  it("returns failed when inputs lack label associations", () => {
    const result = formLabelsExplicitRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: null,
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "text",
                  name: "name",
                  id: "name",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: null,
                  labelRelationship: "none",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("FORM-001");
  });

  it("skips hidden inputs when counting unlabeled", () => {
    const result = formLabelsExplicitRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: null,
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "hidden",
                  name: "csrf",
                  id: "csrf",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: null,
                  labelRelationship: "none",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: true,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("FORM-001");
  });
});

describe("passwordGetRule (FORM-002)", () => {
  it("returns not-applicable when no forms exist", () => {
    const result = passwordGetRule.evaluator(createMockSnapshot());
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("FORM-002");
  });

  it("returns passed when password field uses POST", () => {
    const result = passwordGetRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: "/login",
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "password",
                  name: "pass",
                  id: "pass",
                  hasPlaceholder: false,
                  required: true,
                  disabled: false,
                  associatedLabel: "Password",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: true,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("FORM-002");
  });

  it("returns failed when password field uses GET", () => {
    const result = passwordGetRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: "/login",
              method: "get",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "password",
                  name: "pass",
                  id: "pass",
                  hasPlaceholder: false,
                  required: true,
                  disabled: false,
                  associatedLabel: "Password",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: true,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("FORM-002");
  });

  it("returns passed when GET form has no password field", () => {
    const result = passwordGetRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: "/search",
              method: "get",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "text",
                  name: "q",
                  id: "q",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: "Search",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("FORM-002");
  });
});

describe("insecureFormActionRule (FORM-003)", () => {
  it("returns not-applicable when no forms exist", () => {
    const result = insecureFormActionRule.evaluator(createMockSnapshot());
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("FORM-003");
  });

  it("returns not-applicable when page is not HTTPS", () => {
    const result = insecureFormActionRule.evaluator(
      createMockSnapshot({
        finalUrl: "http://example.com/page",
        forms: {
          formCount: 1,
          forms: [
            {
              action: "http://example.com/submit",
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("FORM-003");
  });

  it("returns passed when all form actions use HTTPS", () => {
    const result = insecureFormActionRule.evaluator(
      createMockSnapshot({
        finalUrl: "https://example.com/page",
        forms: {
          formCount: 1,
          forms: [
            {
              action: "https://example.com/submit",
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("FORM-003");
  });

  it("returns failed when form submits to HTTP from HTTPS page", () => {
    const result = insecureFormActionRule.evaluator(
      createMockSnapshot({
        finalUrl: "https://example.com/page",
        forms: {
          formCount: 1,
          forms: [
            {
              action: "http://example.com/submit",
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("FORM-003");
  });

  it("returns passed when form action is relative on HTTPS page", () => {
    const result = insecureFormActionRule.evaluator(
      createMockSnapshot({
        finalUrl: "https://example.com/page",
        forms: {
          formCount: 1,
          forms: [
            {
              action: "/submit",
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("FORM-003");
  });
});

describe("autocompleteOffRule (FORM-004)", () => {
  it("returns not-applicable when no forms exist", () => {
    const result = autocompleteOffRule.evaluator(createMockSnapshot());
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("FORM-004");
  });

  it("returns passed when autocomplete is not disabled on identity fields", () => {
    const result = autocompleteOffRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: "/login",
              method: "post",
              autocomplete: "on",
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "password",
                  name: "pass",
                  id: "pass",
                  hasPlaceholder: false,
                  required: true,
                  disabled: false,
                  associatedLabel: "Password",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: true,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("FORM-004");
  });

  it("returns warning when identity fields have autocomplete=off", () => {
    const result = autocompleteOffRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: "/login",
              method: "post",
              autocomplete: "off",
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "password",
                  name: "pass",
                  id: "pass",
                  hasPlaceholder: false,
                  required: true,
                  disabled: false,
                  associatedLabel: "Password",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: true,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("FORM-004");
  });

  it("skips hidden inputs when checking for autocomplete=off", () => {
    const result = autocompleteOffRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: "/login",
              method: "post",
              autocomplete: "off",
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "hidden",
                  name: "csrf",
                  id: "csrf",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: null,
                  labelRelationship: "none",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: true,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("FORM-004");
  });

  it("triggers on email and text inputs with user/login names", () => {
    const result = autocompleteOffRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: "/login",
              method: "post",
              autocomplete: "off",
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "email",
                  name: "email",
                  id: "email",
                  hasPlaceholder: false,
                  required: true,
                  disabled: false,
                  associatedLabel: "Email",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
                {
                  type: "text",
                  name: "username",
                  id: "user",
                  hasPlaceholder: false,
                  required: true,
                  disabled: false,
                  associatedLabel: "Username",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 1,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("FORM-004");
  });
});

describe("duplicateFormIdsRule (FORM-005)", () => {
  it("returns not-applicable when no forms exist", () => {
    const result = duplicateFormIdsRule.evaluator(createMockSnapshot());
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("FORM-005");
  });

  it("returns passed when all input IDs are unique", () => {
    const result = duplicateFormIdsRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: null,
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "text",
                  name: "name",
                  id: "name",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: "Name",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
                {
                  type: "email",
                  name: "email",
                  id: "email",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: "Email",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 1,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("FORM-005");
  });

  it("returns failed when duplicate IDs exist across forms", () => {
    const result = duplicateFormIdsRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 2,
          forms: [
            {
              action: null,
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "text",
                  name: "search",
                  id: "search",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: "Search",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
            {
              action: null,
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 1,
              inputs: [
                {
                  type: "text",
                  name: "search2",
                  id: "search",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: "Search 2",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("FORM-005");
  });

  it("returns failed when duplicate IDs exist within a single form", () => {
    const result = duplicateFormIdsRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: null,
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "text",
                  name: "field1",
                  id: "dup",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: "Field 1",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
                {
                  type: "text",
                  name: "field2",
                  id: "dup",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: "Field 2",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 1,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("FORM-005");
  });

  it("ignores inputs without ids when checking duplicates", () => {
    const result = duplicateFormIdsRule.evaluator(
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: null,
              method: "post",
              autocomplete: null,
              novalidate: false,
              submitCount: 1,
              elementOrder: 0,
              inputs: [
                {
                  type: "text",
                  name: "a",
                  id: null,
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: null,
                  labelRelationship: "none",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
                {
                  type: "text",
                  name: "b",
                  id: null,
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: null,
                  labelRelationship: "none",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 1,
                },
              ],
            },
          ],
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("FORM-005");
  });
});
