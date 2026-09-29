import Link from "next/link";
import { ArrowRight, MapPin, Building2, Calendar } from "lucide-react";
import { Field, StatusStamp, TypeChip } from "@/components/ui";
import type { Job, Opportunity, Scholarship, SchoolUpdate } from "@/db/schema";

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const fmtShort = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

function Thumb({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-tint ${className}`}>
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-brand/15 mix-blend-multiply" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
}

/* ----------------------------- Scholarship card --------------------------- */

export function ScholarshipCard({ s }: { s: Scholarship }) {
  return (
    <article className="card group flex h-full flex-col">
      <Link href={`/scholarships/${s.slug}`} className="block">
        <Thumb src={s.image} alt={s.provider} className="aspect-[16/10]" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <TypeChip>Scholarship</TypeChip>
          <TypeChip tone="plain">{s.fundingType}</TypeChip>
        </div>
        <h3 className="mt-3.5 text-[1.15rem] leading-[1.25] text-ink">
          <Link href={`/scholarships/${s.slug}`} className="transition-colors hover:text-brand">
            {s.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[0.875rem] leading-relaxed text-muted">{s.summary}</p>

        <div className="mt-auto grid grid-cols-2 gap-x-5 pt-5">
          <Field label="Country" value={s.country} />
          <Field label="Study level" value={s.studyLevel} />
        </div>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-rule pt-4">
          <div className="min-w-0">
            <span className="label">Deadline</span>
            <p className="mt-1 text-[0.875rem] font-semibold text-ink tnum">{fmt(s.deadline)}</p>
          </div>
          <StatusStamp deadline={s.deadline} size="sm" />
        </div>
        <Link
          href={`/scholarships/${s.slug}`}
          className="mt-4 inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand transition-all hover:gap-3"
        >
          View Scholarship <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

/* ------------------------------ School update row ------------------------- */

export function UpdateRow({ u, index }: { u: SchoolUpdate; index: number }) {
  return (
    <article className="card group grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 p-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-6 sm:items-center">
      <span className="label tnum hidden self-start pt-1 sm:block">{String(index + 1).padStart(2, "0")}</span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.11em] text-brand">
            <Building2 className="h-3.5 w-3.5" strokeWidth={2.2} />
            {u.school}
          </span>
          <TypeChip tone="plain">{u.category}</TypeChip>
        </div>
        <h3 className="mt-2 text-[1.05rem] leading-snug text-ink">
          <Link href={`/school-updates/${u.slug}`} className="transition-colors hover:text-brand">
            {u.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[0.875rem] leading-relaxed text-muted">{u.summary}</p>
        <p className="mt-2.5 flex items-center gap-1.5 text-[0.75rem] text-muted tnum">
          <Calendar className="h-3.5 w-3.5" /> {fmt(u.publishedAt)} · {u.session}
        </p>
      </div>
      <Link
        href={`/school-updates/${u.slug}`}
        className="col-span-2 mt-4 inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand transition-all hover:gap-3 sm:col-span-1 sm:mt-0 sm:flex-col sm:gap-1.5"
      >
        Read Update <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

/* -------------------------------- Job card -------------------------------- */

export function JobCard({ j }: { j: Job }) {
  const initials = j.company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <article className="card group flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center bg-tint text-[0.8125rem] font-bold uppercase tracking-wide text-brand">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[0.8125rem] font-semibold text-muted">{j.company}</p>
            <p className="truncate text-[0.75rem] text-muted/80 tnum">{j.employmentType}</p>
          </div>
        </div>
        <TypeChip>{j.workMode}</TypeChip>
      </div>

      <h3 className="mt-4 text-[1.15rem] leading-[1.25] text-ink">
        <Link href={`/jobs/${j.slug}`} className="transition-colors hover:text-brand">
          {j.title}
        </Link>
      </h3>
      <p className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-muted">
        <MapPin className="h-3.5 w-3.5 shrink-0" /> {j.location}
      </p>

      <div className="mt-auto grid grid-cols-2 gap-x-5 pt-5">
        <Field label="Experience" value={j.experience} />
        <Field label="Deadline" value={<span>{fmt(j.deadline)}</span>} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-rule pt-4">
        <StatusStamp deadline={j.deadline} size="sm" />
        <Link
          href={`/jobs/${j.slug}`}
          className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand transition-all hover:gap-3"
        >
          View Job <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

/* ---------------------------- Opportunity card ---------------------------- */

export function OpportunityCard({ o }: { o: Opportunity }) {
  return (
    <article className="card group flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <TypeChip tone="ink">{o.oppType}</TypeChip>
        <span className="text-[0.75rem] text-muted">{o.region}</span>
      </div>
      <h3 className="mt-3.5 text-[1.15rem] leading-[1.25] text-ink">
        <Link href={`/opportunities/${o.slug}`} className="transition-colors hover:text-brand">
          {o.title}
        </Link>
      </h3>
      <p className="mt-1.5 text-[0.8125rem] font-medium text-brand">{o.organization}</p>
      <p className="mt-2 line-clamp-3 text-[0.875rem] leading-relaxed text-muted">{o.summary}</p>

      <div className="mt-auto grid grid-cols-2 gap-x-5 pt-5">
        <Field label="Region" value={o.region} />
        <Field label="Deadline" value={<span>{fmt(o.deadline)}</span>} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-rule pt-4">
        <StatusStamp deadline={o.deadline} size="sm" />
        <Link
          href={`/opportunities/${o.slug}`}
          className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand transition-all hover:gap-3"
        >
          View Opportunity <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

/* --------------------------- Closing-soon ledger -------------------------- */

export type ClosingItem = {
  href: string;
  title: string;
  organisation: string;
  country: string;
  type: string;
  funding: string | null;
  deadline: string;
};

export function ClosingRow({ item, index }: { item: ClosingItem; index: number }) {
  return (
    <article className="card group grid grid-cols-1 gap-y-4 p-5 md:grid-cols-[2.5rem_minmax(0,1fr)_8.5rem_14rem] md:items-center md:gap-x-5">
      <span className="label tnum hidden md:block">{String(index + 1).padStart(2, "0")}</span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <TypeChip tone="plain">{item.type}</TypeChip>
          <StatusStamp deadline={item.deadline} size="sm" />
        </div>
        <h3 className="mt-2.5 text-[1.1rem] leading-snug text-ink">
          <Link href={item.href} className="transition-colors hover:text-brand">
            {item.title}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> {item.organisation}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {item.country}
          </span>
        </p>
      </div>

      <div className="hidden md:block">
        <span className="label">Closes</span>
        <p className="mt-1 text-[0.9375rem] font-semibold text-accent tnum">{fmt(item.deadline)}</p>
        <p className="text-[0.75rem] text-muted tnum">{fmtShort(item.deadline)} · 23:59 WAT</p>
      </div>

      <div className="flex items-center justify-between gap-4 md:justify-end">
        <span className="label md:hidden">Closes {fmt(item.deadline)}</span>
        <Link
          href={item.href}
          className="inline-flex min-h-[2.75rem] items-center gap-2 border border-rule-strong px-4 text-[0.8125rem] font-semibold text-ink transition-all hover:border-brand hover:bg-brand hover:text-paper"
        >
          View Opportunity <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
