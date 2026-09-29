import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { scholarships } from "@/db/schema";
import { verifySessionToken } from "@/lib/auth";
import { parseScholarshipPayload, slugify } from "@/lib/scholarship-payload";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Authorised by the session token in the URL path. Updates an existing scholarship in place. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ token: string; id: string }> },
) {
  const { token, id: rawId } = await ctx.params;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid scholarship id" }, { status: 400 });

  const existing = await db
    .select({ id: scholarships.id, slug: scholarships.slug })
    .from(scholarships)
    .where(eq(scholarships.id, id))
    .limit(1);
  if (!existing.length) {
    return NextResponse.json({ error: "That scholarship no longer exists" }, { status: 404 });
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

  let slug = existing[0].slug;
  const desired = slugify(f.title) || slug;
  if (desired !== slug) {
    let candidate = desired;
    let n = 2;
    for (;;) {
      const clash = await db
        .select({ id: scholarships.id })
        .from(scholarships)
        .where(and(eq(scholarships.slug, candidate), ne(scholarships.id, id)))
        .limit(1);
      if (!clash.length) break;
      candidate = `${desired}-${n++}`;
    }
    slug = candidate;
  }

  const [row] = await db
    .update(scholarships)
    .set({
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
    })
    .where(eq(scholarships.id, id))
    .returning({ slug: scholarships.slug });

  return NextResponse.json({ ok: true, slug: row.slug });
}

/** Authorised by the session token in the URL path. Removes a scholarship permanently. */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ token: string; id: string }> },
) {
  const { token, id: rawId } = await ctx.params;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid scholarship id" }, { status: 400 });

  const deleted = await db
    .delete(scholarships)
    .where(eq(scholarships.id, id))
    .returning({ id: scholarships.id });
  if (!deleted.length) {
    return NextResponse.json({ error: "That scholarship no longer exists" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
