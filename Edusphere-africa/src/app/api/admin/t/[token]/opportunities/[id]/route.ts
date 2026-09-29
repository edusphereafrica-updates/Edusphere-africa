import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { verifySessionToken } from "@/lib/auth";
import { parseOpportunityPayload, slugify } from "@/lib/opportunity-payload";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Authorised by the session token in the URL path. Updates an existing opportunity in place. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ token: string; id: string }> },
) {
  const { token, id: rawId } = await ctx.params;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid opportunity id" }, { status: 400 });

  const existing = await db
    .select({ id: opportunities.id, slug: opportunities.slug })
    .from(opportunities)
    .where(eq(opportunities.id, id))
    .limit(1);
  if (!existing.length) {
    return NextResponse.json({ error: "That opportunity no longer exists" }, { status: 404 });
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

  // Keep the existing slug unless the title changed enough to need a new one,
  // and never collide with another row's slug.
  let slug = existing[0].slug;
  const desired = slugify(f.title) || slug;
  if (desired !== slug) {
    let candidate = desired;
    let n = 2;
    for (;;) {
      const clash = await db
        .select({ id: opportunities.id })
        .from(opportunities)
        .where(and(eq(opportunities.slug, candidate), ne(opportunities.id, id)))
        .limit(1);
      if (!clash.length) break;
      candidate = `${desired}-${n++}`;
    }
    slug = candidate;
  }

  const [row] = await db
    .update(opportunities)
    .set({
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
    })
    .where(eq(opportunities.id, id))
    .returning({ slug: opportunities.slug });

  return NextResponse.json({ ok: true, slug: row.slug });
}

/** Authorised by the session token in the URL path. Removes an opportunity permanently. */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ token: string; id: string }> },
) {
  const { token, id: rawId } = await ctx.params;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid opportunity id" }, { status: 400 });

  const deleted = await db
    .delete(opportunities)
    .where(eq(opportunities.id, id))
    .returning({ id: opportunities.id });
  if (!deleted.length) {
    return NextResponse.json({ error: "That opportunity no longer exists" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
