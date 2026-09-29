import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, Database, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { adminUsers, scholarships, subscribers } from "@/db/schema";
import { getDatabaseUrl } from "@/lib/database-status";
import { PageHero } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Deployment status",
  robots: { index: false, follow: false },
};

type Status = "demo" | "connected" | "unavailable";

async function status(): Promise<Status> {
  if (!getDatabaseUrl()) return "demo";
  try {
    await Promise.all([
      db.select({ id: scholarships.id }).from(scholarships).limit(1),
      db.select({ id: adminUsers.id }).from(adminUsers).limit(1),
      db.select({ id: subscribers.id }).from(subscribers).limit(1),
    ]);
    return "connected";
  } catch {
    return "unavailable";
  }
}

export default async function SetupPage() {
  const mode = await status();
  const ready = mode === "connected";

  return (
    <>
      <PageHero
        label="Deployment status"
        title={ready ? "Your ecosystem is connected." : "Your public site is online."}
        intro={
          ready
            ? "PostgreSQL is reachable, the required tables exist, and subscriber and admin storage are ready."
            : "You can browse the site in example mode while a hosted PostgreSQL database is connected for permanent storage."
        }
      />

      <div className="mx-auto w-full max-w-[76rem] px-5 py-10 md:px-8 md:py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="border border-brand/20 bg-tint p-6 md:p-8">
            <CheckCircle2 className="h-6 w-6 text-brand" aria-hidden="true" />
            <h2 className="mt-4 text-[1.45rem] text-ink">Public discovery</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
              Homepage, scholarships, school updates, jobs, opportunities, articles and search are
              available. Example listings link back to official sources.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-[0.875rem] font-semibold text-brand hover:underline"
            >
              View homepage <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className={`border p-6 md:p-8 ${ready ? "border-brand/20 bg-tint" : "border-rule bg-card"}`}>
            {ready ? (
              <CheckCircle2 className="h-6 w-6 text-brand" aria-hidden="true" />
            ) : (
              <CircleAlert className="h-6 w-6 text-accent" aria-hidden="true" />
            )}
            <h2 className="mt-4 text-[1.45rem] text-ink">Persistent storage</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
              {mode === "demo"
                ? "No hosted database URL is configured. Admin publishing, newsletter emails and contact messages cannot be saved yet."
                : mode === "unavailable"
                  ? "A database URL is present, but the connection or required tables are unavailable. Check the deployment build log and connection string."
                  : "Admin publishing, subscriber emails and contact messages are stored securely in PostgreSQL."}
            </p>
            <p className="label mt-5">Status: {ready ? "Connected" : mode === "demo" ? "Example mode" : "Needs attention"}</p>
          </div>
        </div>

        {!ready && (
          <section className="mt-10 border border-rule bg-card p-6 md:p-9">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-brand" aria-hidden="true" />
              <h2 className="text-[1.55rem] text-ink">Enable the full platform</h2>
            </div>
            <ol className="mt-7 grid gap-6 md:grid-cols-3">
              <li className="border-t border-rule pt-4">
                <span className="label text-brand">01 / Create Postgres</span>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                  Provision a hosted PostgreSQL database in Vercel Marketplace, Neon or Supabase.
                  Copy its pooled connection string; a localhost URL cannot work on Vercel.
                </p>
              </li>
              <li className="border-t border-rule pt-4">
                <span className="label text-brand">02 / Add one variable</span>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                  In Vercel Project → Settings → Environment Variables, set{" "}
                  <code className="font-semibold text-ink">DATABASE_URL</code> or{" "}
                  <code className="font-semibold text-ink">POSTGRES_URL</code> for Production
                  and Preview. Never put your connection string into public page code.
                </p>
              </li>
              <li className="border-t border-rule pt-4">
                <span className="label text-brand">03 / Redeploy</span>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                  Redeploy the project. Its Vercel build command automatically applies the schema
                  and adds missing example listings without deleting published content.
                </p>
              </li>
            </ol>
            <div className="mt-7 flex flex-wrap gap-3 border-t border-rule pt-6">
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[3.25rem] items-center gap-2 bg-brand px-6 text-[0.9375rem] font-semibold text-paper hover:bg-brand-dark"
              >
                Open Vercel dashboard <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/community"
                className="inline-flex min-h-[3.25rem] items-center border border-rule-strong px-6 text-[0.9375rem] font-semibold text-ink hover:border-ink"
              >
                Explore the community
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
