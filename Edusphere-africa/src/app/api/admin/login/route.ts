import { NextResponse } from "next/server";
import { createSessionToken, ensureDefaultAdmin, getAdmin, verifySecret } from "@/lib/auth";
import { LEGACY_SESSION_COOKIE, SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin-security";
import { authUnavailable } from "@/lib/auth-errors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let username: string;
  let password: string;
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || !("username" in body) || !("password" in body)
      || typeof body.username !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ error: "Enter your username and password." }, { status: 400 });
    }
    username = body.username.trim().toLowerCase();
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid sign-in request. Please try again." }, { status: 400 });
  }

  if (!username || !password || username.length > 64 || password.length > 1024) {
    return NextResponse.json({ error: "Enter a valid username and password." }, { status: 400 });
  }

  let stage = "load-account";
  try {
    await ensureDefaultAdmin();
    const admin = await getAdmin(username);
    stage = "check-password";
    if (!admin || !verifySecret(password, admin.passwordHash)) {
      return NextResponse.json({ error: "Incorrect username or password. Please try again." }, { status: 401 });
    }

    stage = "create-database-session";
    const token = await createSessionToken(admin);
    const options = sessionCookieOptions(req);
    const response = NextResponse.json(
      // The token is also returned so the client can authenticate even when a
      // proxy discards Set-Cookie. It is the same revocable database session.
      { ok: true, token, username: admin.username },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
    response.cookies.set(SESSION_COOKIE, token, options);
    response.cookies.set(LEGACY_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: options.secure,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return authUnavailable(error, stage);
  }
}
