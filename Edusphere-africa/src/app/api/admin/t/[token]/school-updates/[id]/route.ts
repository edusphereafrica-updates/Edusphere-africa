import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { schoolUpdates } from "@/db/schema";
import { verifySessionToken } from "@/lib/auth";
import { parseSchoolUpdatePayload, slugify } from "@/lib/school-update-payload";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Authorised by the session token in the URL path. Updates an existing school update in place. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ token: string; id: string }> },
) {
  const { token, id: rawId } = await ctx.params;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid update id" }, { status: 400 });

  const existing = await db
    .select({ id: schoolUpdates.id, slug: schoolUpdates.slug })
    .from(schoolUpdates)
    .where(eq(schoolUpdates.id, id))
    .limit(1);
  if (!existing.length) {
    return NextResponse.json({ error: "That update no longer exists" }, { status: 404 });
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

  let slug = existing[0].slug;
  const desired = slugify(`${f.school}-${f.title}`) || slug;
  if (desired !== slug) {
    let candidate = desired;
    let n = 2;
    for (;;) {
      const clash = await db
        .select({ id: schoolUpdates.id })
        .from(schoolUpdates)
        .where(and(eq(schoolUpdates.slug, candidate), ne(schoolUpdates.id, id)))
        .limit(1);
      if (!clash.length) break;
      candidate = `${desired}-${n++}`;
    }
    slug = candidate;
  }

  const [row] = await db
    .update(schoolUpdates)
    .set({
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
    })
    .where(eq(schoolUpdates.id, id))
    .returning({ slug: schoolUpdates.slug });

  return NextResponse.json({ ok: true, slug: row.slug });
}

/** Authorised by the session token in the URL path. Removes a school update permanently. */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ token: string; id: string }> },
) {
  const { token, id: rawId } = await ctx.params;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid update id" }, { status: 400 });

  const deleted = await db
    .delete(schoolUpdates)
    .where(eq(schoolUpdates.id, id))
    .returning({ id: schoolUpdates.id });
  if (!deleted.length) {
    return NextResponse.json({ error: "That update no longer exists" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
