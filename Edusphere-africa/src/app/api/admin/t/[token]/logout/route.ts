import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin-security";

export const dynamic = "force-dynamic";

/** Sign out: revokes the session server-side and clears any stored cookie. */
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  await revokeSession(token);

  const options = sessionCookieOptions(req);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...options, maxAge: 0 });
  response.cookies.set("edusphere_admin", "", {
    httpOnly: true,
    secure: options.secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
