import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, TrendingUp } from "lucide-react";
import { SearchField } from "@/components/search";
import { Btn, Reveal, Section } from "@/components/ui";
import { CategoryTile, CommunityBand, NewsletterBand, TrustBand, type CatTile } from "@/components/bands";
import { ClosingRow, JobCard, OpportunityCard, ScholarshipCard, UpdateRow } from "@/components/cards";
import {
  closingSoonFrom,
  getJobs,
  getOpportunities,
  getScholarships,
  getSchoolUpdates,
} from "@/lib/data";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edusphere Africa — Find the opportunities that move you forward",
  description:
    "Scholarships, school updates, jobs, internships, fellowships and opportunities for Africans. Curated, deadline-first, linked to official sources.",
};

const CATEGORIES: CatTile[] = [
  {
    title: "Scholarships",
    body: "Undergraduate, Master's, PhD and fully funded opportunities.",
    href: "/scholarships",
    image: "/images/cat-scholarships.svg",
    count: 7,
    span: "md:col-span-4",
  },
  {
    title: "School Updates",
    body: "Admissions, Post-UTME, school fees, admission lists, JAMB, NYSC and academic updates.",
    href: "/school-updates",
    image: "/images/cat-school.svg",
    count: 5,
    span: "md:col-span-2",
  },
  {
    title: "Jobs & Internships",
    body: "Graduate jobs, internships, trainee programmes and entry-level opportunities.",
    href: "/jobs",
    image: "/images/cat-jobs.svg",
    count: 5,
    span: "md:col-span-2",
  },
  {
    title: "Study Abroad",
    body: "International scholarships, admissions and funding opportunities.",
    href: "/scholarships?funding=Fully%20Funded",
    image: "/images/cat-abroad.svg",
    count: 4,
    span: "md:col-span-2",
  },
  {
    title: "Fellowships & More",
    body: "Grants, competitions, fellowships, bootcamps and development programmes.",
    href: "/opportunities",
    image: "/images/cat-fellowships.svg",
    count: 6,
    span: "md:col-span-2",
  },
];

