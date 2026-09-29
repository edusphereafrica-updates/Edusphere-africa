import "dotenv/config";
import { execFileSync } from "node:child_process";

/**
 * Vercel build preparation. The site must never fail to deploy solely because
 * Postgres is not connected: public listings use the committed snapshot.
 * When a working hosted connection is present, set up tables and insert-only
 * examples automatically BEFORE Next.js starts building route modules.
 */
const candidates = [process.env.DATABASE_URL, process.env.POSTGRES_URL].filter(Boolean);
const isVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
const local = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
let url;
for (const value of candidates) {
  try {
    const parsed = new URL(value);
    if (!/^(postgres|postgresql):$/.test(parsed.protocol)) continue;
    if (isVercel && local.has(parsed.hostname.toLowerCase())) continue;
    url = value;
    break;
  } catch {
    // Ignore malformed connection strings and build the public site in demo mode.
  }
}

if (!url) {
  console.warn(
    "[edusphere] No hosted PostgreSQL URL was found. Deploying the public site " +
      "with read-only examples. To enable admin, newsletter and contact forms, " +
      "add DATABASE_URL (or POSTGRES_URL) to Vercel Environment Variables and redeploy.",
  );
  process.exit(0);
}

const env = { ...process.env, DATABASE_URL: url };
const run = (command, args, label) => {
  try {
    console.log(`[edusphere] ${label}…`);
    execFileSync(command, args, {
      stdio: "inherit",
      env,
      timeout: 120_000,
    });
    return true;
  } catch {
    // Don't prevent the Vercel deployment from serving the public site. The
    // runtime uses the snapshot if Postgres is unreachable or not migrated.
    console.warn(
      `[edusphere] ${label} could not finish. The public site will still deploy. ` +
        "Check that DATABASE_URL points to a reachable hosted Postgres database " +
        "and inspect the preceding build-log lines for migration errors.",
    );
    return false;
  }
};

if (run("npx", ["drizzle-kit", "push"], "Applying database schema")) {
  run("node", ["scripts/seed-once.mjs"], "Adding missing example listings");
}
