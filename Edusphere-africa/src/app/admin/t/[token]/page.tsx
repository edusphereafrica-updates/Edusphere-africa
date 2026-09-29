import type { Metadata } from "next";
import { AdminDesk, AdminSignInRequired } from "@/components/admin-desk";
import { loadDeskData } from "@/lib/admin-desk";
import { getDatabaseUrl } from "@/lib/database-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Desk",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/**
 * The session token is verified against the database BEFORE any private data
 * renders. A missing/unreachable production database shows a useful message,
 * not Next.js's unbranded 500 screen.
 */
export default async function TokenAdminPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!getDatabaseUrl()) {
    return <AdminSignInRequired reason="Admin storage needs a hosted PostgreSQL database. Set DATABASE_URL or POSTGRES_URL in Vercel and redeploy." />;
  }

  try {
    const data = await loadDeskData(token);
    if (!data) {
      return <AdminSignInRequired reason="That session has expired or been signed out. Please sign in again." />;
    }
    return <AdminDesk token={token} data={data} />;
  } catch {
    return <AdminSignInRequired reason="The admin database could not be reached. Verify your hosted PostgreSQL connection and create the tables during deployment." />;
  }
}
