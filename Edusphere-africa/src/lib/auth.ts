import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, adminUsers, type AdminUser } from "@/db/schema";
import { SESSION_MAX_AGE, isSessionToken } from "@/lib/admin-security";

export type AdminSession = { adminId: number; username: string };

export function hashSecret(plain: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifySecret(plain: string, stored: string): boolean {
  if (typeof plain !== "string" || !/^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(stored)) return false;
  const [saltHex, hashHex] = stored.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const derived = scryptSync(plain, Buffer.from(saltHex, "hex"), 64);
  return timingSafeEqual(expected, derived);
}

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

/**
 * Opaque 256-bit session. Only its SHA-256 digest is stored, so a database
 * leak cannot be replayed as a live login. No signing secret is required.
 */
export async function createSessionToken(admin: Pick<AdminUser, "id" | "passwordHash">): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.insert(adminSessions).values({
      tokenHash: digest(token),
      adminId: admin.id,
      credentialHash: digest(admin.passwordHash),
      expiresAt: new Date(now.getTime() + SESSION_MAX_AGE * 1000),
    });
    // Opportunistic cleanup of expired rows.
    await tx.delete(adminSessions).where(lt(adminSessions.expiresAt, now));
  });
  return token;
}

export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!isSessionToken(token)) return null;
  const [row] = await db
    .select({
      adminId: adminUsers.id,
      username: adminUsers.username,
      passwordHash: adminUsers.passwordHash,
      credentialHash: adminSessions.credentialHash,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminId, adminUsers.id))
    .where(eq(adminSessions.tokenHash, digest(token)))
    .limit(1);

  if (!row || row.credentialHash !== digest(row.passwordHash)) return null;
  return { adminId: row.adminId, username: row.username };
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!isSessionToken(token)) return;
  await db.delete(adminSessions).where(eq(adminSessions.tokenHash, digest(token)));
}

export async function getAdmin(username: string): Promise<AdminUser | null> {
  const normalized = username.trim().toLowerCase();
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.username, normalized)).limit(1);
  return rows[0] ?? null;
}

/**
 * Creates the administrator account on first run of a fresh database, so a new
 * deployment is sign-in ready without manual SQL. It NEVER resets or replaces
 * an existing account or password. Set ADMIN_PASSWORD and ADMIN_RECOVERY_ANSWER
 * in the deployment environment to use your own credentials.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const existing = await getAdmin(username);
  if (existing) return;

  const password = process.env.ADMIN_PASSWORD || "Alimi1234$";
  const recoveryQuestion =
    process.env.ADMIN_RECOVERY_QUESTION || "What is your recovery keyword?";
  const recoveryAnswer = (process.env.ADMIN_RECOVERY_ANSWER || "edusphere").trim().toLowerCase();

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      "[edusphere] Creating the first admin account with the default password. " +
        "Set ADMIN_PASSWORD and ADMIN_RECOVERY_ANSWER in your deployment environment to change it.",
    );
  }

  await db
    .insert(adminUsers)
    .values({
      username,
      passwordHash: hashSecret(password),
      recoveryQuestion,
      recoveryAnswerHash: hashSecret(recoveryAnswer),
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoNothing({ target: adminUsers.username });
}

export function newResetToken(): { token: string; expires: string } {
  return { token: randomBytes(24).toString("hex"), expires: String(Date.now() + 1000 * 60 * 30) };
}
