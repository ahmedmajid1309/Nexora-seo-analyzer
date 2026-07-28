import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import pg from "pg";
import type { AuditResponseData } from "@/lib/audit/types";

const databaseUrl = "postgres://nexora:nexora_local_password@localhost:5432/nexora";
let databaseAvailable = false;
const page = {
  requestedUrl: "https://example.com",
  finalUrl: "https://example.com/",
  pathname: "/",
  pageTitle: null,
};
const evidence = {
  source: "static-html" as const,
  observedValue: null,
  expectedValue: "A unique title element",
  selector: "title",
  elementSnippet: null,
  unavailableReason: "Fixture represents a repository persistence test only.",
};

function quickData(requestId = crypto.randomUUID()): AuditResponseData {
  return {
    requestId,
    requestedUrl: "https://example.com",
    finalUrl: "https://example.com/",
    responseStatus: 200,
    contentType: "text/html",
    byteLength: 100,
    durationMs: 10,
    totalRules: 1,
    stateCounts: { passed: 1 },
    findings: [
      {
        checkId: "META-001",
        state: "failed",
        category: "metadata",
        severity: "high",
        scored: true,
        summary: "Missing title",
        impact: "Unclear snippet",
        effort: "low",
        remediationSummary: "Add title",
        remediationSteps: ["Add title"],
        responsible: "seo",
        confidence: 1,
        page,
        evidence,
      },
    ],
    findingsTruncated: false,
    categoryBreakdowns: [],
    scoreFamilies: [
      { family: "seo-health", name: "SEO Health", rawScore: 80, cappedScore: 80, confidence: 1 },
    ],
    confidence: 1,
    appliedCaps: [],
    extractionWarnings: [],
    partialStage: null,
    unavailableStage: null,
    performanceScore: null,
    performanceStatus: "unavailable",
    performanceSource: null,
    performanceConfidence: null,
    performanceExplanation: "Unavailable",
    performanceMobile: null,
    performanceDesktop: null,
    serpPreview: {
      title: null,
      description: null,
      canonicalUrl: null,
      displayUrl: "https://example.com/",
    },
    socialPreview: {
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      ogUrl: null,
      ogType: null,
      twitterCard: null,
      twitterTitle: null,
      twitterDescription: null,
      twitterImage: null,
    },
    renderedDom: null,
    calculationVersion: "test-v1",
    snapshotSchemaVersion: "test-v1",
  };
}

async function repository() {
  vi.resetModules();
  process.env.DATABASE_URL = databaseUrl;
  process.env.REPORT_STORAGE_ENABLED = "true";
  process.env.AUTH_SECRET = "local-test-auth-secret-32-characters";
  return await import("../repository");
}

describe("report repository", () => {
  beforeAll(async () => {
    const client = new pg.Client({ connectionString: databaseUrl });
    try {
      await client.connect();
      await client.query("SELECT 1");
      databaseAvailable = true;
    } catch {
      databaseAvailable = false;
    } finally {
      await client.end().catch(() => undefined);
    }
  });

  beforeEach(async () => {
    if (!databaseAvailable) return;
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    await client.query("TRUNCATE audit_reports, users RESTART IDENTITY CASCADE");
    await client.end();
  });

  it("saves reports idempotently and preserves deterministic results", async () => {
    if (!databaseAvailable) return;
    const repo = await repository();
    const data = quickData();
    const first = await repo.saveAuditReport({
      reportType: "quick",
      data,
      idempotencyKey: "same-key",
    });
    const second = await repo.saveAuditReport({
      reportType: "quick",
      data,
      idempotencyKey: "same-key",
    });

    expect(first.stored).toBe(true);
    expect(second.reportId).toBe(first.reportId);
    const report = await repo.readReport(first.reportId!, { anonymousToken: first.ownerToken });
    expect(report?.data).toMatchObject({
      requestId: data.requestId,
      calculationVersion: "test-v1",
    });
  });

  it("enforces anonymous ownership and public share revocation", async () => {
    if (!databaseAvailable) return;
    const repo = await repository();
    const saved = await repo.saveAuditReport({
      reportType: "quick",
      data: quickData(),
      idempotencyKey: "share-key",
    });

    expect(await repo.readReport(saved.reportId!, { anonymousToken: "bad" })).toBeNull();
    const share = await repo.createShareLink(saved.reportId!, { anonymousToken: saved.ownerToken });
    expect(share?.token).toContain("share_");
    expect(await repo.readReport(saved.reportId!, { shareToken: share!.token })).not.toBeNull();
    expect(
      await repo.revokeShare(saved.reportId!, share!.token, { anonymousToken: saved.ownerToken }),
    ).toBe(true);
    expect(await repo.readReport(saved.reportId!, { shareToken: share!.token })).toBeNull();
  });

  it("claims and deletes reports with server-side authorization", async () => {
    if (!databaseAvailable) return;
    const repo = await repository();
    const saved = await repo.saveAuditReport({
      reportType: "quick",
      data: quickData(),
      idempotencyKey: "claim-key",
    });
    const userId = await repo.ensureDevUser("owner@example.com");

    expect(await repo.claimReport(saved.reportId!, "bad", userId)).toBe(false);
    expect(await repo.claimReport(saved.reportId!, saved.ownerToken!, userId)).toBe(true);
    expect(await repo.deleteReport(saved.reportId!, { anonymousToken: saved.ownerToken })).toBe(
      false,
    );
    expect(await repo.deleteReport(saved.reportId!, { userId })).toBe(true);
    expect(await repo.readReport(saved.reportId!, { userId })).toBeNull();
  });

  it("expires old reports and removes them from reads", async () => {
    if (!databaseAvailable) return;
    const repo = await repository();
    const saved = await repo.saveAuditReport({
      reportType: "quick",
      data: quickData(),
      idempotencyKey: "expiry-key",
    });
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    await client.query(
      "UPDATE audit_reports SET expires_at = now() - interval '1 second' WHERE public_id = $1",
      [saved.reportId],
    );
    await client.end();

    const result = await repo.cleanupExpiredReports();
    expect(result.expired).toBe(1);
    expect(await repo.readReport(saved.reportId!, { anonymousToken: saved.ownerToken })).toBeNull();
  });
});