export default async function HomePage() {
  const [allScholarships, updates, allJobs, allOpportunities] = await Promise.all([
    getScholarships(),
    getSchoolUpdates(4),
    getJobs(),
    getOpportunities(),
  ]);
  const closing = closingSoonFrom(allScholarships, allJobs, allOpportunities, 5);
  const scholarships = allScholarships.slice(0, 3);
  const jobs = allJobs.slice(0, 3);
  const opportunities = allOpportunities.slice(0, 6);

  return (
    <>
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative isolate overflow-hidden border-b border-rule">
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/hero-campus.svg"
            alt="African students crossing a sunlit campus quadrangle"
            className="h-full w-full object-cover object-[70%_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper/88 to-paper/55 md:bg-gradient-to-r md:from-paper md:via-paper/90 md:to-paper/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-paper/70 via-transparent to-transparent" />
          {/* Mobile: extra paper wash so the headline and lede stay legible over the photograph */}
          <div className="absolute inset-0 bg-paper/45 md:hidden" />
        </div>

        <div className="mx-auto w-full max-w-[76rem] px-5 pt-12 pb-24 md:px-8 md:pt-20 md:pb-32">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="label">Opportunity discovery for Africa</span>
              <span className="h-px w-16 bg-rule-strong md:w-28" />
            </div>
            <h1 className="mt-6 max-w-[15ch] text-[clamp(2.35rem,8.5vw,5rem)] leading-[0.98] tracking-[-0.03em] text-ink">
              Find the opportunities that{" "}
              <span className="relative whitespace-nowrap text-brand">
                move you
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-accent"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9C48 3 120 2 198 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              forward.
            </h1>
            <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-muted md:text-[1.1875rem]">
              Scholarships, school updates, jobs, internships, fellowships and opportunities for
              Africans.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:max-w-lg sm:flex-row">
              <Btn href="/opportunities" className="sm:flex-1">
                Explore Opportunities <ArrowRight className="h-4 w-4" />
              </Btn>
            <a
              href={SITE.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
                className="inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 border border-rule-strong bg-card px-6 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
                Join Community
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Search straddles the hero rule — half on photograph, half on paper */}
      <div className="relative z-10 mx-auto -mt-14 w-full max-w-[76rem] px-5 md:-mt-16 md:px-8">
        <Reveal>
          <div className="shadow-[0_24px_50px_-34px_rgba(28,33,25,.75)]">
            <SearchField large />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] text-muted">
            <span className="label !text-[0.625rem]">Popular:</span>
            {[
              ["Fully funded Masters", "/search?q=fully+funded"],
              ["Post-UTME", "/search?q=post-utme"],
              ["Graduate jobs", "/search?q=graduate"],
              ["Internships", "/search?q=internship"],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="underline decoration-rule-strong underline-offset-4 hover:text-brand">
                {label}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ---------------------------- MAIN CATEGORIES ----------------------- */}
      <div className="mt-16 md:mt-24">
        <Section
          label="Browse"
          title="Start with what you need."
          intro="Five doors into the ecosystem. Everything is sorted by deadline and linked to its official source."
        >
          <div className="grid gap-5 md:grid-cols-6">
            {CATEGORIES.map((tile, i) => (
              <Reveal key={tile.title} delay={i * 60} className={tile.span}>
                <CategoryTile tile={tile} />
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      {/* ----------------------------- CLOSING SOON ------------------------- */}
      <div className="mt-16 md:mt-24">
        <Section
          label="Closing soon"
          title="Don't Miss These Deadlines"
          intro="Applications closing in the next few weeks, ordered by date."
          action={
            <Link
              href="/search?q=deadline"
              className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand hover:gap-3"
            >
              All deadlines <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="grid gap-3">
            {closing.map((item, i) => (
              <Reveal key={item.href} delay={i * 50}>
                <ClosingRow item={item} index={i} />
              </Reveal>
            ))}
            {closing.length === 0 && (
              <p className="border border-dashed border-rule-strong p-8 text-center text-muted">
                Nothing is closing right now — check back tomorrow.
              </p>
            )}
          </div>
        </Section>
      </div>

      {/* -------------------------- LATEST SCHOLARSHIPS --------------------- */}
      <div className="mt-16 md:mt-24">
        <Section
          label="Scholarships"
          title="Latest Scholarships"
          intro="Undergraduate, Master's and PhD funding, verified against the provider's notice."
          action={
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand hover:gap-3"
            >
              All scholarships <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((s, i) => (
              <Reveal key={s.slug} delay={i * 70}>
                <ScholarshipCard s={s} />
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      {/* ------------------------- LATEST SCHOOL UPDATES -------------------- */}
      <div className="mt-16 md:mt-24">
        <Section
          label="School updates"
          title="Latest School Updates"
          intro="Admissions, Post-UTME, fees, matriculation lists and academic calendars."
          action={
            <Link
              href="/school-updates"
              className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand hover:gap-3"
            >
              All updates <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="grid gap-3">
            {updates.map((u, i) => (
              <Reveal key={u.slug} delay={i * 50}>
                <UpdateRow u={u} index={i} />
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      {/* --------------------------- JOBS & INTERNSHIPS --------------------- */}
      <div className="mt-16 md:mt-24">
        <Section
          label="Careers"
          title="Jobs & Internships"
          intro="Graduate roles, internships, trainee programmes and entry-level openings across the continent."
          action={
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand hover:gap-3"
            >
              All jobs <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((j, i) => (
              <Reveal key={j.slug} delay={i * 70}>
                <JobCard j={j} />
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      {/* ----------------------------- OPPORTUNITIES ------------------------ */}
      <div className="mt-16 md:mt-24">
        <Section
          label="More"
          title="Opportunities beyond scholarships"
          intro="Fellowships, grants, competitions, training, conferences and exchange programmes."
          action={
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand hover:gap-3"
            >
              All opportunities <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="mb-6 flex flex-wrap gap-2">
            {["Fellowships", "Grants", "Competitions", "Training", "Conferences", "Exchange"].map((t) => (
              <Link
                key={t}
                href={`/opportunities?type=${encodeURIComponent(t)}`}
                className="border border-rule-strong bg-card px-3.5 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.11em] text-muted transition-colors hover:border-brand hover:bg-brand hover:text-paper"
              >
                {t}
              </Link>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((o, i) => (
              <Reveal key={o.slug} delay={i * 60}>
                <OpportunityCard o={o} />
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      <CommunityBand />
      <NewsletterBand />
      <TrustBand />

      {/* ------------------------------ CTA STRIP --------------------------- */}
      <section className="border-t border-rule">
        <div className="mx-auto flex w-full max-w-[76rem] flex-col items-start gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-start gap-4">
            <TrendingUp className="mt-1 h-6 w-6 shrink-0 text-accent" strokeWidth={1.8} />
            <div>
              <h2 className="text-[clamp(1.4rem,4vw,2rem)] leading-tight text-ink">
                Ready to see everything that is open right now?
              </h2>
              <p className="mt-2 max-w-lg text-[0.9375rem] text-muted">
                Browse the full board of scholarships, updates, roles and programmes — all sorted by
                deadline.
              </p>
            </div>
          </div>
          <Btn href="/opportunities">Explore Opportunities</Btn>
        </div>
      </section>
    </>
  );
}
