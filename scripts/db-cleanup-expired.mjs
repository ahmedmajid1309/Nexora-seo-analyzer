import pg from "pg";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://nexora:nexora_local_password@localhost:5432/nexora";
const graceDays = Number(process.env.REPORT_DELETION_GRACE_DAYS ?? "7");
const client = new pg.Client({ connectionString: databaseUrl });

await client.connect();
try {
  const expired = await client.query(
    "UPDATE audit_reports SET status = 'expired', deleted_at = now(), updated_at = now() WHERE deleted_at IS NULL AND expires_at <= now() RETURNING id",
  );
  const purged = await client.query(
    "DELETE FROM audit_reports WHERE deleted_at IS NOT NULL AND deleted_at <= now() - ($1 || ' days')::interval RETURNING id",
    [graceDays],
  );
  console.log(JSON.stringify({ expired: expired.rowCount ?? 0, purged: purged.rowCount ?? 0 }));
} finally {
  await client.end();
}
