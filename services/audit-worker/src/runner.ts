import { runQuickAudit } from "../../../src/lib/audit/quick-audit";
import { runSiteAudit } from "../../../src/lib/site-audit";
import { SITE_AUDIT_DEFAULT_LIMIT } from "../../../src/lib/site-audit/types";
import { saveAuditReport } from "../../../src/lib/reports";
import { putJsonObject, isObjectStorageConfigured } from "../../../src/lib/storage";
import type { AuditJobPayload } from "../../../src/lib/jobs/types";

export async function runAuditJob(payload: AuditJobPayload) {
  if (payload.jobType === "quick-audit") {
    const { data } = await runQuickAudit({
      url: payload.url,
      requestId: payload.requestId,
      pagespeed: true,
      renderedDom: true,
      executiveSummary: true,
    });
    data.reportStorage = await saveAuditReport({
      reportType: "quick",
      data,
      idempotencyKey: payload.idempotencyKey ?? payload.requestId,
    });
    if (isObjectStorageConfigured()) {
      await putJsonObject(`audit-results/${payload.requestId}.json`, data);
    }
    return data;
  }

  const data = await runSiteAudit({
    requestId: payload.requestId,
    url: payload.url,
    pageLimit: payload.pageLimit ?? SITE_AUDIT_DEFAULT_LIMIT,
    crawlMode: payload.crawlMode ?? "links-and-sitemap",
  });
  data.reportStorage = await saveAuditReport({
    reportType: "site",
    data,
    idempotencyKey: payload.idempotencyKey ?? payload.requestId,
  });
  if (isObjectStorageConfigured()) {
    await putJsonObject(`audit-results/${payload.requestId}.json`, data);
  }
  return data;
}
