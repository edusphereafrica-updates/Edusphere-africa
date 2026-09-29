import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getDatabaseUrl } from "@/lib/database-status";

export function authUnavailable(error: unknown, stage: string) {
  const reference = randomUUID();
  const cause = error instanceof Error && error.cause && typeof error.cause === "object"
    ? error.cause as { code?: unknown; name?: unknown }
    : error as { code?: unknown; name?: unknown } | null;

  // Do not log SQL parameters, connection URLs, cookies or passwords.
  console.error("Admin database unavailable", {
    reference,
    stage,
    type: error instanceof Error ? error.name : "UnknownError",
    code: typeof cause?.code === "string" ? cause.code : undefined,
  });

  const configured = Boolean(getDatabaseUrl());
  return NextResponse.json({
    ok: false,
    error: configured
      ? "Admin storage is unavailable. Check that your hosted PostgreSQL connection is reachable and its tables were created during deployment."
      : "Admin sign-in requires a hosted PostgreSQL database. Add DATABASE_URL (or POSTGRES_URL) in Vercel Environment Variables and redeploy.",
    reference,
  }, {
    status: 503,
    headers: { "Cache-Control": "private, no-store, max-age=0", "Retry-After": "5" },
  });
}
