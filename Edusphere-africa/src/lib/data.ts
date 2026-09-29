import { desc } from "drizzle-orm";
import { db } from "@/db";
import {
  jobs,
  opportunities,
  scholarships,
  schoolUpdates,
  type Job,
  type Opportunity,
  type Scholarship,
  type SchoolUpdate,
} from "@/db/schema";
import { getDatabaseUrl } from "@/lib/database-status";
import snapshot from "@/lib/fallback-listings.json";

export type { Job, Opportunity, Scholarship, SchoolUpdate };

// The snapshot comes from the existing editorial seed (scripts/export-fallback.mjs).
// It is read-only. Subscriber emails and admin changes are NEVER written here.
const examples = {
  scholarships: snapshot.scholarships as unknown as Scholarship[],
  schoolUpdates: snapshot.schoolUpdates as unknown as SchoolUpdate[],
  jobs: snapshot.jobs as unknown as Job[],
  opportunities: snapshot.opportunities as unknown as Opportunity[],
};

let loggedDatabaseFailure = false;
let retryDatabaseAfter = 0;

/**
 * Live listings win over matching example slugs. When a database is empty,
 * unavailable or not configured, the public site still renders fully and
 * links each example back to the provider's official website.
 */
async function listings<T extends { slug: string }>(
  read: () => Promise<T[]>,
  fallback: T[],
  order: (a: T, b: T) => number,
): Promise<T[]> {
  if (!getDatabaseUrl() || Date.now() < retryDatabaseAfter) return [...fallback].sort(order);
  try {
    const live = await read();
    retryDatabaseAfter = 0;
    const found = new Set(live.map((row) => row.slug));
    return [...live, ...fallback.filter((row) => !found.has(row.slug))].sort(order);
  } catch (error) {
    // After a connection failure, keep pages fast for fifteen seconds, then
    // retry automatically. The snapshot is always available in the meantime.
    retryDatabaseAfter = Date.now() + 15_000;
    if (!loggedDatabaseFailure) {
      loggedDatabaseFailure = true;
      const detail = error instanceof Error && error.cause instanceof Error
        ? error.cause.name
        : error instanceof Error ? error.name : "UnknownError";
      console.error(`[edusphere] PostgreSQL unavailable (${detail}); serving read-only public snapshot.`);
    }
    return [...fallback].sort(order);
  }
}

const newest = (a: { publishedAt: string }, b: { publishedAt: string }) =>
  b.publishedAt.localeCompare(a.publishedAt);
const closing = (a: { deadline: string }, b: { deadline: string }) =>
  a.deadline.localeCompare(b.deadline);

/* ------------------------------- Scholarships ------------------------------- */

export async function getScholarships(limit?: number): Promise<Scholarship[]> {
  const rows = await listings(
    () => db.select().from(scholarships).orderBy(desc(scholarships.publishedAt)),
    examples.scholarships,
    newest,
  );
  return typeof limit === "number" ? rows.slice(0, limit) : rows;
}

export async function getScholarship(slug: string): Promise<Scholarship | null> {
  return (await getScholarships()).find((s) => s.slug === slug) ?? null;
}

export async function getRelatedScholarships(slug: string, limit = 3): Promise<Scholarship[]> {
  return (await getScholarships()).filter((s) => s.slug !== slug).slice(0, limit);
}

/* ----------------------------- School updates ---------------------------- */

export async function getSchoolUpdates(limit?: number): Promise<SchoolUpdate[]> {
  const rows = await listings(
    () => db.select().from(schoolUpdates).orderBy(desc(schoolUpdates.publishedAt)),
    examples.schoolUpdates,
    newest,
  );
  return typeof limit === "number" ? rows.slice(0, limit) : rows;
}

export async function getSchoolUpdate(slug: string): Promise<SchoolUpdate | null> {
  return (await getSchoolUpdates()).find((u) => u.slug === slug) ?? null;
}

export async function getRelatedSchoolUpdates(slug: string, limit = 3): Promise<SchoolUpdate[]> {
  return (await getSchoolUpdates()).filter((u) => u.slug !== slug).slice(0, limit);
}

/* --------------------------------- Jobs ---------------------------------- */

export async function getJobs(limit?: number): Promise<Job[]> {
  const rows = await listings(
    () => db.select().from(jobs).orderBy(jobs.deadline),
    examples.jobs,
    closing,
  );
  return typeof limit === "number" ? rows.slice(0, limit) : rows;
}

export async function getJob(slug: string): Promise<Job | null> {
  return (await getJobs()).find((j) => j.slug === slug) ?? null;
}

export async function getRelatedJobs(slug: string, limit = 3): Promise<Job[]> {
  return (await getJobs()).filter((j) => j.slug !== slug).slice(0, limit);
}

