import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";
import { ensureDefaultAdmin, getAdmin, hashSecret } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin-security";
import { authUnavailable } from "@/lib/auth-errors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let username: string;
  let token: string;
  let password: string;
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || !("token" in body) || !("password" in body)
      || typeof body.token !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ error: "A reset token and new password are required." }, { status: 400 });
    }
    username = "username" in body && typeof body.username === "string"
      ? body.username.trim().toLowerCase()
      : (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
    token = body.token.trim();
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!/^[a-f0-9]{48}$/.test(token)) {
    return NextResponse.json({ error: "A valid reset token is required." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 1024) {
    return NextResponse.json({ error: "Password must be between 8 and 1024 characters." }, { status: 400 });
  }

  try {
    await ensureDefaultAdmin();
    const admin = await getAdmin(username);
    if (!admin || admin.resetToken !== token) {
      return NextResponse.json({ error: "Invalid or already-used reset token" }, { status: 401 });
    }
    const expires = Number(admin.resetExpires);
    if (!Number.isFinite(expires) || expires <= Date.now()) {
      return NextResponse.json({ error: "This reset token has expired. Start again." }, { status: 401 });
    }

    const changed = await db.transaction(async (tx) => {
      const [updated] = await tx.update(adminUsers).set({
        passwordHash: hashSecret(password),
        resetToken: null,
        resetExpires: null,
        updatedAt: new Date().toISOString(),
      }).where(and(eq(adminUsers.id, admin.id), eq(adminUsers.resetToken, token)))
        .returning({ id: adminUsers.id });
      if (!updated) return false;
      await tx.delete(adminSessions).where(eq(adminSessions.adminId, admin.id));
      return true;
    });
    if (!changed) return NextResponse.json({ error: "Invalid or already-used reset token" }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(req), maxAge: 0 });
    return response;
  } catch (error) {
    return authUnavailable(error, "reset-password");
  }
}
