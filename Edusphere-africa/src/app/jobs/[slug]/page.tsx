import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { Bullets, Field, Reveal, SourceNote, StatusStamp, TypeChip } from "@/components/ui";
import { JobCard } from "@/components/cards";
import { WA_LINK } from "@/components/chrome";
import { NewsletterBand } from "@/components/bands";
import { getJob, getRelatedJobs } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const j = await getJob(slug);
  if (!j) return { title: "Job not found" };
  return { title: `${j.title} at ${j.company}`, description: j.summary };
}

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const j = await getJob(slug);
  if (!j) notFound();
  const related = await getRelatedJobs(j.slug, 3);
  const initials = j.company.split(/\s+/).slice(0, 2).map((w) => w[0]).join("");

  return (
    <>
      <article className="border-b border-rule bg-card">
        <div className="mx-auto w-full max-w-[76rem] px-5 pt-8 md:px-8 md:pt-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[0.75rem] text-muted">
            <Link href="/" className="hover:text-brand">Home</Link>
            <span>/</span>
            <Link href="/jobs" className="hover:text-brand">Jobs &amp; Internships</Link>
            <span>/</span>
            <span className="text-ink">{j.experience}</span>
          </nav>

          <div className="mt-6 flex items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center bg-tint text-[1rem] font-bold uppercase text-brand">
              {initials}
            </span>
            <div>
              <p className="text-[0.9375rem] font-semibold text-ink">{j.company}</p>
              <p className="flex items-center gap-1.5 text-[0.8125rem] text-muted">
                <MapPin className="h-3.5 w-3.5" /> {j.location}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <TypeChip>{j.workMode}</TypeChip>
            <TypeChip tone="plain">{j.employmentType}</TypeChip>
            <TypeChip tone="plain">{j.experience}</TypeChip>
          </div>

          <h1 className="mt-5 max-w-4xl text-[clamp(1.9rem,6vw,3.4rem)] leading-[1.04] tracking-[-0.025em] text-ink">
            {j.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-muted">{j.summary}</p>

          <div className="mt-8 border border-rule bg-paper p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
              <span className="label">Role summary</span>
              <StatusStamp deadline={j.deadline} />
            </div>
            <div className="grid grid-cols-2 gap-x-6 md:grid-cols-4">
              <Field label="Company" value={j.company} />
              <Field label="Location" value={j.location} />
              <Field label="Work mode" value={j.workMode} />
              <Field label="Employment type" value={j.employmentType} />
              <Field label="Experience level" value={j.experience} />
              <Field label="Deadline" value={<span className="font-semibold">{fmt(j.deadline)}</span>} />
              <Field label="Salary" value={j.salary ? j.salary : "Not officially stated"} />
              <Field label="Published" value={fmt(j.publishedAt)} />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-[76rem] px-5 md:px-8">
          <figure className="relative overflow-hidden">
            <img src={j.image} alt={`${j.company} workplace`} className="aspect-[16/8] w-full object-cover md:aspect-[16/6]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 p-4 text-[0.75rem] text-paper/90">
              <span>Reference image — {j.imageCredit}</span>
              <a href={j.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                View posting on {j.sourceName}
              </a>
            </figcaption>
          </figure>
        </div>
      </article>

      <div className="mx-auto w-full max-w-[76rem] px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <div className="min-w-0 space-y-12">
            <section>
              <Head>Job description</Head>
              <p className="text-[1rem] leading-relaxed text-ink/90">{j.description}</p>
            </section>

            <section>
              <Head>Responsibilities</Head>
              <Bullets items={j.responsibilities} />
            </section>

            <section>
              <Head>Requirements</Head>
              <Bullets items={j.requirements} />
            </section>

            <section>
              <Head>How to apply</Head>
              <div className="grid gap-px bg-rule sm:grid-cols-2">
                <div className="bg-paper p-5">
                  <span className="label">Application deadline</span>
                  <p className="mt-2 text-[1.15rem] font-semibold text-ink tnum">{fmt(j.deadline)}</p>
                </div>
                <div className="bg-paper p-5">
                  <span className="label">Salary</span>
                  <p className="mt-2 text-[1.15rem] font-semibold text-ink">{j.salary ?? "Not officially stated"}</p>
                </div>
              </div>
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted">
                Apply only through the employer&apos;s own portal below. Edusphere Africa does not charge
                for job applications and never asks for payment on an employer&apos;s behalf.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={j.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[3.5rem] flex-1 items-center justify-center gap-2 bg-brand px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark"
                >
                  Apply on company site <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/jobs"
                  className="inline-flex min-h-[3.5rem] flex-1 items-center justify-center border border-rule-strong px-6 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink"
                >
                  Back to all jobs
                </Link>
              </div>
              <div className="mt-4">
                <SourceNote name={j.sourceName} url={j.sourceUrl} />
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-rule bg-paper p-5">
              <span className="label">Closing date</span>
              <p className="mt-2 text-[1.5rem] leading-none font-semibold text-ink tnum">{fmt(j.deadline)}</p>
              <div className="mt-4"><StatusStamp deadline={j.deadline} /></div>
            </div>
            <div className="border border-brand bg-brand p-5 text-paper">
              <span className="label !text-paper/60">Job alerts</span>
              <p className="mt-3 text-[1.05rem] leading-snug">Graduate roles and internships, sent daily to the community.</p>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-[3rem] w-full items-center justify-center gap-2 bg-paper px-4 text-[0.875rem] font-semibold text-brand-dark transition-colors hover:bg-accent hover:text-paper"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2.2} /> Join Community
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-16 border-t border-rule pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[clamp(1.5rem,4vw,2.1rem)] text-ink">Similar roles</h2>
            <Link href="/jobs" className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand">
              All jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <Reveal key={r.slug} delay={i * 60}>
                <JobCard j={r} />
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      <NewsletterBand />
    </>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <h2 className="text-[clamp(1.35rem,4vw,1.9rem)] leading-tight text-ink">{children}</h2>
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}