/* ----------------------------- Opportunities ----------------------------- */

export async function getOpportunities(limit?: number): Promise<Opportunity[]> {
  const rows = await listings(
    () => db.select().from(opportunities).orderBy(opportunities.deadline),
    examples.opportunities,
    closing,
  );
  return typeof limit === "number" ? rows.slice(0, limit) : rows;
}

export async function getOpportunity(slug: string): Promise<Opportunity | null> {
  return (await getOpportunities()).find((o) => o.slug === slug) ?? null;
}

export async function getRelatedOpportunities(slug: string, limit = 3): Promise<Opportunity[]> {
  return (await getOpportunities()).filter((o) => o.slug !== slug).slice(0, limit);
}

/* ------------------------------ Closing soon ----------------------------- */

export type ClosingItem = {
  kind: "scholarship" | "job" | "opportunity";
  href: string;
  title: string;
  organisation: string;
  country: string;
  type: string;
  funding: string | null;
  deadline: string;
};

export function closingSoonFrom(
  s: Scholarship[],
  j: Job[],
  o: Opportunity[],
  limit = 6,
): ClosingItem[] {
  const today = new Date().toISOString().slice(0, 10);

  const items: ClosingItem[] = [
    ...s.map((x) => ({
      kind: "scholarship" as const,
      href: `/scholarships/${x.slug}`,
      title: x.title,
      organisation: x.provider,
      country: x.country,
      type: "Scholarship",
      funding: x.fundingType,
      deadline: x.deadline,
    })),
    ...j.map((x) => ({
      kind: "job" as const,
      href: `/jobs/${x.slug}`,
      title: x.title,
      organisation: x.company,
      country: x.location,
      type: x.employmentType,
      funding: x.salary,
      deadline: x.deadline,
    })),
    ...o.map((x) => ({
      kind: "opportunity" as const,
      href: `/opportunities/${x.slug}`,
      title: x.title,
      organisation: x.organization,
      country: x.region,
      type: x.oppType,
      funding: null,
      deadline: x.deadline,
    })),
  ]
    .filter((x) => x.deadline >= today)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  return items.slice(0, limit);
}

export async function getClosingSoon(limit = 6): Promise<ClosingItem[]> {
  const [s, j, o] = await Promise.all([getScholarships(), getJobs(), getOpportunities()]);
  return closingSoonFrom(s, j, o, limit);
}

/* --------------------------------- Search -------------------------------- */

export type SearchHit =
  | { kind: "scholarship"; href: string; title: string; meta: string; excerpt: string }
  | { kind: "school-update"; href: string; title: string; meta: string; excerpt: string }
  | { kind: "job"; href: string; title: string; meta: string; excerpt: string }
  | { kind: "opportunity"; href: string; title: string; meta: string; excerpt: string };

export async function searchAll(query: string): Promise<SearchHit[]> {
  const q = query.trim().slice(0, 160).toLocaleLowerCase();
  if (!q) return [];

  const [s, u, j, o] = await Promise.all([
    getScholarships(), getSchoolUpdates(), getJobs(), getOpportunities(),
  ]);
  const includes = (...parts: (string | null | undefined)[]) =>
    parts.some((part) => part?.toLocaleLowerCase().includes(q));

  return [
    ...s.filter((x) => includes(x.title, x.provider, x.country, x.studyLevel, x.fundingType, x.summary))
      .map((x) => ({
        kind: "scholarship" as const,
        href: `/scholarships/${x.slug}`,
        title: x.title,
        meta: `${x.provider} · ${x.country} · ${x.studyLevel}`,
        excerpt: x.summary,
      })),
    ...u.filter((x) => includes(x.title, x.school, x.category, x.summary))
      .map((x) => ({
        kind: "school-update" as const,
        href: `/school-updates/${x.slug}`,
        title: x.title,
        meta: `${x.school} · ${x.category} · ${x.session}`,
        excerpt: x.summary,
      })),
    ...j.filter((x) => includes(x.title, x.company, x.location, x.workMode, x.experience, x.summary))
      .map((x) => ({
        kind: "job" as const,
        href: `/jobs/${x.slug}`,
        title: x.title,
        meta: `${x.company} · ${x.location} · ${x.workMode}`,
        excerpt: x.summary,
      })),
    ...o.filter((x) => includes(x.title, x.organization, x.oppType, x.region, x.summary))
      .map((x) => ({
        kind: "opportunity" as const,
        href: `/opportunities/${x.slug}`,
        title: x.title,
        meta: `${x.organization} · ${x.oppType} · ${x.region}`,
        excerpt: x.summary,
      })),
  ];
}
