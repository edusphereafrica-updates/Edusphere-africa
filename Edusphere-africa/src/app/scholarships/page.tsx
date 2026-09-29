import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, Reveal } from "@/components/ui";
import { ScholarshipCard } from "@/components/cards";
import { CommunityBand, NewsletterBand } from "@/components/bands";
import { SearchField } from "@/components/search";
import { getScholarships } from "@/lib/data";

export const metadata: Metadata = {
  title: "Scholarships",
  description:
    "Undergraduate, Master's, PhD and fully funded scholarships for African students — with deadlines, eligibility and official application links.",
};

export const dynamic = "force-dynamic";

const LEVELS = ["All levels", "Undergraduate", "Master's", "PhD"];
const FUNDING = ["Any funding", "Fully Funded", "Partially Funded", "Need-based"];

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; funding?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const all = await getScholarships();
  const activeLevel = params.level ?? "All levels";
  const activeFunding = params.funding ?? "Any funding";

  let list = all.filter(
    (s) =>
      (activeLevel === "All levels" || s.studyLevel.includes(activeLevel)) &&
      (activeFunding === "Any funding" || s.fundingType === activeFunding),
  );
  if (params.sort === "closing") {
    const today = new Date().toISOString().slice(0, 10);
    list = [...list].sort(
      (a, b) =>
        Number(a.deadline < today) - Number(b.deadline < today) ||
        a.deadline.localeCompare(b.deadline),
    );
  }

  const build = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams();
    const merged = {
      level: activeLevel === "All levels" ? null : activeLevel,
      funding: activeFunding === "Any funding" ? null : activeFunding,
      sort: null,
      ...patch,
    };
    Object.entries(merged).forEach(([k, v]) => v && next.set(k, v));
    const qs = next.toString();
    return `/scholarships${qs ? `?${qs}` : ""}`;
  };

  const chip = (active: boolean) =>
    `min-h-[2.75rem] border px-4 text-[0.8125rem] font-semibold transition-colors ${
      active ? "border-brand bg-brand text-paper" : "border-rule-strong bg-card text-muted hover:border-ink hover:text-ink"
    }`;

  return (
    <>
      <PageHero
        label="Scholarships"
        title="Funding that actually closes on time."
        intro="Undergraduate, Master's and PhD scholarships for African students. Every listing carries its funding level, eligibility, deadline and a link back to the provider's own page."
        meta={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-rule pt-5">
            <span className="label">
              <span className="tnum text-ink">{String(list.length).padStart(2, "0")}</span> open listings
            </span>
            <span className="label">Updated weekly</span>
            <span className="label">Linked to official sources</span>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-[76rem] px-5 pt-8 md:px-8">
        <SearchField id="scholarship-search" />
      </div>

      <section className="mx-auto w-full max-w-[76rem] px-5 pt-8 md:px-8">
        <div className="flex flex-col gap-5 border-b border-rule pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <span className="label">Study level</span>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <Link key={l} href={build({ level: l === "All levels" ? null : l })} className={chip(activeLevel === l)}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="label">Funding</span>
            <div className="flex flex-wrap gap-2">
              {FUNDING.map((f) => (
                <Link
                  key={f}
                  href={build({ funding: f === "Any funding" ? null : f })}
                  className={chip(activeFunding === f)}
                >
                  {f}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href={build({ level: null, funding: null, sort: "closing" })}
            className="inline-flex min-h-[2.75rem] items-center gap-2 self-start border border-rule-strong px-4 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-accent hover:text-accent lg:self-auto"
          >
            Sort: closing soon <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Reveal key={s.slug} delay={i * 60}>
              <ScholarshipCard s={s} />
            </Reveal>
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-8 border border-dashed border-rule-strong p-10 text-center">
            <p className="text-[1.05rem] text-ink">No scholarships match those filters.</p>
            <p className="mt-2 text-[0.9375rem] text-muted">Try another study level or funding type.</p>
            <Link href="/scholarships" className="mt-5 inline-flex min-h-[3rem] items-center bg-brand px-6 text-[0.9375rem] font-semibold text-paper">
              Clear filters
            </Link>
          </div>
        )}
      </section>

      <CommunityBand />
      <NewsletterBand />
    </>
  );
}
