import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { Bullets, Reveal, SourceNote, TypeChip } from "@/components/ui";
import { UpdateRow } from "@/components/cards";
import { WA_LINK } from "@/components/chrome";
import { NewsletterBand } from "@/components/bands";
import { getRelatedSchoolUpdates, getSchoolUpdate } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const u = await getSchoolUpdate(slug);
  if (!u) return { title: "School update not found" };
  return { title: `${u.school} — ${u.title}`, description: u.summary };
}

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function SchoolUpdatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const u = await getSchoolUpdate(slug);
  if (!u) notFound();
  const related = await getRelatedSchoolUpdates(u.slug, 3);

  return (
    <>
      <article className="border-b border-rule bg-card">
        <div className="mx-auto w-full max-w-[76rem] px-5 pt-8 md:px-8 md:pt-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[0.75rem] text-muted">
            <Link href="/" className="hover:text-brand">Home</Link>
            <span>/</span>
            <Link href="/school-updates" className="hover:text-brand">School Updates</Link>
            <span>/</span>
            <span className="text-ink">{u.category}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <TypeChip>{u.category}</TypeChip>
            <TypeChip tone="plain">{u.session}</TypeChip>
          </div>

          <p className="mt-5 text-[0.8125rem] font-semibold uppercase tracking-[0.13em] text-brand">{u.school}</p>
          <h1 className="mt-3 max-w-4xl text-[clamp(1.8rem,5.5vw,3.1rem)] leading-[1.05] tracking-[-0.025em] text-ink">
            {u.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-muted">{u.summary}</p>

          <div className="mt-8 border border-rule bg-paper p-5 md:p-6">
            <span className="label">At a glance</span>
            <div className="mt-4 grid grid-cols-2 gap-x-6 md:grid-cols-4">
              <div className="field">
                <span className="label">School</span>
                <span className="text-[0.9rem] font-medium text-ink">{u.school}</span>
              </div>
              <div className="field">
                <span className="label">Academic session</span>
                <span className="text-[0.9rem] font-medium text-ink tnum">{u.session}</span>
              </div>
              <div className="field">
                <span className="label">Update type</span>
                <span className="text-[0.9rem] font-medium text-ink">{u.category}</span>
              </div>
              <div className="field">
                <span className="label">Published</span>
                <span className="text-[0.9rem] font-medium text-ink tnum">{fmt(u.publishedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-[76rem] px-5 md:px-8">
          <figure className="relative overflow-hidden">
            <img src={u.image} alt={`${u.school} notice board`} className="aspect-[16/8] w-full object-cover md:aspect-[16/6]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 p-4 text-[0.75rem] text-paper/90">
              <span>Reference image — {u.imageCredit}</span>
              <a href={u.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                View on {u.sourceName}
              </a>
            </figcaption>
          </figure>
        </div>
      </article>

      <div className="mx-auto w-full max-w-[76rem] px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <div className="min-w-0 space-y-12">
            <section>
              <Head>Who this applies to</Head>
              <p className="border-l-2 border-brand bg-tint/60 px-5 py-4 text-[0.9375rem] leading-relaxed text-ink">
                {u.appliesTo}
              </p>
            </section>

            <section>
              <Head>Important dates</Head>
              <div className="grid gap-px bg-rule sm:grid-cols-2">
                {u.dates.map((d) => (
                  <div key={d.label} className="bg-paper p-5">
                    <span className="label">{d.label}</span>
                    <p className="mt-2 text-[1.05rem] font-semibold text-ink tnum">{d.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <Head>Requirements</Head>
              <Bullets items={u.requirements} />
            </section>

            <section>
              <Head>How to complete the process</Head>
              <Bullets items={u.steps} />
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={u.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[3.5rem] flex-1 items-center justify-center gap-2 bg-brand px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark"
                >
                  Open the official notice <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/school-updates"
                  className="inline-flex min-h-[3.5rem] flex-1 items-center justify-center border border-rule-strong px-6 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink"
                >
                  Back to all updates
                </Link>
              </div>
              <div className="mt-4">
                <SourceNote name={u.sourceName} url={u.sourceUrl} />
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-brand bg-brand p-5 text-paper">
              <span className="label !text-paper/60">Get updates first</span>
              <p className="mt-3 text-[1.05rem] leading-snug">
                Admission lists, Post-UTME and fee deadlines, pushed to the community.
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
            <div className="border border-rule bg-paper p-5">
              <span className="label">Institution</span>
              <p className="mt-2 text-[1.1rem] font-semibold text-ink">{u.school}</p>
              <p className="mt-1 text-[0.8125rem] text-muted">{u.session} · {u.category}</p>
            </div>
          </aside>
        </div>

        <section className="mt-16 border-t border-rule pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[clamp(1.5rem,4vw,2.1rem)] text-ink">Related school updates</h2>
            <Link href="/school-updates" className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand">
              All updates <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3">
            {related.map((r, i) => (
              <Reveal key={r.slug} delay={i * 50}>
                <UpdateRow u={r} index={i} />
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
