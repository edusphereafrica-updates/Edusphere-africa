import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Neon usually supplies DATABASE_URL; Vercel Postgres often supplies
// POSTGRES_URL. The build setup calls drizzle-kit only when either is set.
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  throw new Error(
    "Set DATABASE_URL or POSTGRES_URL to a hosted PostgreSQL connection before running drizzle-kit. In Vercel, add it under Project → Settings → Environment Variables.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
