import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { schoolUpdates } from "@/db/schema";
import { verifySessionToken } from "@/lib/auth";
import { parseSchoolUpdatePayload, slugify } from "@/lib/school-update-payload";

export const dynamic = "force-dynamic";

/** Authorised by the session token in the URL path. Lists every school update, newest first. */
export async function GET(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const rows = await db.select().from(schoolUpdates).orderBy(desc(schoolUpdates.id));
  return NextResponse.json({ ok: true, schoolUpdates: rows });
}

/** Authorised by the session token in the URL path. Creates a new school update. */
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

  const parsed = parseSchoolUpdatePayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: `Please provide: ${parsed.errors.join(", ")}` }, { status: 400 });
  }
  const f = parsed.fields;

  const base = slugify(`${f.school}-${f.title}`) || `update-${Date.now()}`;
  let slug = base;
  let n = 2;
  for (;;) {
    const clash = await db
      .select({ id: schoolUpdates.id })
      .from(schoolUpdates)
      .where(eq(schoolUpdates.slug, slug))
      .limit(1);
    if (!clash.length) break;
    slug = `${base}-${n++}`;
  }

  const [row] = await db
    .insert(schoolUpdates)
    .values({
      slug,
      school: f.school,
      title: f.title,
      session: f.session,
      category: f.category,
      summary: f.summary,
      appliesTo: f.appliesTo,
      dates: f.dates,
      requirements: f.requirements,
      steps: f.steps,
      sourceName: f.sourceName,
      sourceUrl: f.sourceUrl,
      image: f.image,
      imageCredit: f.imageCredit,
      publishedAt: new Date().toISOString().slice(0, 10),
    })
    .returning({ slug: schoolUpdates.slug });

  return NextResponse.json({ ok: true, slug: row.slug });
}
