import type { Metadata } from "next";
import { Check, Clock, ShieldCheck, Megaphone, Mail } from "lucide-react";
import { PageHero, Reveal } from "@/components/ui";
import { NewsletterBand, TrustBand } from "@/components/bands";
import { WhatsAppIcon, XIcon, ChannelIcon } from "@/components/brand-icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Join the Edusphere Africa WhatsApp group and channel, follow us on X and subscribe to the weekly newsletter — scholarships, school updates, jobs and study-abroad alerts delivered to you.",
};

const CHANNELS = [
  ["Scholarships", "Fully funded windows, deadlines and eligibility before they close."],
  ["School Updates", "Post-UTME, admission lists, fee deadlines, JAMB and NYSC notices."],
  ["Jobs & Internships", "Graduate roles, trainee programmes and internships across Africa."],
  ["Study Abroad", "International admissions, visas and funding opportunities."],
];

const STEPS = [
  ["Join the group", "Tap the invite link and open the community in WhatsApp. One tap, no forms."],
  ["Follow the channel", "Get broadcast-only alerts in the channel, and discuss them in the group."],
  ["Apply with the link", "Every alert carries the deadline, eligibility and the official application link."],
];

export default function CommunityPage() {
  return (
    <>
      <PageHero
        label="Community"
        title="Join thousands moving forward together."
        intro="Get scholarships, school updates, jobs and opportunities delivered directly to you — verified, dated, and linked back to the official provider."
        meta={
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-2.5 bg-brand px-7 text-[1rem] font-semibold text-paper transition-colors hover:bg-brand-dark"
            >
              <ChannelIcon className="h-5 w-5" strokeWidth={2} />
              Follow the Channel
            </a>
            <a
              href="#newsletter"
              className="inline-flex min-h-[3.5rem] items-center justify-center border border-rule-strong bg-paper px-7 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink"
            >
              Get the newsletter
            </a>
          </div>
        }
      />

      <section className="mx-auto w-full max-w-[76rem] px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <Reveal>
            <div className="relative overflow-hidden border border-rule">
              <img
                src="/images/community.svg"
                alt="Students sharing opportunity alerts together"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-0 bg-brand/25 mix-blend-multiply" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark/95 to-transparent p-6 pt-16">
                <p className="label !text-paper/60">Channels</p>
                <p className="mt-2 text-[1.35rem] leading-snug text-paper">
                  Four topics. Zero forwarded noise.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid gap-px bg-rule sm:grid-cols-2">
              {CHANNELS.map(([title, body]) => (
                <div key={title} className="bg-paper p-6">
                  <Check className="h-5 w-5 text-accent" strokeWidth={2.6} />
                  <h3 className="mt-4 text-[1.15rem] leading-snug text-ink">{title}</h3>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={SITE.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-2.5 bg-[#25D366] px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[#1da851]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp Group
              </a>
              <a
                href={SITE.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-2.5 bg-brand px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark"
              >
                <ChannelIcon className="h-5 w-5" strokeWidth={2} />
                WhatsApp Channel
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-rule bg-card">
        <div className="mx-auto w-full max-w-[76rem] px-5 py-14 md:px-8 md:py-20">
          <div className="flex items-center gap-4">
            <h2 className="text-[clamp(1.6rem,5vw,2.5rem)] leading-tight text-ink">How it works</h2>
            <span className="h-px flex-1 bg-rule" />
          </div>
          <div className="mt-8 grid gap-px bg-rule md:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <div key={t} className="bg-card p-6 md:p-8">
                <span className="label tnum">Step {String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-[1.2rem] leading-snug text-ink">{t}</h3>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [ShieldCheck, "Admin-moderated", "Only verified alerts are posted; every claim is checked against the provider."],
              [Clock, "Twice daily", "Deadlines are re-checked morning and evening so nothing quietly expires."],
              [Megaphone, "Free to post", "Studying, interning or hiring? Submit an opportunity and we will publish it."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Check;
              return (
                <div key={t as string} className="border border-rule bg-paper p-5">
                  <I className="h-5 w-5 text-brand" strokeWidth={1.9} />
                  <p className="mt-3 text-[0.9375rem] font-semibold text-ink">{t as string}</p>
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">{d as string}</p>
                </div>
              );
            })}
          </div>

          {/* Every way to reach us */}
          <div className="mt-12 border border-rule bg-paper p-6 md:p-8">
            <span className="label">Connect</span>
            <h2 className="mt-3 text-[clamp(1.35rem,4vw,2rem)] leading-tight text-ink">
              Follow Edusphere Africa everywhere
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ConnectCard
                href={SITE.whatsappGroup}
                title="WhatsApp Group"
                body="Ask questions and discuss opportunities with thousands of students."
                icon={<WhatsAppIcon className="h-6 w-6" />}
                tone="whatsapp"
              />
              <ConnectCard
                href={SITE.whatsappChannel}
                title="WhatsApp Channel"
                body="Broadcast-only alerts — deadlines, scholarships and jobs, straight to your chats."
                icon={<ChannelIcon className="h-6 w-6" strokeWidth={1.9} />}
                tone="brand"
              />
              <ConnectCard
                href={SITE.x}
                title="X (Twitter)"
                body="Quick updates, reminders and breaking opportunity windows as they open."
                icon={<XIcon className="h-5 w-5" />}
                tone="ink"
              />
              <ConnectCard
                href={SITE.emailUrl}
                title="Email us"
                body={SITE.email}
                icon={<Mail className="h-6 w-6" strokeWidth={1.9} />}
                tone="outline"
              />
            </div>
          </div>
        </div>
      </section>

      <NewsletterBand />
      <TrustBand />
    </>
  );
}

function ConnectCard({
  href,
  title,
  body,
  icon,
  tone,
}: {
  href: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  tone: "whatsapp" | "brand" | "ink" | "outline";
}) {
  const external = href.startsWith("http");
  const styles = {
    whatsapp: "bg-[#25D366] text-white hover:bg-[#1da851] border-transparent",
    brand: "bg-brand text-paper hover:bg-brand-dark border-transparent",
    ink: "bg-ink text-paper hover:bg-black border-transparent",
    outline: "bg-paper text-ink border-rule-strong hover:border-ink",
  }[tone];

  const inner = (
    <>
      <span className={`grid h-11 w-11 place-items-center ${tone === "outline" ? "text-brand" : ""}`}>
        {icon}
      </span>
      <p className="mt-3 text-[1rem] font-bold">{title}</p>
      <p className={`mt-1.5 text-[0.8125rem] leading-relaxed ${tone === "outline" ? "text-muted" : "opacity-80"}`}>
        {body}
      </p>
    </>
  );

  const cls = `block h-full border p-5 transition-colors ${styles}`;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}
