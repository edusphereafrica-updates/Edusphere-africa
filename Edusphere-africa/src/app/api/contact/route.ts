import { NextResponse } from "next/server";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { getDatabaseUrl } from "@/lib/database-status";

export const dynamic = "force-dynamic";

const unavailable = () => NextResponse.json(
  {
    error: "Online messages are temporarily unavailable while our database is being connected.",
    storage: false,
  },
  { status: 503, headers: { "Cache-Control": "no-store" } },
);

export async function POST(req: Request) {
  let body: { name?: string; email?: string; type?: string; message?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const type = (body.type ?? "General enquiry").trim();
  const message = (body.message ?? "").trim();

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Name, valid email and message are required" }, { status: 400 });
  }
  if (!getDatabaseUrl()) return unavailable();

  try {
    await db.insert(submissions).values({
      name,
      email,
      type,
      message: message.slice(0, 4000),
      createdAt: new Date().toISOString().slice(0, 10),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return unavailable();
  }
}
