// Shared server policy. Never import this module into a client component.
export const SESSION_COOKIE = "edusphere_admin_session";
export const LEGACY_SESSION_COOKIE = "edusphere_admin";
export const SESSION_MAX_AGE = 60 * 60 * 12;

// Authentication uses random, database-backed sessions. No signing key or
// preview-specific environment variable is needed to create or validate one.
export function isSessionToken(value: string | undefined): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function publicProtocol(req: Request): "http:" | "https:" {
  // Preview proxies may report their internal HTTP hop. For same-origin
  // browser fetches, Origin records the actual scheme shown to the user.
  if (req.headers.get("sec-fetch-site") === "same-origin") {
    try {
      const origin = new URL(req.headers.get("origin") || req.url);
      if (origin.protocol === "https:") return "https:";
      if (origin.protocol === "http:") return "http:";
    } catch {
      // Fall back to trusted proxy/request metadata.
    }
  }
  const forwarded = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwarded === "https") return "https:";
  if (forwarded === "http") return "http:";
  return new URL(req.url).protocol === "https:" ? "https:" : "http:";
}

export function sessionCookieOptions(req: Request) {
  const secure = publicProtocol(req) === "https:";
  return {
    httpOnly: true,
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
    // CHIPS lets an HTTPS preview retain its own isolated session even when
    // the browser blocks ordinary third-party cookies. Local HTTP uses Lax.
    sameSite: secure ? ("none" as const) : ("lax" as const),
    partitioned: secure,
    priority: "high" as const,
  };
}

/**
 * SameSite=None must not make admin mutations vulnerable to CSRF. Accept
 * only JSON requests from this application's visible origin. Non-browser API
 * clients can omit Origin, but cross-site browser requests are refused.
 */
export function unsafeAdminRequest(req: Request): string | null {
  const contentType = req.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return "This endpoint accepts application/json requests only.";
  }
  // Sec-Fetch-Site is a forbidden request header: JavaScript cannot forge it,
  // and browsers send it on every request even when a preview proxy rewrites
  // Host / X-Forwarded-Host. Comparing Origin to the rewritten host instead
  // falsely rejects legitimate sign-in behind such proxies, so the browser's
  // own verdict is the authority here. Cross-site writes are refused; form
  // posts are already refused by the application/json requirement above.
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return "Cross-site admin requests are not allowed.";
  }
  return null;
}
