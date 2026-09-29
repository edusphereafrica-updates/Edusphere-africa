import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHero, Reveal } from "@/components/ui";
import { ContactForm } from "@/components/forms";
import { CommunityBand } from "@/components/bands";
import { WhatsAppIcon, XIcon, ChannelIcon } from "@/components/brand-icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Submit an opportunity, advertise with Edusphere Africa, or send us a correction.",
};

const ROUTES = [
  ["Submit an Opportunity", "Running a scholarship, admission window, job or programme? Send it over and we will verify and publish it."],
  ["Advertise with us", "Reach students and young professionals across Africa with a placement in the digest or on the site."],
  ["Report a correction", "Spotted something wrong or an expired deadline? Tell us and we will fix it the same day."],
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        title="Tell us what we should publish next."
        intro="Opportunities, partnerships, advertising or corrections — a real person reads every message and replies within two working days."
        meta={
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <a
              href={SITE.emailUrl}
              className="inline-flex items-center gap-2 text-[0.875rem] text-muted transition-colors hover:text-brand"
            >
              <Mail className="h-4 w-4 text-brand" /> {SITE.email}
            </a>
            <a
              href={SITE.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[0.875rem] text-muted transition-colors hover:text-brand"
            >
              <WhatsAppIcon className="h-4 w-4 text-brand" /> WhatsApp group support
            </a>
          </div>
        }
      />

      <section className="mx-auto w-full max-w-[76rem] px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <Reveal>
            <div className="border border-rule bg-card p-6 md:p-8">
              <span className="label">Send a message</span>
              <h2 className="mt-3 text-[clamp(1.4rem,4vw,2rem)] leading-tight text-ink">
                We read everything.
              </h2>
              <div className="mt-7">
                <ContactForm />
              </div>
              <p className="mt-4 text-[0.75rem] leading-relaxed text-muted">
                Prefer email? Write to us directly at{" "}
                <a href={SITE.emailUrl} className="text-brand underline underline-offset-2">
                  {SITE.email}
                </a>
                .
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid gap-4">
              {ROUTES.map(([t, d]) => (
                <div key={t} className="border border-rule bg-paper p-5">
                  <h3 className="text-[1.1rem] leading-snug text-ink">{t}</h3>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">{d}</p>
                </div>
              ))}

              <div className="grid gap-3">
                <a
                  href={SITE.whatsappGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[3.25rem] items-center justify-center gap-2.5 bg-[#25D366] px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[#1da851]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Join the WhatsApp Group
                </a>
                <a
                  href={SITE.whatsappChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[3.25rem] items-center justify-center gap-2.5 bg-brand px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-brand-dark"
                >
                  <ChannelIcon className="h-5 w-5" strokeWidth={2} />
                  Follow the WhatsApp Channel
                </a>
                <a
                  href={SITE.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[3.25rem] items-center justify-center gap-2.5 bg-ink px-6 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-black"
                >
                  <XIcon className="h-4 w-4" />
                  Follow @Edusphereupdate on X
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CommunityBand />
    </>
  );
}
