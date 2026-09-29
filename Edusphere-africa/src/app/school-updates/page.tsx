import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Reveal } from "@/components/ui";
import { UpdateRow } from "@/components/cards";
import { CommunityBand, NewsletterBand } from "@/components/bands";
import { getSchoolUpdates } from "@/lib/data";

export const metadata: Metadata = {
  title: "School Updates",
  description:
    "Admissions, Post-UTME, school fees, admission lists, JAMB, NYSC and academic updates for Nigerian and African institutions.",
};

export const dynamic = "force-dynamic";

const CATEGORIES = ["All", "Admissions", "Post-UTME", "Examinations", "Fees & Payment", "NYSC", "Academic Calendar"];

export default async function SchoolUpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const all = await getSchoolUpdates();
  const active = params.category ?? "All";
  const list = active === "All" ? all : all.filter((u) => u.category === active);

  return (
    <>
      <PageHero
        label="School updates"
        title="Everything your institution needs you to know."
        intro="Admissions, Post-UTME, school fees, admission lists, JAMB, NYSC and academic updates — written as instructions, not headlines, with the dates that matter surfaced first."
        meta={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-rule pt-5">
            <span className="label">
              <span className="tnum text-ink">{String(list.length).padStart(2, "0")}</span> updates
            </span>
            <span className="label">Session 2025/2026</span>
            <span className="label">Source: institution notice</span>
          </div>
        }
      />

      <section className="mx-auto w-full max-w-[76rem] px-5 pt-8 md:px-8">
        <div className="flex flex-wrap gap-2 border-b border-rule pb-6">
          {CATEGORIES.map((c) => {
            const isActive = active === c;
            const href = c === "All" ? "/school-updates" : `/school-updates?category=${encodeURIComponent(c)}`;
            return (
              <Link
                key={c}
                href={href}
                className={`min-h-[2.75rem] border px-4 text-[0.8125rem] font-semibold transition-colors ${
                  isActive
                    ? "border-brand bg-brand text-paper"
                    : "border-rule-strong bg-card text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {c}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 grid gap-3">
          {list.map((u, i) => (
            <Reveal key={u.slug} delay={i * 50}>
              <UpdateRow u={u} index={i} />
            </Reveal>
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-8 border border-dashed border-rule-strong p-10 text-center">
            <p className="text-[1.05rem] text-ink">No updates in this category yet.</p>
            <Link href="/school-updates" className="mt-5 inline-flex min-h-[3rem] items-center bg-brand px-6 text-[0.9375rem] font-semibold text-paper">
              View all updates
            </Link>
          </div>
        )}
      </section>

      <CommunityBand />
      <NewsletterBand />
    </>
  );
}
