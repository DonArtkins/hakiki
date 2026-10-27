import { randomInt } from "node:crypto";
import { eq } from "drizzle-orm";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { currentSubject, ensureSubject } from "@/lib/session-server";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function code(): string {
  return Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

export async function POST() {
  if (!dbConfigured()) return Response.json({ error: { code: "internal", message: "Guardian mode needs the database." } }, { status: 503 });
  const me = await ensureSubject();
  const value = code();
  await getDb().insert(schema.linkCodes).values({ code: value, subjectId: me.subjectId, purpose: "guardian_invite", expiresAt: new Date(Date.now() + 24 * 3600 * 1000) });
  return Response.json({ code: value, expiresHours: 24 });
}

export async function GET() {
  const me = await currentSubject();
  if (!me || !dbConfigured()) return Response.json({ guardians: [], wards: [], inbox: [] });
  const db = getDb();
  const guardians = await db.select().from(schema.guardianLinks).where(eq(schema.guardianLinks.wardId, me.subjectId));
  const wards = await db.select().from(schema.guardianLinks).where(eq(schema.guardianLinks.guardianId, me.subjectId));
  const inbox = await db.select().from(schema.notifications).where(eq(schema.notifications.subjectId, me.subjectId)).limit(20);
  return Response.json({ guardians, wards, inbox });
}
