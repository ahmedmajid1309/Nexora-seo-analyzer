# Phase 14 Privacy Security Matrix

- Database credentials remain server-only.
- Ownership and share tokens are stored hashed.
- Report routes are noindex.
- Reports are omitted from sitemap generation.
- Raw HTML, cookies, localStorage, sessionStorage, authorization headers, and form values are not persisted by default.
- Cleanup routes require a strong internal secret.
- ORM/parameterized queries are used for database access.
