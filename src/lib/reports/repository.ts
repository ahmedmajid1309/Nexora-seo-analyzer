import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { env } from "@/config/env";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  auditFindings,
  auditPages,
  auditProgressEvents,
  auditReportVersions,
  auditReports,
  auditShareTokens,
  users,
} from "@/lib/db/schema";
import type { SiteAuditResponseData } from "@/lib/site-audit/types";
import type {
  PersistableReportData,
  ReportAccessContext,
  ReportListItem,
  ReportType,
  SaveReportResult,
} from "./types";
import { createOpaqueId, createSecretToken, hashSecret, safeEqualHash } from "./tokens";

const REPORT_SCHEMA_VERSION = "1.0.0";

function isSiteReport(data: PersistableReportData): data is SiteAuditResponseData {
  return "auditType" in data && data.auditType === "site";
}

function expiryFor(ownerUserId?: string | null): Date {
  const days = ownerUserId
    ? env.REPORT_AUTHENTICATED_RETENTION_DAYS
    : env.REPORT_ANONYMOUS_RETENTION_DAYS;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function scoreMetadata(data: PersistableReportData): Record<string, unknown> {
  if (isSiteReport(data)) {
    return { overallScore: data.aggregate.siteHealthScore, aggregate: data.aggregate };
  }
  const seo =
    data.scoreFamilies.find((family) => family.family === "seo-health")?.cappedScore ?? null;
  return { overallScore: seo, scoreFamilies: data.scoreFamilies, confidence: data.confidence };
}

function overallScoreFromMetadata(value: unknown): number | null {
  if (value && typeof value === "object" && "overallScore" in value) {
    const score = (value as { overallScore?: unknown }).overallScore;
    return typeof score === "number" ? score : null;
  }
  return null;
}

function requestedUrl(data: PersistableReportData): string {
  return data.requestedUrl;
}

function finalUrl(data: PersistableReportData): string {
  return isSiteReport(data) ? data.normalizedOrigin : data.finalUrl;
}

function calculationVersion(data: PersistableReportData): string {
  return isSiteReport(data) ? "site-aggregate-v1" : data.calculationVersion;
}

function snapshotSchemaVersion(data: PersistableReportData): string {
  return isSiteReport(data) ? "site-audit-v1" : data.snapshotSchemaVersion;
}

export async function saveAuditReport(input: {
  reportType: ReportType;
  data: PersistableReportData;
  userId?: string | null;
  idempotencyKey?: string | null;
}): Promise<SaveReportResult> {
  if (!env.REPORT_STORAGE_ENABLED) return { stored: false, reason: "report-storage-disabled" };
  if (!isDatabaseConfigured()) return { stored: false, reason: "database-not-configured" };
  const db = getDb();
  const publicId = createOpaqueId("rep");
  const ownerToken = input.userId ? null : createSecretToken("owner");
  const ownerHash = ownerToken ? hashSecret(ownerToken) : null;
  const idempotencyHash = input.idempotencyKey ? hashSecret(input.idempotencyKey) : null;
  const expiresAt = expiryFor(input.userId);
  const status =
    isSiteReport(input.data) && input.data.progress.some((event) => event.state === "partial")
      ? "partial"
      : "complete";

  try {
    return await db.transaction(async (tx) => {
      if (idempotencyHash) {
        const existing = await tx.query.auditReports.findFirst({
          where: eq(auditReports.idempotencyKeyHash, idempotencyHash),
        });
        if (existing) {
          return {
            stored: true,
            reason: "idempotent-existing",
            reportId: existing.publicId,
            ownerToken: ownerToken ?? undefined,
            expiresAt: existing.expiresAt.toISOString(),
          };
        }
      }
      const inserted = await tx
        .insert(auditReports)
        .values({
          publicId,
          ownerUserId: input.userId ?? null,
          anonymousOwnerTokenHash: ownerHash,
          requestId: input.data.requestId,
          idempotencyKeyHash: idempotencyHash,
          reportType: input.reportType,
          status,
          requestedUrl: requestedUrl(input.data),
          finalUrl: finalUrl(input.data),
          calculationVersion: calculationVersion(input.data),
          snapshotSchemaVersion: snapshotSchemaVersion(input.data),
          reportSchemaVersion: REPORT_SCHEMA_VERSION,
          noindex: true,
          summarySource: input.data.executiveSummary?.source ?? null,
          scoreMetadata: scoreMetadata(input.data),
          crawlMetadata: isSiteReport(input.data)
            ? {
                coverage: input.data.aggregate.coverage,
                pageLimit: input.data.pageLimit,
                crawlMode: input.data.crawlMode,
              }
            : null,
          deterministicResult: input.data,
          expiresAt,
        })
        .returning();
      const report = inserted[0];
      if (!report) throw new Error("report insert failed");
      await tx.insert(auditReportVersions).values({
        reportId: report.id,
        version: 1,
        reason: "deterministic-audit-complete",
        payload: input.data,
      });
      if (isSiteReport(input.data)) {
        for (const page of input.data.pages.slice(0, 50)) {
          const insertedPage = await tx
            .insert(auditPages)
            .values({
              reportId: report.id,
              url: page.finalUrl ?? page.requestedUrl,
              status: page.status,
              score:
                page.scoreFamilies.find((family) => family.family === "seo-health")?.cappedScore ??
                null,
              payload: page,
            })
            .returning();
          for (const finding of page.findings.slice(0, 200))
            await tx.insert(auditFindings).values({
              reportId: report.id,
              pageId: insertedPage[0]?.id,
              checkId: finding.checkId,
              state: finding.state,
              severity: finding.severity,
              payload: finding,
            });
        }
        for (const event of input.data.progress.slice(0, 200))
          await tx
            .insert(auditProgressEvents)
            .values({ reportId: report.id, state: event.state, payload: event });
      } else {
        for (const finding of input.data.findings.slice(0, 200))
          await tx.insert(auditFindings).values({
            reportId: report.id,
            checkId: finding.checkId,
            state: finding.state,
            severity: finding.severity,
            payload: finding,
          });
      }
      return {
        stored: true,
        reason: null,
        reportId: publicId,
        ownerToken: ownerToken ?? undefined,
        expiresAt: expiresAt.toISOString(),
      };
    });
  } catch {
    return { stored: false, reason: "storage-write-failed" };
  }
}

async function authorizeReport(
  report: typeof auditReports.$inferSelect,
  access: ReportAccessContext,
): Promise<"owner" | "share" | null> {
  if (report.deletedAt || report.expiresAt <= new Date()) return null;
  if (access.userId && report.ownerUserId === access.userId) return "owner";
  if (
    access.anonymousToken &&
    report.anonymousOwnerTokenHash &&
    safeEqualHash(access.anonymousToken, report.anonymousOwnerTokenHash)
  )
    return "owner";
  if (access.shareToken) {
    const share = await getDb().query.auditShareTokens.findFirst({
      where: eq(auditShareTokens.tokenHash, hashSecret(access.shareToken)),
    });
    if (
      share &&
      share.reportId === report.id &&
      !share.revokedAt &&
      (!share.expiresAt || share.expiresAt > new Date())
    )
      return "share";
  }
  return null;
}

export async function readReport(
  publicId: string,
  access: ReportAccessContext,
): Promise<{ data: PersistableReportData; access: "owner" | "share" } | null> {
  if (!isDatabaseConfigured()) return null;
  const report = await getDb().query.auditReports.findFirst({
    where: eq(auditReports.publicId, publicId),
  });
  if (!report) return null;
  const permission = await authorizeReport(report, access);
  if (!permission) return null;
  return { data: report.deterministicResult as PersistableReportData, access: permission };
}

export async function listReportsForUser(userId: string): Promise<ReportListItem[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await getDb().query.auditReports.findMany({
    where: and(eq(auditReports.ownerUserId, userId), isNull(auditReports.deletedAt)),
    orderBy: [desc(auditReports.createdAt)],
    limit: 50,
  });
  return rows
    .filter((row) => row.expiresAt > new Date())
    .map((row) => ({
      reportId: row.publicId,
      reportType: row.reportType as ReportType,
      status: row.status,
      requestedUrl: row.requestedUrl,
      finalUrl: row.finalUrl,
      createdAt: row.createdAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
      overallScore: overallScoreFromMetadata(row.scoreMetadata),
    }));
}

export async function createShareLink(
  publicId: string,
  access: ReportAccessContext,
): Promise<{ token: string } | null> {
  const report = await getDb().query.auditReports.findFirst({
    where: eq(auditReports.publicId, publicId),
  });
  if (!report || (await authorizeReport(report, access)) !== "owner") return null;
  const token = createSecretToken("share");
  await getDb()
    .insert(auditShareTokens)
    .values({ reportId: report.id, tokenHash: hashSecret(token), expiresAt: report.expiresAt });
  return { token };
}

export async function revokeShare(
  publicId: string,
  token: string,
  access: ReportAccessContext,
): Promise<boolean> {
  const report = await getDb().query.auditReports.findFirst({
    where: eq(auditReports.publicId, publicId),
  });
  if (!report || (await authorizeReport(report, access)) !== "owner") return false;
  await getDb()
    .update(auditShareTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(auditShareTokens.reportId, report.id),
        eq(auditShareTokens.tokenHash, hashSecret(token)),
      ),
    );
  return true;
}

