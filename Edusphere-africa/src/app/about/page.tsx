import type { Metadata } from "next";
import { PageHero, Reveal, Btn } from "@/components/ui";
import { CommunityBand, TrustBand } from "@/components/bands";

export const metadata: Metadata = {
  title: "About",
  description:
    "Edusphere Africa is an education, career and opportunity discovery ecosystem built for African students, graduates and young professionals.",
};

const NUMBERS = [
  ["22", "live listings"],
  ["4", "content verticals"],
  ["1", "weekly digest"],
  ["100%", "linked to sources"],
];

const PRINCIPLES = [
  [
    "Deadline first",
    "Every listing leads with the closing date and an open/closed status. If you have to scroll to find out whether you can still apply, we have failed.",
  ],
  [
    "Source or it did not happen",
    "We link back to the original provider — a university portal, a ministry notice, a company careers page. Edusphere Africa never takes an application itself.",
  ],
  [
    "Written for Africans",
    "Eligibility is stated in plain language: who can apply, what documents you need, and whether the funder covers tuition, living costs or both.",
  ],
  [
    "Built to grow",
    "Scholarships, school updates, jobs and programmes are one layer. The ecosystem is designed to grow into directories, mentorship and application tooling.",
  ],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        label="About"
        title="An opportunity discovery ecosystem for Africa."
        intro="Edusphere Africa exists because the opportunities are usually out there — they are just hard to find, badly explained, and easy to miss before the deadline."
        meta={
          <div className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-4">
            {NUMBERS.map(([n, l]) => (
              <div key={l} className="bg-card px-4 py-4">
                <p className="text-[1.75rem] font-semibold leading-none text-brand tnum">{n}</p>
                <p className="label mt-2">{l}</p>
              </div>
            ))}
          </div>
        }
      />

      <section className="mx-auto w-full max-w-[76rem] px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <span className="label">Why we exist</span>
            <p className="mt-5 text-[clamp(1.2rem,3.5vw,1.6rem)] leading-[1.45] text-ink">
              A student in Kano, a graduate in Nairobi and a job seeker in Accra should not need five
              browser tabs, three WhatsApp groups and a lucky morning to find a fully funded
              Master&apos;s place.
            </p>
            <p className="mt-5 text-[0.975rem] leading-relaxed text-muted">
              We collect what is genuinely open, strip it down to the facts that decide an
              application — eligibility, funding, documents, deadline — and put a link to the
              provider beside it. No reposted press releases, no invented deadlines, no wall of
              headlines competing for a click.
            </p>
            <p className="mt-4 text-[0.975rem] leading-relaxed text-muted">
              The platform is deliberately mobile-first: most of our readers arrive on a phone, on a
              metered connection, with a deadline in a few days. Everything is built for that
              moment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn href="/opportunities">Explore Opportunities</Btn>
              <Btn href="/contact" variant="outline">Submit an Opportunity</Btn>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative overflow-hidden border border-rule">
              <img src="/images/about-desk.svg" alt="An editor's desk with ruled notes and printed forms" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-0 bg-brand/15 mix-blend-multiply" />
            </div>
            <p className="mt-3 text-[0.75rem] text-muted">
              Every listing is checked against the provider&apos;s own notice before publication.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-rule bg-card">
        <div className="mx-auto w-full max-w-[76rem] px-5 py-14 md:px-8 md:py-20">
          <div className="flex items-center gap-4">
            <h2 className="text-[clamp(1.6rem,5vw,2.5rem)] leading-tight text-ink">How we work</h2>
            <span className="h-px flex-1 bg-rule" />
          </div>
          <div className="mt-8 grid gap-px bg-rule md:grid-cols-2">
            {PRINCIPLES.map(([t, d], i) => (
              <div key={t} className="bg-card p-6 md:p-8">
                <span className="label tnum">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-[1.3rem] leading-snug text-ink">{t}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CommunityBand />
      <TrustBand />
    </>
  );
}
