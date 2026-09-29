import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { verifySessionToken } from "@/lib/auth";
import { parseOpportunityPayload, slugify } from "@/lib/opportunity-payload";

export const dynamic = "force-dynamic";

/** Authorised by the session token in the URL path. Lists every opportunity, newest first. */
export async function GET(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const rows = await db.select().from(opportunities).orderBy(desc(opportunities.id));
  return NextResponse.json({ ok: true, opportunities: rows });
}

/** Authorised by the session token in the URL path. Creates a new opportunity. */
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

  const parsed = parseOpportunityPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: `Please provide: ${parsed.errors.join(", ")}` }, { status: 400 });
  }
  const f = parsed.fields;

  const base = slugify(f.title) || `opportunity-${Date.now()}`;
  let slug = base;
  let n = 2;
  for (;;) {
    const clash = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(eq(opportunities.slug, slug))
      .limit(1);
    if (!clash.length) break;
    slug = `${base}-${n++}`;
  }

  const [row] = await db
    .insert(opportunities)
    .values({
      slug,
      title: f.title,
      organization: f.organization,
      oppType: f.oppType,
      region: f.region,
      summary: f.summary,
      eligibility: f.eligibility,
      benefits: f.benefits,
      deadline: f.deadline,
      process: f.process,
      applyUrl: f.applyUrl,
      sourceName: f.sourceName,
      sourceUrl: f.sourceUrl,
      image: f.image,
      imageCredit: f.imageCredit,
      publishedAt: new Date().toISOString().slice(0, 10),
    })
    .returning({ slug: opportunities.slug });

  return NextResponse.json({ ok: true, slug: row.slug });
}
