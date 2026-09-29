import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { Bullets, Field, Reveal, SourceNote, StatusStamp, TypeChip } from "@/components/ui";
import { ScholarshipCard } from "@/components/cards";
import { WA_LINK } from "@/components/chrome";
import { NewsletterBand } from "@/components/bands";
import { getRelatedScholarships, getScholarship } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getScholarship(slug);
  if (!s) return { title: "Scholarship not found" };
  return { title: s.title, description: s.summary };
}

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function ScholarshipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getScholarship(slug);
  if (!s) notFound();
  const related = await getRelatedScholarships(s.slug, 3);
  const today = new Date().toISOString().slice(0, 10);
  const open = s.deadline >= today;

  return (
    <>
      <article className="border-b border-rule bg-card">
        <div className="mx-auto w-full max-w-[76rem] px-5 pt-8 md:px-8 md:pt-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[0.75rem] text-muted">
            <Link href="/" className="hover:text-brand">Home</Link>
            <span>/</span>
            <Link href="/scholarships" className="hover:text-brand">Scholarships</Link>
            <span>/</span>
            <span className="text-ink">{s.studyLevel}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <TypeChip>Scholarship</TypeChip>
            <TypeChip tone="plain">{s.fundingType}</TypeChip>
            <span
              className={`inline-flex items-center border px-2.5 py-[0.3rem] text-[0.625rem] font-bold uppercase tracking-[0.13em] ${
                open ? "border-brand bg-tint text-brand" : "border-rule-strong text-muted"
              }`}
            >
              {open ? "Open" : "Closed"}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-[clamp(1.9rem,6vw,3.4rem)] leading-[1.04] tracking-[-0.025em] text-ink">
            {s.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-muted md:text-[1.0625rem]">{s.summary}</p>

          {/* Summary box — the details that decide whether you apply */}
          <div className="mt-8 border border-rule bg-paper p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 pb-4">
              <span className="label">At a glance</span>
              <StatusStamp deadline={s.deadline} />
            </div>
            <div className="grid grid-cols-2 gap-x-6 md:grid-cols-4">
              <Field label="Provider" value={s.provider} />
              <Field label="Country" value={s.country} />
              <Field label="Study level" value={s.studyLevel} />
              <Field label="Funding type" value={s.fundingType} />
              <Field label="Eligible applicants" value={s.applicants} />
              <Field label="Deadline" value={<span className="font-semibold">{fmt(s.deadline)}</span>} />
              <Field label="Status" value={open ? "Open — accepting applications" : "Closed"} />
              <Field label="Published" value={fmt(s.publishedAt)} />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-[76rem] px-5 md:px-8">
          <figure className="relative overflow-hidden">
            <img src={s.image} alt={s.title} className="aspect-[16/8] w-full object-cover md:aspect-[16/6]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 p-4 text-[0.75rem] text-paper/90">
              <span>Official image — {s.imageCredit}</span>
              <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                View on {s.sourceName}
              </a>
            </figcaption>
          </figure>
        </div>
      </article>

      <div className="mx-auto w-full max-w-[76rem] px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <div className="min-w-0 space-y-12">
            <Block title="Scholarship benefits">
              <ul className="space-y-3.5">
                {s.benefits.map((b, i) => (
                  <li key={i} className="flex gap-3.5 border-b border-rule pb-3.5 text-[0.9375rem] leading-relaxed text-ink/90 last:border-0">
                    <span className="mt-1 h-2 w-2 shrink-0 bg-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Block>

            <Block title="Eligibility requirements">
              <Bullets items={s.requirements} />
            </Block>

            <Block title="Required documents">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {s.documents.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 border border-rule bg-paper px-4 py-3 text-[0.875rem] text-ink">
                    <span className="label tnum">{String(i + 1).padStart(2, "0")}</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </Block>

            <Block title="How to apply">
              <Bullets items={s.howToApply} />
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={s.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[3.5rem] flex-1 items-center justify-center gap-2 bg-brand px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark"
                >
                  Go to official application <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/scholarships"
                  className="inline-flex min-h-[3.5rem] flex-1 items-center justify-center border border-rule-strong px-6 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink"
                >
                  Back to all scholarships
                </Link>
              </div>
              <div className="mt-4">
                <SourceNote name={s.sourceName} url={s.sourceUrl} />
              </div>
            </Block>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-rule bg-paper p-5">
              <span className="label">Deadline</span>
              <p className="mt-2 text-[1.5rem] leading-none font-semibold text-ink tnum">{fmt(s.deadline)}</p>
              <div className="mt-4">
                <StatusStamp deadline={s.deadline} />
              </div>
              <p className="mt-4 border-t border-rule pt-4 text-[0.8125rem] leading-relaxed text-muted">
                {open
                  ? "Applications are open. Apply on the provider's official site — Edusphere Africa never collects applications."
                  : "This window has closed. Similar opportunities are published in the WhatsApp community."}
              </p>
            </div>

            <div className="border border-brand bg-brand p-5 text-paper">
              <span className="label !text-paper/60">Never miss one</span>
              <p className="mt-3 text-[1.05rem] leading-snug">
                Get scholarships like this one straight to your phone.
              </p>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-[3rem] w-full items-center justify-center gap-2 bg-paper px-4 text-[0.875rem] font-semibold text-brand-dark transition-colors hover:bg-accent hover:text-paper"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2.2} /> Join Community
              </a>
            </div>

            <div className="border border-rule bg-card p-5">
              <span className="label">On this page</span>
              <ul className="mt-3 space-y-2 text-[0.875rem] text-muted">
                {["Scholarship benefits", "Eligibility requirements", "Required documents", "How to apply"].map((t) => (
                  <li key={t} className="border-b border-rule pb-2 last:border-0">{t}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-16 border-t border-rule pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[clamp(1.5rem,4vw,2.1rem)] text-ink">Related scholarships</h2>
            <Link href="/scholarships" className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand hover:gap-3 inline-flex items-center gap-2">
              All scholarships <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <Reveal key={r.slug} delay={i * 60}>
                <ScholarshipCard s={r} />
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      <NewsletterBand />
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-4">
        <h2 className="text-[clamp(1.35rem,4vw,1.9rem)] leading-tight text-ink">{title}</h2>
        <span className="h-px flex-1 bg-rule" />
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
