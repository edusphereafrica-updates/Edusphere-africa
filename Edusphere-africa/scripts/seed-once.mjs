import "dotenv/config";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { boolean, jsonb, pgTable, text } from "drizzle-orm/pg-core";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.log("No hosted database configured; example listings will load from the read-only snapshot.");
  process.exit(0);
}

const snapshot = JSON.parse(
  readFileSync(new URL("../src/lib/fallback-listings.json", import.meta.url), "utf8"),
);
const snake = (key) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 10_000, max: 2 });
const db = drizzle(pool);

/**
 * Drizzle insert-only bootstrap. The database schema is managed by drizzle-kit.
 * This script NEVER deletes or overwrites admin-created content, subscribers,
 * contact messages, changed passwords or sessions.
 */
async function insertMissing(tableName, rows) {
  if (!rows.length) return;
  const sample = rows[0];
  const columns = Object.fromEntries(
    Object.entries(sample)
      .filter(([name]) => name !== "id")
      .map(([name, value]) => [
        name,
        Array.isArray(value)
          ? jsonb(snake(name))
          : typeof value === "boolean"
            ? boolean(snake(name))
            : text(snake(name)),
      ]),
  );
  const table = pgTable(tableName, columns);
  const values = rows.map(({ id: _id, ...row }) => row);
  const inserted = await db.insert(table).values(values).onConflictDoNothing().returning();
  console.log(`[edusphere] ${tableName}: inserted ${inserted.length} missing examples.`);
}

try {
  await insertMissing("scholarships", snapshot.scholarships);
  await insertMissing("school_updates", snapshot.schoolUpdates);
  await insertMissing("jobs", snapshot.jobs);
  await insertMissing("opportunities", snapshot.opportunities);
} finally {
  await pool.end();
}
