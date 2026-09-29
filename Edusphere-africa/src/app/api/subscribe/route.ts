import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { getDatabaseUrl } from "@/lib/database-status";

export const dynamic = "force-dynamic";

const unavailable = () => NextResponse.json(
  {
    error: "Newsletter subscriptions are temporarily unavailable while our database is being connected.",
    storage: false,
  },
  { status: 503, headers: { "Cache-Control": "no-store" } },
);

export async function POST(req: Request) {
  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!getDatabaseUrl()) return unavailable();

  try {
    const existing = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    await db.insert(subscribers).values({ email, createdAt: new Date().toISOString().slice(0, 10) });
    return NextResponse.json({ ok: true });
  } catch {
    return unavailable();
  }
}
