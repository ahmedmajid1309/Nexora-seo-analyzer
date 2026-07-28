# Phase 14 Retention And Deletion Policy

Anonymous reports default to 7 days. Authenticated reports default to 90 days. Deletion is soft-delete first, followed by permanent cleanup after the configured grace period. Expired/deleted reports return unavailable states and do not appear in history.
