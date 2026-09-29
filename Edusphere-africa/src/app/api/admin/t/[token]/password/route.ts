import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";
import { createSessionToken, getAdmin, hashSecret, verifySecret, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Change password. Authorised by the session token in the URL path. */
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let current: string;
  let next: string;
  try {
    const body: unknown = await req.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("current" in body) ||
      !("next" in body) ||
      typeof body.current !== "string" ||
      typeof body.next !== "string"
    ) {
      return NextResponse.json({ error: "Enter your current and new passwords." }, { status: 400 });
    }
    current = body.current;
    next = body.next;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (next.length < 8 || next.length > 1024 || current.length > 1024) {
    return NextResponse.json({ error: "New password must be between 8 and 1024 characters." }, { status: 400 });
  }

  const admin = await getAdmin(session.username);
  if (!admin || !verifySecret(current, admin.passwordHash)) {
    return NextResponse.json({ error: "Your current password is incorrect" }, { status: 401 });
  }

  const passwordHash = hashSecret(next);
  const changed = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(adminUsers)
      .set({ passwordHash, resetToken: null, resetExpires: null, updatedAt: new Date().toISOString() })
      .where(and(eq(adminUsers.id, admin.id), eq(adminUsers.passwordHash, admin.passwordHash)))
      .returning({ id: adminUsers.id });
    if (!updated) return false;
    await tx.delete(adminSessions).where(eq(adminSessions.adminId, admin.id));
    return true;
  });

  if (!changed) {
    return NextResponse.json({ error: "Your password changed elsewhere. Please sign in again." }, { status: 409 });
  }

  // Rotate the session and hand the new token back for the path URL.
  const newToken = await createSessionToken({ id: admin.id, passwordHash });
  return NextResponse.json({ ok: true, token: newToken });
}
