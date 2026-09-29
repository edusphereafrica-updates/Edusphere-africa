import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { scholarships } from "@/db/schema";
import { verifySessionToken } from "@/lib/auth";
import { parseScholarshipPayload, slugify } from "@/lib/scholarship-payload";

export const dynamic = "force-dynamic";

/** Authorised by the session token in the URL path. Lists every scholarship, newest first. */
export async function GET(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const rows = await db.select().from(scholarships).orderBy(desc(scholarships.id));
  return NextResponse.json({ ok: true, scholarships: rows });
}

/** Authorised by the session token in the URL path. Creates a new scholarship. */
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = parseScholarshipPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: `Please provide: ${parsed.errors.join(", ")}` }, { status: 400 });
  }
  const f = parsed.fields;

  const base = slugify(f.title) || `scholarship-${Date.now()}`;
  let slug = base;
  let n = 2;
  for (;;) {
    const clash = await db
      .select({ id: scholarships.id })
      .from(scholarships)
      .where(eq(scholarships.slug, slug))
      .limit(1);
    if (!clash.length) break;
    slug = `${base}-${n++}`;
  }

  const [row] = await db
    .insert(scholarships)
    .values({
      slug,
      title: f.title,
      summary: f.summary,
      provider: f.provider,
      country: f.country,
      studyLevel: f.studyLevel,
      fundingType: f.fundingType,
      applicants: f.applicants,
      deadline: f.deadline,
      benefits: f.benefits,
      requirements: f.requirements,
      documents: f.documents,
      howToApply: f.howToApply,
      applyUrl: f.applyUrl,
      sourceName: f.sourceName,
      sourceUrl: f.sourceUrl,
      image: f.image,
      imageCredit: f.imageCredit,
      featured: f.featured,
      publishedAt: new Date().toISOString().slice(0, 10),
    })
    .returning({ slug: scholarships.slug });

  return NextResponse.json({ ok: true, slug: row.slug });
}
