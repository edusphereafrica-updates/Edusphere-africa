import type { ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { AdminBar } from "@/components/admin-bar";
import { AdminDashboard } from "@/components/admin-dashboard";
import { Logo } from "@/components/ui";
import type { DeskData } from "@/lib/admin-desk";

/**
 * Server component: privileged data arrives already authorised, and the session
 * token travels in the URL path so no cookie, header or browser storage has to
 * survive for the desk to keep working.
 */
export function AdminDesk({ token, data }: { token: string; data: DeskData }) {
  return (
    <div className="min-h-screen bg-paper">
      <AdminBar username={data.username} token={token} />
      <main className="mx-auto w-full max-w-[80rem] px-5 py-10 md:px-8 md:py-12">
        <header className="mb-8">
          <span className="label">Admin desk</span>
          <h1 className="mt-3 text-[clamp(1.9rem,6vw,3rem)] leading-[1.05] text-ink">
            Welcome back, {data.username}.
          </h1>
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
            See who has subscribed, read incoming messages, and publish new opportunities straight to
            the site.
          </p>
        </header>
        <AdminDashboard
          token={token}
          subscribers={data.subscribers}
          submissions={data.submissions}
          oppCount={data.oppCount}
          opportunities={data.opportunities}
          scholarships={data.scholarships}
          schoolUpdates={data.schoolUpdates}
        />
      </main>
    </div>
  );
}

export function AdminSignInRequired({ reason }: { reason?: string }): ReactNode {
  return (
    <div className="grid min-h-[80vh] place-items-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5">
          <Logo className="h-11 w-auto" />
        </div>
        <div className="mt-8 border border-rule bg-card p-8 text-center">
          <span className="label inline-flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-brand" aria-hidden="true" /> Admin desk
          </span>
          <h1 className="mt-3 text-[clamp(1.6rem,5vw,2.2rem)] leading-tight text-ink">
            Sign in required
          </h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
            {reason || "This area is restricted to Edusphere Africa administrators."}
          </p>
          <Link
            href="/admin/login"
            className="mt-7 inline-flex min-h-[3.25rem] w-full items-center justify-center bg-brand px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark"
          >
            Go to sign in
          </Link>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-11 items-center text-[0.8125rem] text-muted hover:text-ink"
          >
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
