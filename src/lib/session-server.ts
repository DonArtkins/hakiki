import { createHmac, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { SESSION_COOKIE, createSessionToken, verifySessionToken } from "./auth";
import { dbConfigured, getDb, schema } from "./db";
import { env } from "./env";

// Server-side subject resolution (SDR-002/R1). Anonymous first: a check never waits for signup.
export function deviceHashFromHeaders(h: Headers): string {
  const ua = h.get("user-agent") ?? "";
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ?? "";
  const ipPrefix = ip.split(".").slice(0, 3).join(".");
  const secret = env().SESSION_SECRET ?? env().INDICATOR_PEPPER ?? "hakiki-local-device";
  return createHmac("sha256", secret).update(`${ua}|${ipPrefix}`).digest("hex");
}

export async function currentSubject(): Promise<{ subjectId: string; sessionId: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || !env().SESSION_SECRET) return null;
  return verifySessionToken(token);
}

export interface EnsuredSubject {
  subjectId: string;
  deviceHash: string;
  cookieToken?: string;
}

export async function ensureSubject(): Promise<EnsuredSubject> {
  const h = await headers();
  const deviceHash = deviceHashFromHeaders(h);
  const existing = await currentSubject();
  if (existing) return { subjectId: existing.subjectId, deviceHash };
  if (!dbConfigured() || !env().SESSION_SECRET) return { subjectId: randomUUID(), deviceHash };
  const db = getDb();
  const [subject] = await db.insert(schema.subjects).values({ locale: "en" }).returning({ id: schema.subjects.id });
  if (!subject) throw new Error("subject_create_failed");
  const expiresAt = new Date(Date.now() + 90 * 24 * 3600 * 1000);
  const [session] = await db.insert(schema.sessions).values({ subjectId: subject.id, deviceHash, expiresAt }).returning({ id: schema.sessions.id });
  if (!session) throw new Error("session_create_failed");
  return { subjectId: subject.id, deviceHash, cookieToken: await createSessionToken(subject.id, session.id) };
}

export function sessionCookieHeader(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${90 * 24 * 60 * 60}`;
}
