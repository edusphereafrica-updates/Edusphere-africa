"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

/* ------------------------------- Brand mark ------------------------------ */

/**
 * The official Edusphere Africa lockup (globe, mortarboard, orbital ring and
 * open book with the Edusphere Africa wordmark). Vector, so it stays crisp.
 */
export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/images/edusphere-logo.svg"
      alt="Edusphere Africa"
      className={className}
      width="486"
      height="172"
      draggable={false}
    />
  );
}

/** Square icon-only mark — favicons, tight headers, social contexts. */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/images/edusphere-mark.svg"
      alt=""
      className={className}
      width="160"
      height="160"
      draggable={false}
    />
  );
}

/** Text wordmark kept for contexts that only need the name (rarely used). */
export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-baseline gap-[0.3rem] leading-none">
      <span
        className="font-display text-[1.15rem] tracking-[-0.02em]"
        style={{ color: dark ? "#FAF8F3" : "#0A2457", fontWeight: 800 }}
      >
        Edusphere
      </span>
      <span
        className="label !text-[0.6rem] !tracking-[0.22em]"
        style={{ color: dark ? "rgba(250,248,243,.65)" : "#159447" }}
      >
        Africa
      </span>
    </span>
  );
}

/* ------------------------------- Primitives ------------------------------ */

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.transitionDelay = `${delay}ms`;
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

/**
 * The prospectus rail: tracked section label in a left column with a hairline
 * rule running down its edge; collapses to an inline label above a rule on mobile.
 */
export function Section({
  label,
  title,
  intro,
  action,
  children,
  id,
}: {
  label: string;
  title?: string;
  intro?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-[76rem] px-5 md:px-8">
      <div className="grid gap-y-5 lg:grid-cols-[8.5rem_minmax(0,1fr)] lg:gap-x-10">
        <div className="lg:sticky lg:top-24 lg:self-start lg:border-r lg:border-rule lg:pr-5 lg:pt-2">
          <div className="flex items-center justify-between gap-4 border-t border-rule pt-3 lg:block lg:border-t-0 lg:pt-0">
            <span className="label">{label}</span>
            <span className="hidden lg:mt-3 lg:block h-8 w-px bg-rule-strong" />
          </div>
        </div>
        <div className="min-w-0">
          {(title || intro || action) && (
            <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                {title && (
                  <h2 className="text-[clamp(1.6rem,5vw,2.5rem)] leading-[1.08] text-ink">{title}</h2>
                )}
                {intro && <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{intro}</p>}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </header>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

export function Field({ label, value, className = "" }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={`field ${className}`}>
      <span className="label">{label}</span>
      <span className="text-[0.9rem] font-500 leading-snug text-ink tnum break-words">{value}</span>
    </div>
  );
}

export function StatusStamp({ deadline, size = "md" }: { deadline: string; size?: "sm" | "md" }) {
  const today = new Date().toISOString().slice(0, 10);
  const closed = deadline < today;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  const soon = !closed && days <= 14;

  const text = closed
    ? "Closed"
    : days <= 0
      ? "Closes today"
      : days === 1
        ? "Closes in 1 day"
        : `Closes in ${days} days`;

  const color = closed ? "#59635A" : soon ? "#E4572E" : "#0B5B3B";
  return (
    <span
      className={`stamp ${size === "sm" ? "!text-[0.5625rem]" : ""}`}
      style={{ color, backgroundColor: closed ? "transparent" : soon ? "rgba(228,87,46,.08)" : "rgba(11,91,59,.07)" }}
    >
      {text}
    </span>
  );
}

export function TypeChip({ children, tone = "tint" }: { children: ReactNode; tone?: "tint" | "plain" | "ink" }) {
  const styles =
    tone === "tint"
      ? "bg-tint text-brand border-transparent"
      : tone === "ink"
        ? "bg-ink text-paper border-transparent"
        : "bg-transparent text-muted border-rule-strong";
  return (
    <span
      className={`inline-flex items-center border px-2 py-[0.3rem] text-[0.625rem] font-semibold uppercase tracking-[0.13em] ${styles}`}
    >
      {children}
    </span>
  );
}

export function Btn({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "whatsapp";
  external?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const base =
    "inline-flex min-h-[3rem] items-center justify-center gap-2 px-6 text-[0.9375rem] font-semibold tracking-[-0.01em] transition-all duration-200 rounded-[2px]";
  const styles = {
    primary: "bg-brand text-paper hover:bg-brand-dark shadow-[0_10px_24px_-18px_rgba(11,91,59,.9)]",
    outline: "border border-rule-strong text-ink bg-card hover:border-ink",
    ghost: "text-ink hover:bg-tint",
    whatsapp: "bg-[#0B5B3B] text-paper hover:bg-brand-dark ring-1 ring-inset ring-[#25D366]/60",
  }[variant];

  const content = (
    <>
      {children}
      {external && <ExternalGlyph />}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${styles} ${className}`} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={`${base} ${styles} ${className}`} onClick={onClick}>
      {content}
    </Link>
  );
}

function ExternalGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M15 3h6v6M10 14 21 3M18 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h7" />
    </svg>
  );
}

export function SourceNote({ name, url }: { name: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-2.5 border-l-2 border-brand bg-tint/60 px-4 py-3 text-[0.8125rem] leading-relaxed text-brand-dark transition-colors hover:bg-tint"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
        <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
      </svg>
      <span>
        <span className="label !text-[0.625rem] !text-brand/70">Official source</span>
        <span className="mt-0.5 block font-medium underline decoration-brand/30 underline-offset-2 group-hover:decoration-brand">
          {name} — open original notice
        </span>
      </span>
    </a>
  );
}

export function Bullets({ items, start = 1 }: { items: string[]; start?: number }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3.5 text-[0.9375rem] leading-relaxed text-ink/90">
          <span className="mt-[0.15rem] shrink-0 text-[0.6875rem] font-bold tabular-nums text-brand tnum">
            {String(start + i).padStart(2, "0")}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PageHero({
  label,
  title,
  intro,
  meta,
}: {
  label: string;
  title: string;
  intro: string;
  meta?: ReactNode;
}) {
  return (
    <header className="border-b border-rule bg-card">
      <div className="mx-auto w-full max-w-[76rem] px-5 pt-10 pb-8 md:px-8 md:pt-14 md:pb-10">
        <div className="flex items-center gap-3">
          <span className="label">{label}</span>
          <span className="h-px flex-1 bg-rule" />
        </div>
        <h1 className="mt-5 max-w-4xl text-[clamp(2rem,7vw,3.5rem)] leading-[1.03] text-ink">{title}</h1>
        <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-muted md:text-[1.0625rem]">{intro}</p>
        {meta && <div className="mt-7">{meta}</div>}
      </div>
    </header>
  );
}
