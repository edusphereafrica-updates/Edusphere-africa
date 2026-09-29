const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

/**
 * Vercel Postgres often injects POSTGRES_URL, while Neon and other providers
 * commonly use DATABASE_URL. Accept either without requiring manual renaming.
 * Never use a localhost connection string from a Vercel serverless function.
 */
export function getDatabaseUrl(): string | null {
  const candidates = [process.env.DATABASE_URL, process.env.POSTGRES_URL].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  const onVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      if (!/^(postgres|postgresql):$/.test(parsed.protocol)) continue;
      if (onVercel && localHosts.has(parsed.hostname.toLowerCase())) continue;
      return candidate;
    } catch {
      // A malformed URL cannot establish a connection. Move on to a usable one.
    }
  }
  return null;
}

export function databaseMode(): "configured" | "demo" {
  return getDatabaseUrl() ? "configured" : "demo";
}
