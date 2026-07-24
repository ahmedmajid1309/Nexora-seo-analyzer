import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractForms } from "../extract-forms";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

describe("extractForms", () => {
  describe("explicit labels fixture", () => {
    it("detects a single form", () => {
      const html = loadFixture("forms-explicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      expect(formInfo.formCount).toBe(1);
      expect(formInfo.forms).toHaveLength(1);
    });

    it("extracts form attributes", () => {
      const html = loadFixture("forms-explicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const form = formInfo.forms[0];
      expect(form.action).toBe("/submit");
      expect(form.method).toBe("post");
      expect(form.autocomplete).toBe("on");
      expect(form.novalidate).toBe(true);
    });

    it("detects explicit label relationships", () => {
      const html = loadFixture("forms-explicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const username = formInfo.forms[0].inputs.find((i) => i.name === "username")!;
      expect(username.associatedLabel).toBe("Username:");
      expect(username.labelRelationship).toBe("explicit");

      const email = formInfo.forms[0].inputs.find((i) => i.name === "email")!;
      expect(email.associatedLabel).toBe("Email:");
      expect(email.labelRelationship).toBe("explicit");
    });

    it("captures input attributes", () => {
      const html = loadFixture("forms-explicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const username = formInfo.forms[0].inputs.find((i) => i.name === "username")!;
      expect(username.type).toBe("text");
      expect(username.hasPlaceholder).toBe(true);
      expect(username.required).toBe(true);
      expect(username.disabled).toBe(false);

      const email = formInfo.forms[0].inputs.find((i) => i.name === "email")!;
      expect(email.disabled).toBe(true);
    });

    it("captures textarea and select elements", () => {
      const html = loadFixture("forms-explicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const message = formInfo.forms[0].inputs.find((i) => i.name === "message")!;
      expect(message.type).toBe("textarea");

      const country = formInfo.forms[0].inputs.find((i) => i.name === "country")!;
      expect(country.type).toBe("select");
    });

    it("counts submit buttons", () => {
      const html = loadFixture("forms-explicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      expect(formInfo.forms[0].submitCount).toBe(2);
    });

    it("marks submit and non-submit inputs", () => {
      const html = loadFixture("forms-explicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const submit = formInfo.forms[0].inputs.find((i) => i.type === "submit")!;
      expect(submit.isSubmit).toBe(true);

      const text = formInfo.forms[0].inputs.find((i) => i.type === "text")!;
      expect(text!.isSubmit).toBe(false);
    });
  });

  describe("implicit labels fixture", () => {
    it("detects implicit label relationships", () => {
      const html = loadFixture("forms-implicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const firstName = formInfo.forms[0].inputs.find((i) => i.name === "first_name")!;
      expect(firstName.associatedLabel).toContain("First Name");
      expect(firstName.labelRelationship).toBe("implicit");

      const agree = formInfo.forms[0].inputs.find((i) => i.name === "agree")!;
      expect(agree.associatedLabel).toContain("I agree");
      expect(agree.labelRelationship).toBe("implicit");
    });

    it("detects aria-label relationships", () => {
      const html = loadFixture("forms-implicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const search = formInfo.forms[0].inputs.find((i) => i.name === "search")!;
      expect(search.associatedLabel).toBe("Search query");
      expect(search.labelRelationship).toBe("aria-label");
    });

    it("detects aria-labelledby relationships", () => {
      const html = loadFixture("forms-implicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const search2 = formInfo.forms[0].inputs.find((i) => i.name === "search2")!;
      expect(search2.associatedLabel).toBe("Search Label");
      expect(search2.labelRelationship).toBe("aria-labelledby");
    });

    it("marks inputs with no label as none", () => {
      const html = loadFixture("forms-implicit-labels");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const noLabel = formInfo.forms[0].inputs.find((i) => i.name === "no-label")!;
      expect(noLabel.labelRelationship).toBe("none");
      expect(noLabel.associatedLabel).toBeNull();
    });
  });

  describe("sensitive form values fixture", () => {
    it("marks password inputs as redacted", () => {
      const html = loadFixture("sensitive-form-values");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const password = formInfo.forms[0].inputs.find((i) => i.name === "password")!;
      expect(password.isPassword).toBe(true);
      expect(password.redactedValue).toBe(true);
    });

    it("marks hidden inputs as redacted", () => {
      const html = loadFixture("sensitive-form-values");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const hidden = formInfo.forms[0].inputs.find((i) => i.name === "csrf_token")!;
      expect(hidden.isHidden).toBe(true);
      expect(hidden.redactedValue).toBe(true);
    });

    it("marks sensitive field names as redacted", () => {
      const html = loadFixture("sensitive-form-values");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const apiKey = formInfo.forms[0].inputs.find((i) => i.name === "api_key")!;
      expect(apiKey.redactedValue).toBe(true);
    });

    it("does not mark non-sensitive fields as redacted", () => {
      const html = loadFixture("sensitive-form-values");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const publicInfo = formInfo.forms[0].inputs.find((i) => i.name === "public_info")!;
      expect(publicInfo.redactedValue).toBe(false);
    });

    it("detects file input type", () => {
      const html = loadFixture("sensitive-form-values");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const file = formInfo.forms[0].inputs.find((i) => i.name === "upload")!;
      expect(file.isFile).toBe(true);
    });

    it("detects form method and action", () => {
      const html = loadFixture("sensitive-form-values");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      const form = formInfo.forms[0];
      expect(form.action).toBe("/login");
      expect(form.method).toBe("post");
    });
  });

  describe("no forms", () => {
    it("returns zero form count for pages without forms", () => {
      const html = loadFixture("empty-headings");
      const { $ } = parseHtml(html);
      const formInfo = extractForms($);

      expect(formInfo.formCount).toBe(0);
      expect(formInfo.forms).toHaveLength(0);
    });
  });
});
