import { describe, it, expect } from "vitest";
import { createMockSnapshot } from "../../__tests__/test-utils";
import { httpsCheckRule } from "../https-check";
import { urlLengthRule } from "../url-length";
import { uppercasePathRule } from "../uppercase-path";
import { underscorePathRule } from "../underscore-path";
import { repeatedSeparatorsRule } from "../repeated-separators";
import { trackingParamsRule } from "../tracking-params";
import { sessionParamsRule } from "../session-params";
import { fragmentCanonicalRule } from "../fragment-canonical";
import { nonHttpCanonicalRule } from "../non-http-canonical";
import { defaultPortRule } from "../default-port";

describe("URL-001 - httpsCheckRule", () => {
  it("passes when finalUrl uses HTTPS", () => {
    const result = httpsCheckRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/page" }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-001");
  });

  it("fails when finalUrl uses HTTP", () => {
    const result = httpsCheckRule.evaluator(
      createMockSnapshot({ finalUrl: "http://example.com/page" }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("URL-001");
  });
});

describe("URL-002 - urlLengthRule", () => {
  it("passes when URL length is within 2000 characters", () => {
    const result = urlLengthRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/short" }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-002");
  });

  it("warns when URL length exceeds 2000 characters", () => {
    const longPath = "/a" + "b".repeat(2000);
    const result = urlLengthRule.evaluator(
      createMockSnapshot({ finalUrl: `https://example.com${longPath}` }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("URL-002");
  });
});

describe("URL-003 - uppercasePathRule", () => {
  it("passes when URL path has no uppercase characters", () => {
    const result = uppercasePathRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/lowercase-path" }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-003");
  });

  it("warns when URL path contains uppercase characters", () => {
    const result = uppercasePathRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/UpperCase-Path" }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("URL-003");
  });
});

describe("URL-004 - underscorePathRule", () => {
  it("passes when URL path has no underscores", () => {
    const result = underscorePathRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/hyphen-path" }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-004");
  });

  it("warns when URL path contains underscores", () => {
    const result = underscorePathRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/underscore_path" }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("URL-004");
  });
});

describe("URL-005 - repeatedSeparatorsRule", () => {
  it("passes when URL has no repeated separators", () => {
    const result = repeatedSeparatorsRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/normal/path" }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-005");
  });

  it("warns when URL contains repeated slashes", () => {
    const result = repeatedSeparatorsRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com//double-slash" }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("URL-005");
  });
});

describe("URL-006 - trackingParamsRule", () => {
  it("passes when URL has no tracking parameters", () => {
    const result = trackingParamsRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/page" }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-006");
  });

  it("warns when URL contains UTM tracking parameters", () => {
    const result = trackingParamsRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/page?utm_source=twitter" }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("URL-006");
  });
});

describe("URL-007 - sessionParamsRule", () => {
  it("passes when URL has no session parameters", () => {
    const result = sessionParamsRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/page" }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-007");
  });

  it("warns when URL contains session-like parameters", () => {
    const result = sessionParamsRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/page?sid=abc123" }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("URL-007");
  });
});

describe("URL-008 - fragmentCanonicalRule", () => {
  it("returns not-applicable when no canonical URL is defined", () => {
    const result = fragmentCanonicalRule.evaluator(
      createMockSnapshot({
        document: { ...createMockSnapshot().document, baseHref: null },
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("URL-008");
  });

  it("passes when canonical URL has no fragment", () => {
    const result = fragmentCanonicalRule.evaluator(
      createMockSnapshot({
        document: { ...createMockSnapshot().document, baseHref: "https://example.com/canonical" },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-008");
  });

  it("warns when canonical URL contains a fragment", () => {
    const result = fragmentCanonicalRule.evaluator(
      createMockSnapshot({
        document: {
          ...createMockSnapshot().document,
          baseHref: "https://example.com/page#section",
        },
      }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("URL-008");
  });
});

describe("URL-009 - nonHttpCanonicalRule", () => {
  it("returns not-applicable when no canonical URL is defined", () => {
    const result = nonHttpCanonicalRule.evaluator(
      createMockSnapshot({
        document: { ...createMockSnapshot().document, baseHref: null },
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("URL-009");
  });

  it("returns not-applicable when canonical URL is not valid", () => {
    const result = nonHttpCanonicalRule.evaluator(
      createMockSnapshot({
        document: { ...createMockSnapshot().document, baseHref: "not-a-url" },
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("URL-009");
  });

  it("passes when canonical uses HTTP/HTTPS scheme", () => {
    const result = nonHttpCanonicalRule.evaluator(
      createMockSnapshot({
        document: { ...createMockSnapshot().document, baseHref: "https://example.com/canonical" },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-009");
  });

  it("fails when canonical uses non-HTTP scheme", () => {
    const result = nonHttpCanonicalRule.evaluator(
      createMockSnapshot({
        document: { ...createMockSnapshot().document, baseHref: "ftp://example.com/file" },
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("URL-009");
  });
});

describe("URL-010 - defaultPortRule", () => {
  it("passes when URL has no default port", () => {
    const result = defaultPortRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com/page" }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-010");
  });

  it("passes when URL uses default HTTPS port (normalized by URL parser)", () => {
    const result = defaultPortRule.evaluator(
      createMockSnapshot({ finalUrl: "https://example.com:443/page" }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-010");
  });

  it("passes when URL uses default HTTP port (normalized by URL parser)", () => {
    const result = defaultPortRule.evaluator(
      createMockSnapshot({ finalUrl: "http://example.com:80/page" }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("URL-010");
  });
});
