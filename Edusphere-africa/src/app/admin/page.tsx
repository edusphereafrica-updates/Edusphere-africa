import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/admin-security";
import { loadDeskData } from "@/lib/admin-desk";
import { AdminDesk, AdminSignInRequired } from "@/components/admin-desk";
import { ensureDefaultAdmin } from "@/lib/auth";
import { getDatabaseUrl } from "@/lib/database-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Desk",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Clean entry point; all privileged data is loaded only after auth. */
export default async function AdminHome() {
  if (!getDatabaseUrl()) {
    return <AdminSignInRequired reason="Admin publishing and subscriber storage need hosted PostgreSQL. Add DATABASE_URL or POSTGRES_URL in Vercel and redeploy." />;
  }

  try {
    await ensureDefaultAdmin();
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return <AdminSignInRequired />;

    const data = await loadDeskData(token);
    return data ? <AdminDesk token={token} data={data} /> : <AdminSignInRequired />;
  } catch {
    return <AdminSignInRequired reason="The admin database could not be reached. Verify your hosted PostgreSQL connection and schema." />;
  }
}
