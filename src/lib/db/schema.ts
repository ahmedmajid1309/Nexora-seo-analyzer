import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const auditReports = pgTable("audit_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").notNull().unique(),
  ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
  anonymousOwnerTokenHash: text("anonymous_owner_token_hash"),
  requestId: text("request_id").notNull(),
  idempotencyKeyHash: text("idempotency_key_hash").unique(),
  reportType: text("report_type").notNull(),
  status: text("status").notNull(),
  requestedUrl: text("requested_url").notNull(),
  finalUrl: text("final_url").notNull(),
  calculationVersion: text("calculation_version").notNull(),
  snapshotSchemaVersion: text("snapshot_schema_version").notNull(),
  reportSchemaVersion: text("report_schema_version").notNull(),
  noindex: boolean("noindex").default(true).notNull(),
  summarySource: text("summary_source"),
  scoreMetadata: jsonb("score_metadata").notNull(),
  crawlMetadata: jsonb("crawl_metadata"),
  deterministicResult: jsonb("deterministic_result").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const auditReportVersions = pgTable("audit_report_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => auditReports.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  reason: text("reason").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditPages = pgTable("audit_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => auditReports.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  status: text("status").notNull(),
  score: integer("score"),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditFindings = pgTable("audit_findings", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => auditReports.id, { onDelete: "cascade" }),
  pageId: uuid("page_id").references(() => auditPages.id, { onDelete: "cascade" }),
  checkId: text("check_id").notNull(),
  state: text("state").notNull(),
  severity: text("severity").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditProgressEvents = pgTable("audit_progress_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => auditReports.id, { onDelete: "cascade" }),
  state: text("state").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditShareTokens = pgTable("audit_share_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => auditReports.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditRetentionPolicies = pgTable("audit_retention_policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id").references(() => auditReports.id, { onDelete: "cascade" }),
  ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "cascade" }),
  policyType: text("policy_type").notNull(),
  retentionDays: integer("retention_days").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
