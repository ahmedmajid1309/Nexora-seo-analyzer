# Phase 14 Database Schema

The PostgreSQL migration creates account/session tables and report tables for `audit_reports`, `audit_report_versions`, `audit_pages`, `audit_findings`, `audit_progress_events`, `audit_share_tokens`, and `audit_retention_policies`.

Report rows use random public IDs and store deterministic audit result JSON, score metadata, crawl metadata, immutable calculation version, expiry timestamp, noindex state, and nullable owner user ID.
