"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle, ShieldCheck, ArrowRight, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui";
import { FloatingWA } from "@/components/bands";
import { WhatsAppIcon, XIcon, ChannelIcon } from "@/components/brand-icons";
import { SITE } from "@/lib/site";

export const WA_LINK = SITE.whatsappGroup;

/**
 * Wraps the site chrome (header, footer, floating CTA) but hides it inside the
 * admin desk, which renders its own layout.
 */
export function SiteChrome({
  children,
  demoMode = false,
}: {
  children: React.ReactNode;
  demoMode?: boolean;
}) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      <Header />
      {demoMode && (
        <div className="border-b border-brand/15 bg-tint px-5 py-2.5 text-center text-[0.8125rem] leading-relaxed text-brand-dark md:px-8">
          <strong>Example listings:</strong> a hosted database is not yet connected. Confirm every
          deadline on the official source. Newsletter signups and admin publishing require PostgreSQL.{" "}
          <Link href="/setup" className="font-semibold underline underline-offset-2 hover:text-brand">
            Check setup →
          </Link>
        </div>
      )}
      <main id="main">{children}</main>
      <FloatingWA />
      <Footer />
    </>
  );
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/school-updates", label: "School Updates" },
  { href: "/jobs", label: "Jobs & Internships" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/92 backdrop-blur-md">
      {/*
        Plain checkbox + <label for>: the browser opens/closes the menu on
        its own the instant it's tapped, with no dependency on JavaScript
        having loaded yet (see the matching rules in globals.css). React
        keeps it in sync (checked={open}) so route changes and the escape
        key still close it once hydrated.
      */}
      <input
        type="checkbox"
        id="mobile-nav-toggle"
        className="sr-only"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
        aria-label={open ? "Close menu" : "Open menu"}
      />
      <div className="mx-auto flex h-16 w-full max-w-[76rem] items-center justify-between gap-4 px-5 md:h-[4.5rem] md:px-8">
        <Link href="/" className="flex items-center" aria-label="Edusphere Africa home">
          <Logo className="h-9 w-auto md:h-11" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-[0.8125rem] font-medium transition-colors ${
                  active ? "text-brand" : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
                {active && <span className="absolute inset-x-3 -bottom-[1.05rem] h-[2px] bg-brand" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/community"
            className="hidden h-11 items-center gap-2 bg-brand px-5 text-[0.8125rem] font-semibold text-paper transition-colors hover:bg-brand-dark sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
            Join Community
          </Link>
          <label
            htmlFor="mobile-nav-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 cursor-pointer place-items-center border border-rule-strong text-ink lg:hidden"
          >
            <Menu className="menu-open-icon h-5 w-5" />
            <X className="menu-close-icon hidden h-5 w-5" />
          </label>
        </div>
      </div>

      <div className="mobile-nav-panel hidden border-t border-rule bg-paper lg:hidden">
        <nav className="px-5 py-4" aria-label="Mobile">
          {NAV.map((item, i) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-baseline justify-between border-b border-rule py-4"
              >
                <span
                  className={`font-display text-[1.35rem] ${active ? "text-brand" : "text-ink"}`}
                  style={{ fontWeight: 600 }}
                >
                  {item.label}
                </span>
                <span className="label tnum">{String(i + 1).padStart(2, "0")}</span>
              </Link>
            );
          })}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex min-h-[3.5rem] items-center justify-center gap-2 bg-brand px-5 text-[1rem] font-semibold text-paper"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={2.2} />
            Join Community
          </a>
          <p className="py-6 text-center text-[0.8125rem] text-muted">
            Scholarships · School updates · Jobs · Study abroad
          </p>
        </nav>
      </div>
    </header>
  );
}

const FOOTER = [
  {
    title: "Discover",
    links: [
      ["Scholarships", "/scholarships"],
      ["School Updates", "/school-updates"],
      ["Jobs", "/jobs"],
      ["Internships", "/jobs?category=internship"],
      ["Fellowships", "/opportunities?type=Fellowship"],
      ["Study Abroad", "/scholarships?funding=Fully%20Funded"],
    ],
  },
  {
    title: "Scholarships",
    links: [
      ["Undergraduate", "/scholarships?level=Undergraduate"],
      ["Master's", "/scholarships?level=Master%27s"],
      ["PhD", "/scholarships?level=PhD"],
      ["Fully Funded", "/scholarships?funding=Fully%20Funded"],
      ["Closing Soon", "/scholarships?sort=closing"],
    ],
  },
  {
    title: "Community",
    links: [
      ["WhatsApp Community", "/community"],
      ["Newsletter", "/community#newsletter"],
      ["Submit an Opportunity", "/contact?type=submit"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Advertise", "/contact?type=advertise"],
      ["Privacy Policy", "/legal/privacy"],
      ["Terms", "/legal/terms"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-brand-dark text-paper">
      <div className="mx-auto w-full max-w-[76rem] px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          <div>
            <Logo className="h-12 w-auto rounded-[2px] bg-paper px-2 py-1" />
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-paper/70">
              A trusted education, career and opportunity discovery ecosystem for African students,
              graduates and young professionals.
            </p>

            <div className="mt-6">
              <a
                href={SITE.emailUrl}
                className="inline-flex min-h-11 items-center gap-2.5 text-[0.875rem] text-paper/85 transition-colors hover:text-accent"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                {SITE.email}
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <SocialLink href={SITE.whatsappGroup} label="Join our WhatsApp group">
                <WhatsAppIcon className="h-[18px] w-[18px]" />
              </SocialLink>
              <SocialLink href={SITE.whatsappChannel} label="Follow our WhatsApp channel">
                <ChannelIcon className="h-[18px] w-[18px]" />
              </SocialLink>
              <SocialLink href={SITE.x} label="Follow Edusphere Africa on X">
                <XIcon className="h-4 w-4" />
              </SocialLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {FOOTER.map((col) => (
              <div key={col.title}>
                <h3 className="label !text-paper/50">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[0.875rem] text-paper/80 transition-colors hover:text-accent"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[0.8125rem] text-paper/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Edusphere Africa. All rights reserved.</p>
          <p>
            Opportunities link back to their original providers. Always confirm details on the
            official source.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:gap-5">
          <Link
            href="/admin/login"
            prefetch={false}
            aria-label="Admin Desk — administrator login"
            className="inline-flex min-h-[3rem] shrink-0 items-center justify-center gap-2.5 rounded-[2px] bg-paper px-5 text-[0.9375rem] font-semibold text-brand-dark transition-colors hover:bg-tint focus-visible:outline-paper"
          >
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            Admin Desk
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="max-w-sm text-[0.8125rem] leading-relaxed text-paper/70">
            Administrator login · Manage subscribers and publish opportunities.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center border border-white/20 text-paper/80 transition-colors hover:border-accent hover:bg-accent hover:text-paper"
    >
      {children}
    </a>
  );
}
