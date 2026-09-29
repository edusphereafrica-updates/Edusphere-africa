import { NextResponse, type NextRequest } from "next/server";
import { unsafeAdminRequest } from "@/lib/admin-security";

function privateResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "same-origin");
  return response;
}

/**
 * Request interception only enforces mutation hygiene here. Authorisation is
 * enforced next to the data: every admin API verifies a revocable database
 * session, and the admin shell renders no privileged data until that succeeds.
 * This keeps sign-in working when a preview proxy discards cookies entirely.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin/") && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const error = unsafeAdminRequest(req);
    if (error) return privateResponse(NextResponse.json({ error }, { status: 403 }));
  }

  return privateResponse(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
