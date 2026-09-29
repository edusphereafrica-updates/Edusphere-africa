import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { ensureDefaultAdmin, getAdmin, newResetToken, verifySecret } from "@/lib/auth";
import { authUnavailable } from "@/lib/auth-errors";
import { getDatabaseUrl } from "@/lib/database-status";

export const dynamic = "force-dynamic";

/** Recovery token is shown on-screen because no mail-delivery service is configured. */
export async function GET() {
  if (!getDatabaseUrl()) return authUnavailable(new Error("Database not configured"), "recovery-question");
  try {
    await ensureDefaultAdmin();
    const admin = await getAdmin(process.env.ADMIN_USERNAME || "admin");
    return NextResponse.json({
      username: admin?.username ?? "admin",
      recoveryQuestion: admin?.recoveryQuestion ?? "What is your recovery keyword?",
    });
  } catch (error) {
    return authUnavailable(error, "recovery-question");
  }
}

export async function POST(req: Request) {
  let username = "";
  let answer = "";
  try {
    const body = (await req.json()) as { username?: string; answer?: string };
    username = (body.username ?? "").trim() || process.env.ADMIN_USERNAME || "admin";
    answer = (body.answer ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!getDatabaseUrl()) return authUnavailable(new Error("Database not configured"), "recovery-request");

  try {
    await ensureDefaultAdmin();
    const admin = await getAdmin(username);
    if (!admin || !verifySecret(answer, admin.recoveryAnswerHash)) {
      return NextResponse.json({ error: "That recovery answer is not correct" }, { status: 401 });
    }

    const { token, expires } = newResetToken();
    await db.update(adminUsers).set({
      resetToken: token,
      resetExpires: expires,
      updatedAt: new Date().toISOString(),
    }).where(eq(adminUsers.id, admin.id));
    return NextResponse.json({ ok: true, token, username: admin.username });
  } catch (error) {
    return authUnavailable(error, "recovery-request");
  }
}
