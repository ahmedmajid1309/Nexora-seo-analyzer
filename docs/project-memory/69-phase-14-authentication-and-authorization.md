# Phase 14 Authentication And Authorization

Authentication is optional. Anonymous audits remain available. Local development sign-in uses an HTTP-only session cookie and no password cryptography. The schema includes account/session/verification-token tables compatible with provider-based authentication.

Authorization supports anonymous owner capabilities, authenticated owners, public share viewers, and internal cleanup workers. Report IDs never expose sequential database IDs.
