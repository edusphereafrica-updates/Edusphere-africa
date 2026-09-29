import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { PageHero, TypeChip } from "@/components/ui";
import { SearchField } from "@/components/search";
import { CommunityBand } from "@/components/bands";
import { searchAll, type SearchHit } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search scholarships, schools, jobs and opportunities across Edusphere Africa.",
};

const KIND_LABEL: Record<SearchHit["kind"], string> = {
  scholarship: "Scholarship",
  "school-update": "School update",
  job: "Job",
  opportunity: "Opportunity",
};

const SUGGESTIONS = ["Fully funded", "Post-UTME", "graduate", "internship", "fellowship", "Nigeria", "Remote"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const hits = await searchAll(q);

  return (
    <>
      <PageHero
        label="Search"
        title={q ? `Results for “${q}”` : "Search the whole board."}
        intro={
          q
            ? `${hits.length} ${hits.length === 1 ? "result" : "results"} across scholarships, school updates, jobs and opportunities.`
            : "Search scholarships, schools, jobs or opportunities — everything on Edusphere Africa is indexed, including deadlines and providers."
        }
        meta={<SearchField defaultValue={q} autoFocus={!q} id="search-page" />}
      />

      <section className="mx-auto w-full max-w-[76rem] px-5 py-10 md:px-8 md:py-14">
        {!q && (
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="label mr-1">Try</span>
            {SUGGESTIONS.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="border border-rule-strong bg-card px-3.5 py-2 text-[0.8125rem] font-medium text-muted transition-colors hover:border-brand hover:text-brand"
              >
                {s}
              </Link>
            ))}
          </div>
        )}

        {q && hits.length === 0 && (
          <div className="border border-dashed border-rule-strong p-10 text-center">
            <SearchX className="mx-auto h-8 w-8 text-muted" strokeWidth={1.6} />
            <p className="mt-4 text-[1.1rem] text-ink">Nothing matched “{q}”.</p>
            <p className="mt-2 text-[0.9375rem] text-muted">
              Try a provider name, a country, or a study level — or ask the community.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/scholarships" className="inline-flex min-h-[3rem] items-center bg-brand px-6 text-[0.9375rem] font-semibold text-paper">
                Browse scholarships
              </Link>
              <Link href="/opportunities" className="inline-flex min-h-[3rem] items-center border border-rule-strong px-6 text-[0.9375rem] font-semibold text-ink">
                Browse opportunities
              </Link>
            </div>
          </div>
        )}

        {hits.length > 0 && (
          <div className="grid gap-3">
            {hits.map((hit) => (
              <article key={hit.href} className="card group grid gap-4 p-5 md:grid-cols-[8rem_minmax(0,1fr)_auto] md:items-center md:gap-6">
                <TypeChip tone={hit.kind === "job" ? "ink" : "tint"}>{KIND_LABEL[hit.kind]}</TypeChip>
                <div className="min-w-0">
                  <h2 className="text-[1.1rem] leading-snug text-ink">
                    <Link href={hit.href} className="transition-colors hover:text-brand">
                      {hit.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-[0.8125rem] text-brand">{hit.meta}</p>
                  <p className="mt-1.5 line-clamp-2 text-[0.875rem] leading-relaxed text-muted">{hit.excerpt}</p>
                </div>
                <Link
                  href={hit.href}
                  className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand transition-all md:justify-self-end hover:gap-3"
                >
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <CommunityBand />
    </>
  );
}
