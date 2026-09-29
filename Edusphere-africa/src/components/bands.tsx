import Link from "next/link";
import { ArrowRight, Link2, CalendarClock, Crosshair, Check } from "lucide-react";
import { Reveal, TypeChip } from "@/components/ui";
import { NewsletterForm } from "@/components/forms";
import { WhatsAppIcon, XIcon, ChannelIcon } from "@/components/brand-icons";
import { SITE } from "@/lib/site";

/* ------------------------------ Community band ---------------------------- */

const CHANNELS = ["Scholarships", "School Updates", "Jobs & Internships", "Study Abroad"];

export function CommunityBand() {
  return (
    <section className="relative isolate mt-20 overflow-hidden border-y border-brand-dark bg-brand-dark text-paper md:mt-28">
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/community.svg"
          alt="Students comparing opportunity alerts together on a campus step"
          loading="lazy"
          className="h-full w-full object-cover object-center opacity-30 md:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/92 to-brand-dark/60" />
      </div>

      <div className="mx-auto grid w-full max-w-[76rem] gap-10 px-5 py-16 md:grid-cols-[1.15fr_1fr] md:items-center md:px-8 md:py-24">
        <Reveal>
          <span className="label !text-accent">Community</span>
          <h2 className="mt-4 text-[clamp(2rem,6.5vw,3.4rem)] leading-[1.02] text-paper">
            Join thousands moving forward together.
          </h2>
          <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-paper/75 md:text-[1.0625rem]">
            Get scholarships, school updates, jobs and opportunities delivered directly to you.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {CHANNELS.map((c) => (
              <span
                key={c}
                className="border border-white/25 px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.13em] text-paper/85"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={SITE.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-2.5 bg-[#25D366] px-7 text-[1rem] font-semibold text-white transition-colors hover:bg-[#1da851]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Join the WhatsApp Group
            </a>
            <a
              href={SITE.whatsappChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-2.5 bg-paper px-7 text-[1rem] font-semibold text-brand-dark transition-colors hover:bg-accent hover:text-paper"
            >
              <ChannelIcon className="h-5 w-5" strokeWidth={2} />
              Follow the Channel
            </a>
            <Link
              href="/community"
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 border border-white/30 px-7 text-[0.9375rem] font-semibold text-paper transition-colors hover:border-paper"
            >
              How the community works <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={SITE.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Edusphere Africa on X"
              className="inline-flex min-h-[3.5rem] w-14 items-center justify-center border border-white/30 text-paper transition-colors hover:border-paper hover:bg-white/10"
            >
              <XIcon className="h-5 w-5" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="border border-white/15 bg-white/[0.05] p-6 backdrop-blur-sm md:p-8">
            <span className="label !text-paper/50">What lands in the group</span>
            <ul className="mt-5 space-y-4">
              {[
                ["Verified scholarships", "Deadline, funding level and eligibility in one message"],
                ["Admission & exam updates", "Post-UTME, JAMB, fees, matriculation lists"],
                ["Graduate roles", "Entry-level jobs, internships and trainee programmes"],
                ["Study-abroad alerts", "International admissions and funding windows"],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.6} />
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-paper">{t}</p>
                    <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-paper/65">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- Newsletter ------------------------------ */

export function NewsletterBand() {
  return (
    <section id="newsletter" className="mx-auto w-full max-w-[76rem] px-5 py-16 md:px-8 md:py-24">
      <Reveal>
        <div className="grid gap-8 border border-rule bg-card p-6 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-12 md:p-10">
          <div>
            <span className="label">Newsletter</span>
            <h2 className="mt-3 text-[clamp(1.75rem,5vw,2.75rem)] leading-[1.05] text-ink">
              Your weekly opportunity digest.
            </h2>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted">
              Get selected scholarships, school updates and career opportunities delivered to your
              inbox.
            </p>
          </div>
          <div>
            <NewsletterForm />
            <p className="mt-3 flex items-center gap-2 text-[0.75rem] text-muted">
              <CalendarClock className="h-3.5 w-3.5" /> One email every Monday. No noise, unsubscribe
              any time.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* --------------------------------- Trust ---------------------------------- */

const TRUST = [
  {
    icon: Link2,
    title: "Official Sources",
    body: "We link opportunities back to the original provider, so you can verify every detail before you apply.",
  },
  {
    icon: CalendarClock,
    title: "Clear Deadlines",
    body: "Important dates are always surfaced at the top of every listing, never buried in a paragraph.",
  },
  {
    icon: Crosshair,
    title: "Relevant Opportunities",
    body: "Content is curated for African students and young professionals — not reposted from everywhere.",
  },
];

export function TrustBand() {
  return (
    <section className="border-t border-rule bg-tint/45">
      <div className="mx-auto w-full max-w-[76rem] px-5 py-16 md:px-8 md:py-20">
        <Reveal>
          <span className="label">Why Edusphere Africa</span>
          <div className="mt-8 grid gap-px bg-rule md:grid-cols-3">
            {TRUST.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-paper p-6 md:p-8">
                <Icon className="h-6 w-6 text-brand" strokeWidth={1.7} />
                <h3 className="mt-5 text-[1.2rem] leading-snug text-ink">{title}</h3>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------- Category index tiles ------------------------- */

export type CatTile = {
  title: string;
  body: string;
  href: string;
  image: string;
  count: number;
  span?: string;
};

export function CategoryTile({ tile }: { tile: CatTile }) {
  return (
    <article className={`card group relative flex h-full flex-col ${tile.span ?? ""}`}>
      <Link href={tile.href} className="flex h-full flex-col">
        <div className="relative overflow-hidden">
          <img
            src={tile.image}
            alt=""
            loading="lazy"
            className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-brand/25 mix-blend-multiply transition-opacity group-hover:opacity-0" />
        </div>
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[1.3rem] leading-tight text-ink transition-colors group-hover:text-brand">
              {tile.title}
            </h3>
            <span className="label tnum shrink-0">{tile.count} live</span>
          </div>
          <p className="mt-2.5 text-[0.875rem] leading-relaxed text-muted">{tile.body}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand transition-all group-hover:gap-3">
            Browse <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}

/* ------------------------- WhatsApp floating button ----------------------- */

export function FloatingWA() {
  return (
    <a
      href={SITE.whatsappGroup}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-40 inline-flex min-h-[3.25rem] items-center gap-2.5 rounded-full bg-[#25D366] px-5 text-[0.875rem] font-semibold text-white shadow-[0_16px_34px_-16px_rgba(7,90,40,.9)] transition-transform hover:scale-[1.03] sm:bottom-6 sm:right-6"
      aria-label="Join the Edusphere Africa WhatsApp group"
    >
      <WhatsAppIcon className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

export { TypeChip };
