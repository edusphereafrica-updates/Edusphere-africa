import { db } from "@/db";
import { adminUsers, scholarships, subscribers } from "@/db/schema";
import { databaseMode } from "@/lib/database-status";

export const dynamic = "force-dynamic";

export async function GET() {
  if (databaseMode() === "demo") {
    // Public pages are healthy and backed by the committed listing snapshot.
    // Be explicit that subscriber/admin storage is unavailable.
    return Response.json(
      { ok: true, mode: "demo", database: "not-configured", storage: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    // Confirm the actual tables exist, not merely that TCP credentials work.
    await Promise.all([
      db.select({ id: scholarships.id }).from(scholarships).limit(1),
      db.select({ id: adminUsers.id }).from(adminUsers).limit(1),
      db.select({ id: subscribers.id }).from(subscribers).limit(1),
    ]);
    return Response.json(
      { ok: true, mode: "connected", database: "connected", storage: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        ok: false,
        mode: "demo",
        database: "unavailable-or-not-migrated",
        storage: false,
        help: "Check your hosted DATABASE_URL/POSTGRES_URL and deployment schema setup log.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
