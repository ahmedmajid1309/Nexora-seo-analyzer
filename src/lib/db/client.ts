import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "@/config/env";
import * as schema from "./schema";

let pool: pg.Pool | null = null;
let db: NodePgDatabase<typeof schema> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(env.DATABASE_URL);
}

export function getPgPool(): pg.Pool {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  pool ??= new pg.Pool({ connectionString: env.DATABASE_URL, max: 4, idleTimeoutMillis: 10_000 });
  return pool;
}

export function getDb(): NodePgDatabase<typeof schema> {
  db ??= drizzle(getPgPool(), { schema });
  return db;
}

export async function checkDatabaseHealth(): Promise<{ configured: boolean; healthy: boolean }> {
  if (!isDatabaseConfigured()) return { configured: false, healthy: false };
  try {
    await getPgPool().query("SELECT 1");
    return { configured: true, healthy: true };
  } catch {
    return { configured: true, healthy: false };
  }
}
