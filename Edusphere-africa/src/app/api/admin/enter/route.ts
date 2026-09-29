import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin-security";
import { getDatabaseUrl } from "@/lib/database-status";

export const dynamic = "force-dynamic";

/** Relative redirects work behind Vercel and the embedded preview proxy. */
export async function GET(req: Request) {
  if (!getDatabaseUrl()) {
    return new NextResponse(null, {
      status: 303,
      headers: { Location: "/admin/login?state=database", "Cache-Control": "private, no-store" },
    });
  }

  const token = new URL(req.url).searchParams.get("t") ?? "";
  try {
    const session = await verifySessionToken(token);
    const location = session
      ? `/admin/t/${encodeURIComponent(token)}`
      : "/admin/login?state=expired";
    const response = new NextResponse(null, {
      status: 303,
      headers: { Location: location, "Cache-Control": "private, no-store, max-age=0" },
    });
    if (session) response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(req));
    return response;
  } catch {
    return new NextResponse(null, {
      status: 303,
      headers: { Location: "/admin/login?state=database", "Cache-Control": "private, no-store" },
    });
  }
}
