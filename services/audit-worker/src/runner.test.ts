import { describe, expect, it } from "vitest";
import type { AuditJobPayload } from "../../../src/lib/jobs/types";

describe("audit worker payload contract", () => {
  it("accepts quick audit jobs", () => {
    const payload = {
      jobType: "quick-audit",
      url: "https://example.com",
      requestId: "job_test",
    } satisfies AuditJobPayload;

    expect(payload.jobType).toBe("quick-audit");
  });

  it("accepts site audit jobs with crawl settings", () => {
    const payload = {
      jobType: "site-audit",
      url: "https://example.com",
      requestId: "job_test",
      pageLimit: 2,
      crawlMode: "links-only",
    } satisfies AuditJobPayload;

    expect(payload.crawlMode).toBe("links-only");
  });
});
