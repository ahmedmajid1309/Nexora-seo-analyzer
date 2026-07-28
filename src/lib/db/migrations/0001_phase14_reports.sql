CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  name text,
  image text,
  email_verified timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier text NOT NULL,
  token text NOT NULL,
  expires timestamptz NOT NULL,
  PRIMARY KEY(identifier, token)
);

CREATE TABLE IF NOT EXISTS audit_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  anonymous_owner_token_hash text,
  request_id text NOT NULL,
  idempotency_key_hash text UNIQUE,
  report_type text NOT NULL CHECK (report_type IN ('quick', 'site')),
  status text NOT NULL CHECK (status IN ('complete', 'partial', 'failed', 'deleted', 'expired')),
  requested_url text NOT NULL,
  final_url text NOT NULL,
  calculation_version text NOT NULL,
  snapshot_schema_version text NOT NULL,
  report_schema_version text NOT NULL,
  noindex boolean NOT NULL DEFAULT true,
  summary_source text,
  score_metadata jsonb NOT NULL,
  crawl_metadata jsonb,
  deterministic_result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS audit_reports_owner_idx ON audit_reports(owner_user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS audit_reports_anonymous_hash_idx ON audit_reports(anonymous_owner_token_hash) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS audit_reports_expiry_idx ON audit_reports(expires_at) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS audit_report_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  version integer NOT NULL,
  reason text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(report_id, version)
);

CREATE TABLE IF NOT EXISTS audit_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  url text NOT NULL,
  status text NOT NULL,
  score integer,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  page_id uuid REFERENCES audit_pages(id) ON DELETE CASCADE,
  check_id text NOT NULL,
  state text NOT NULL,
  severity text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_progress_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  state text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_share_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  revoked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES audit_reports(id) ON DELETE CASCADE,
  owner_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  policy_type text NOT NULL,
  retention_days integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
