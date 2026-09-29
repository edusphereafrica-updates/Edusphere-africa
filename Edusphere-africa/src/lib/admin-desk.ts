import { desc } from "drizzle-orm";
import { db } from "@/db";
import { opportunities, scholarships, schoolUpdates, subscribers, submissions } from "@/db/schema";
import { verifySessionToken } from "@/lib/auth";
import type { Opportunity, Scholarship, SchoolUpdate } from "@/db/schema";

export type DeskData = {
  username: string;
  subscribers: { id: number; email: string; createdAt: string }[];
  submissions: {
    id: number;
    name: string;
    email: string;
    type: string;
    message: string;
    createdAt: string;
  }[];
  opportunities: Opportunity[];
  scholarships: Scholarship[];
  schoolUpdates: SchoolUpdate[];
  oppCount: number;
};

/**
 * Server-side loader for the admin desk. Authorisation happens here, next to
 * the data, so no privileged content is ever sent to an unauthenticated client.
 */
export async function loadDeskData(token: string | undefined): Promise<DeskData | null> {
  const session = await verifySessionToken(token);
  if (!session) return null;

  const [subs, msgs, oppRows, scholarshipRows, schoolUpdateRows] = await Promise.all([
    db.select().from(subscribers).orderBy(desc(subscribers.id)),
    db.select().from(submissions).orderBy(desc(submissions.id)),
    db.select().from(opportunities).orderBy(desc(opportunities.id)),
    db.select().from(scholarships).orderBy(desc(scholarships.id)),
    db.select().from(schoolUpdates).orderBy(desc(schoolUpdates.id)),
  ]);

  return {
    username: session.username,
    oppCount: oppRows.length,
    opportunities: oppRows,
    scholarships: scholarshipRows,
    schoolUpdates: schoolUpdateRows,
    subscribers: subs.map((s) => ({ id: s.id, email: s.email, createdAt: s.createdAt })),
    submissions: msgs.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      type: m.type,
      message: m.message,
      createdAt: m.createdAt,
    })),
  };
}
