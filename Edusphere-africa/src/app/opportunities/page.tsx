import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Reveal } from "@/components/ui";
import { OpportunityCard } from "@/components/cards";
import { CommunityBand, NewsletterBand } from "@/components/bands";
import { SearchField } from "@/components/search";
import { getOpportunities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Fellowships, grants, competitions, training programmes, conferences and exchange programmes for Africans.",
};

export const dynamic = "force-dynamic";

const TYPES = ["All", "Fellowship", "Grant", "Competition", "Training", "Conference", "Exchange"];

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  const all = await getOpportunities();
  const active = params.type ?? "All";
  const list = active === "All" ? all : all.filter((o) => o.oppType === active);

  return (
    <>
      <PageHero
        label="Opportunities"
        title="Programmes that reshape a career."
        intro="Fellowships, grants, competitions, training, conferences and exchange programmes — for students, graduates and young professionals building something across Africa."
        meta={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-rule pt-5">
            <span className="label">
              <span className="tnum text-ink">{String(list.length).padStart(2, "0")}</span> listings
            </span>
            <span className="label">Africa-wide &amp; global</span>
            <span className="label">Deadline-first</span>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-[76rem] px-5 pt-8 md:px-8">
        <SearchField id="opportunity-search" />
      </div>

      <section className="mx-auto w-full max-w-[76rem] px-5 pt-8 md:px-8">
        <div className="flex flex-wrap gap-2 border-b border-rule pb-6">
          {TYPES.map((t) => {
            const isActive = active === t;
            const href = t === "All" ? "/opportunities" : `/opportunities?type=${encodeURIComponent(t)}`;
            return (
              <Link
                key={t}
                href={href}
                className={`min-h-[2.75rem] border px-4 text-[0.8125rem] font-semibold transition-colors ${
                  isActive
                    ? "border-brand bg-brand text-paper"
                    : "border-rule-strong bg-card text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {t}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((o, i) => (
            <Reveal key={o.slug} delay={i * 60}>
              <OpportunityCard o={o} />
            </Reveal>
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-8 border border-dashed border-rule-strong p-10 text-center">
            <p className="text-[1.05rem] text-ink">Nothing open in this category at the moment.</p>
            <Link href="/opportunities" className="mt-5 inline-flex min-h-[3rem] items-center bg-brand px-6 text-[0.9375rem] font-semibold text-paper">
              View all opportunities
            </Link>
          </div>
        )}
      </section>

      <CommunityBand />
      <NewsletterBand />
    </>
  );
}
