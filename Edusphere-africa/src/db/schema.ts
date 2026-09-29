import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const scholarships = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  provider: text("provider").notNull(),
  country: text("country").notNull(),
  studyLevel: text("study_level").notNull(),
  fundingType: text("funding_type").notNull(),
  applicants: text("applicants").notNull(),
  deadline: text("deadline").notNull(),
  benefits: jsonb("benefits").$type<string[]>().notNull(),
  requirements: jsonb("requirements").$type<string[]>().notNull(),
  documents: jsonb("documents").$type<string[]>().notNull(),
  howToApply: jsonb("how_to_apply").$type<string[]>().notNull(),
  applyUrl: text("apply_url").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  image: text("image").notNull(),
  imageCredit: text("image_credit").notNull(),
  featured: boolean("featured").notNull().default(false),
  publishedAt: text("published_at").notNull(),
});

export const schoolUpdates = pgTable("school_updates", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  school: text("school").notNull(),
  title: text("title").notNull(),
  session: text("session").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  appliesTo: text("applies_to").notNull(),
  dates: jsonb("dates").$type<{ label: string; value: string }[]>().notNull(),
  requirements: jsonb("requirements").$type<string[]>().notNull(),
  steps: jsonb("steps").$type<string[]>().notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  image: text("image").notNull(),
  imageCredit: text("image_credit").notNull(),
  publishedAt: text("published_at").notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  company: text("company").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  workMode: text("work_mode").notNull(),
  employmentType: text("employment_type").notNull(),
  experience: text("experience").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  responsibilities: jsonb("responsibilities").$type<string[]>().notNull(),
  requirements: jsonb("requirements").$type<string[]>().notNull(),
  salary: text("salary"),
  deadline: text("deadline").notNull(),
  applyUrl: text("apply_url").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  image: text("image").notNull(),
  imageCredit: text("image_credit").notNull(),
  publishedAt: text("published_at").notNull(),
});

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  oppType: text("opp_type").notNull(),
  region: text("region").notNull(),
  summary: text("summary").notNull(),
  eligibility: jsonb("eligibility").$type<string[]>().notNull(),
  benefits: jsonb("benefits").$type<string[]>().notNull(),
  deadline: text("deadline").notNull(),
  process: jsonb("process").$type<string[]>().notNull(),
  applyUrl: text("apply_url").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  image: text("image").notNull(),
  imageCredit: text("image_credit").notNull(),
  publishedAt: text("published_at").notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  // Stored as scrypt: "<saltHex>:<hashHex>"
  passwordHash: text("password_hash").notNull(),
  // Optional recovery to gate self-service reset without an email service
  recoveryQuestion: text("recovery_question").notNull(),
  recoveryAnswerHash: text("recovery_answer_hash").notNull(),
  // One-time reset token + expiry (epoch ms as text)
  resetToken: text("reset_token"),
  resetExpires: text("reset_expires"),
  updatedAt: text("updated_at").notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  // Binding sessions to the password hash invalidates them after a reset,
  // including a concurrent login that started before the password changed.
  credentialHash: text("credential_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("admin_sessions_admin_idx").on(table.adminId),
  index("admin_sessions_expiry_idx").on(table.expiresAt),
]);

export type Scholarship = typeof scholarships.$inferSelect;
export type SchoolUpdate = typeof schoolUpdates.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Opportunity = typeof opportunities.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
