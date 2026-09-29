import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Legal" };

const DOCS: Record<string, { title: string; intro: string; sections: [string, string][] }> = {
  privacy: {
    title: "Privacy Policy",
    intro: "How Edusphere Africa collects, uses and protects the information you share with us.",
    sections: [
      [
        "What we collect",
        "We collect your email address when you subscribe to the weekly digest, and any details you voluntarily send through the contact form. We do not collect payment information — Edusphere Africa never processes applications or payments on behalf of providers.",
      ],
      [
        "How we use it",
        "Subscribed email addresses are used only to send the weekly opportunity digest and occasional service notices. Contact form messages are read by our editorial team to answer your query, verify an opportunity or correct published content.",
      ],
      [
        "Sharing",
        "We never sell or rent your details. We do not share your email with scholarship providers, employers or advertisers. Links to third-party sites are provided for your convenience; their privacy practices are their own.",
      ],
      [
        "Your choices",
        "You can unsubscribe from the digest at any time using the link in every email, or write to edusphereafrica48@gmail.com to have your record deleted from our database.",
      ],
      [
        "Cookies",
        "The site uses only the storage required to remember basic interface preferences. We do not run third-party advertising trackers.",
      ],
    ],
  },
  terms: {
    title: "Terms of Use",
    intro: "The rules that govern your use of Edusphere Africa and how far our listings can be relied upon.",
    sections: [
      [
        "What this site is",
        "Edusphere Africa is an opportunity discovery platform. We aggregate, summarise and link to scholarships, school updates, jobs, fellowships, grants, competitions, training programmes and study-abroad offers published by third parties.",
      ],
      [
        "No application is made here",
        "We never accept, process or assess applications. Every listing links to the official application page of the original provider, and that provider's terms and decisions are final.",
      ],
      [
        "Accuracy of listings",
        "We check every listing against the provider's own notice and display the deadline, eligibility and funding level as stated by them. Deadlines change without notice. Always confirm the final details on the official source before you apply or travel.",
      ],
      [
        "Fees and fraud",
        "Edusphere Africa never charges a fee for listing, applying or joining the community. If someone asks you for money in our name, report it through the contact page immediately.",
      ],
      [
        "Acceptable use",
        "You may not scrape, republish in bulk, or misrepresent our listings as your own. Quoting a summary with a link back to both Edusphere Africa and the original source is welcome.",
      ],
      [
        "Contact",
        "Questions about these terms can be sent to edusphereafrica48@gmail.com.",
      ],
    ],
  },
};

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();

  return (
    <>
      <PageHero label="Legal" title={doc.title} intro={doc.intro} />
      <section className="mx-auto w-full max-w-[76rem] px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
          <div className="space-y-10">
            {doc.sections.map(([t, d], i) => (
              <section key={t}>
                <div className="flex items-center gap-4">
                  <span className="label tnum">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="text-[clamp(1.3rem,4vw,1.75rem)] leading-tight text-ink">{t}</h2>
                  <span className="h-px flex-1 bg-rule" />
                </div>
                <p className="mt-4 max-w-3xl text-[0.975rem] leading-relaxed text-muted">{d}</p>
              </section>
            ))}
          </div>
          <aside className="border border-rule bg-card p-5 lg:sticky lg:top-24 lg:self-start">
            <span className="label">Related</span>
            <ul className="mt-3 space-y-2 text-[0.875rem]">
              <li>
                <Link href="/legal/privacy" className="text-brand hover:underline">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-brand hover:underline">Terms of Use</Link>
              </li>
              <li>
                <Link href="/contact" className="text-brand hover:underline">Contact us</Link>
              </li>
            </ul>
            <p className="mt-4 border-t border-rule pt-4 text-[0.75rem] leading-relaxed text-muted">
              Last updated 22 September 2026.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
