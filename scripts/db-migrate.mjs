import { readFile } from "node:fs/promises";
import { readdirSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://nexora:nexora_local_password@localhost:5432/nexora";
const migrationsDir = path.resolve("src/lib/db/migrations");
const client = new pg.Client({ connectionString: databaseUrl });

await client.connect();
try {
  await client.query(
    "CREATE TABLE IF NOT EXISTS __nexora_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  for (const file of readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    const exists = await client.query("SELECT 1 FROM __nexora_migrations WHERE name = $1", [file]);
    if (exists.rowCount) continue;
    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO __nexora_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`applied ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  }
} finally {
  await client.end();
}