export async function claimReport(
  publicId: string,
  ownerToken: string,
  userId: string,
): Promise<boolean> {
  const report = await getDb().query.auditReports.findFirst({
    where: eq(auditReports.publicId, publicId),
  });
  if (
    !report ||
    report.ownerUserId ||
    !report.anonymousOwnerTokenHash ||
    !safeEqualHash(ownerToken, report.anonymousOwnerTokenHash)
  )
    return false;
  await getDb()
    .update(auditReports)
    .set({
      ownerUserId: userId,
      anonymousOwnerTokenHash: null,
      updatedAt: new Date(),
      expiresAt: expiryFor(userId),
    })
    .where(eq(auditReports.id, report.id));
  return true;
}

export async function ensureDevUser(email: string): Promise<string> {
  const existing = await getDb().query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return existing.id;
  const inserted = await getDb()
    .insert(users)
    .values({ email, name: email.split("@")[0] })
    .returning();
  return inserted[0]!.id;
}

export async function deleteReport(
  publicId: string,
  access: ReportAccessContext,
): Promise<boolean> {
  const report = await getDb().query.auditReports.findFirst({
    where: eq(auditReports.publicId, publicId),
  });
  if (!report || (await authorizeReport(report, access)) !== "owner") return false;
  await getDb()
    .update(auditReports)
    .set({ status: "deleted", deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(auditReports.id, report.id));
  return true;
}

export async function cleanupExpiredReports(): Promise<{ expired: number; purged: number }> {
  if (!isDatabaseConfigured()) return { expired: 0, purged: 0 };
  const db = getDb();
  const expired = await db
    .update(auditReports)
    .set({ status: "expired", deletedAt: new Date(), updatedAt: new Date() })
    .where(and(isNull(auditReports.deletedAt), sql`${auditReports.expiresAt} <= now()`))
    .returning();
  const graceDays = env.REPORT_DELETION_GRACE_DAYS;
  const purged = await db
    .delete(auditReports)
    .where(
      sql`${auditReports.deletedAt} IS NOT NULL AND ${auditReports.deletedAt} <= now() - (${graceDays} || ' days')::interval`,
    )
    .returning();
  return { expired: expired.length, purged: purged.length };
}
