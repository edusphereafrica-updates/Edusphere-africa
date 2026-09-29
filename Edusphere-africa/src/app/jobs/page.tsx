import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Reveal } from "@/components/ui";
import { JobCard } from "@/components/cards";
import { CommunityBand, NewsletterBand } from "@/components/bands";
import { SearchField } from "@/components/search";
import { getJobs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Jobs & Internships",
  description:
    "Graduate jobs, internships, trainee programmes and entry-level opportunities across Africa and remote.",
};

export const dynamic = "force-dynamic";

const MODES = ["All modes", "On-site", "Hybrid", "Remote"];
const LEVELS = ["All experience", "Entry level", "Internship", "Graduate programme"];

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const all = await getJobs();
  const internshipOnly = params.category === "internship";
  const list = internshipOnly ? all.filter((j) => /intern/i.test(j.employmentType) || /intern/i.test(j.experience)) : all;

  return (
    <>
      <PageHero
        label="Jobs & internships"
        title="Roles built for the start of your career."
        intro="Graduate jobs, internships, trainee programmes and entry-level opportunities — with work mode, experience level and closing date on the card, so you can decide fast."
        meta={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-rule pt-5">
            <span className="label">
              <span className="tnum text-ink">{String(list.length).padStart(2, "0")}</span> open roles
            </span>
            {internshipOnly && <span className="label !text-accent">Filtering: internships</span>}
            <span className="label">Apply on the company portal</span>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-[76rem] px-5 pt-8 md:px-8">
        <SearchField id="job-search" />
      </div>

      <section className="mx-auto w-full max-w-[76rem] px-5 pt-8 md:px-8">
        <div className="flex flex-wrap gap-7 border-b border-rule pb-6">
          <div className="flex flex-col gap-3">
            <span className="label">Work mode</span>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <span
                  key={m}
                  className={`border px-3.5 py-2 text-[0.8125rem] font-semibold ${
                    m === "All modes" ? "border-brand bg-brand text-paper" : "border-rule-strong bg-card text-muted"
                  }`}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="label">Experience</span>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <span
                  key={l}
                  className={`border px-3.5 py-2 text-[0.8125rem] font-semibold ${
                    l === "All experience" ? "border-brand bg-brand text-paper" : "border-rule-strong bg-card text-muted"
                  }`}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          {internshipOnly && (
            <Link href="/jobs" className="self-end border border-rule-strong px-4 py-2.5 text-[0.8125rem] font-semibold text-ink hover:border-ink">
              Clear filter
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((j, i) => (
            <Reveal key={j.slug} delay={i * 60}>
              <JobCard j={j} />
            </Reveal>
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-8 border border-dashed border-rule-strong p-10 text-center">
            <p className="text-[1.05rem] text-ink">No internships are open right now.</p>
            <Link href="/jobs" className="mt-5 inline-flex min-h-[3rem] items-center bg-brand px-6 text-[0.9375rem] font-semibold text-paper">
              View all roles
            </Link>
          </div>
        )}
      </section>

      <CommunityBand />
      <NewsletterBand />
    </>
  );
}
