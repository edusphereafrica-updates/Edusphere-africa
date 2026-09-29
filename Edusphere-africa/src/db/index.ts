import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getDatabaseUrl } from "@/lib/database-status";

/**
 * Lazily-connected Drizzle pool. Next.js imports route modules during build,
 * including on Vercel where database env vars may be absent. Importing this
 * module must never open a socket or throw.
 */
const databaseUrl = getDatabaseUrl();

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl || undefined,
    max: 5,
    // Fail quickly; the public site has a committed read-only listing snapshot.
    connectionTimeoutMillis: 3_000,
    idleTimeoutMillis: 15_000,
  });

if (!databaseUrl) {
  const missing = (): never => {
    throw new Error(
      "A hosted PostgreSQL connection is not configured. Set DATABASE_URL or POSTGRES_URL in Vercel project environment variables to enable admin, newsletter and contact submissions.",
    );
  };
  pool.connect = missing as Pool["connect"];
  pool.query = missing as Pool["query"];
}

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
