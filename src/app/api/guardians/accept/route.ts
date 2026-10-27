import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { ensureSubject } from "@/lib/session-server";

const Body = z.object({ code: z.string().min(6).max(12) });

export async function POST(req: Request) {
  if (!dbConfigured()) return Response.json({ error: { code: "internal", message: "Guardian mode needs the database." } }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: { code: "unreadable", message: "Enter the invite code." } }, { status: 400 });
  const me = await ensureSubject();
  const db = getDb();
  const [invite] = await db.select().from(schema.linkCodes).where(and(eq(schema.linkCodes.code, parsed.data.code.toUpperCase()), eq(schema.linkCodes.purpose, "guardian_invite"), isNull(schema.linkCodes.usedAt))).limit(1);
  if (!invite || invite.expiresAt.getTime() < Date.now()) return Response.json({ error: { code: "unreadable", message: "That code is expired or already used." } }, { status: 400 });
  if (invite.subjectId === me.subjectId) return Response.json({ error: { code: "unreadable", message: "You cannot be your own guardian." } }, { status: 400 });
  await db.insert(schema.guardianLinks).values({ wardId: invite.subjectId, guardianId: me.subjectId, status: "active" });
  await db.update(schema.linkCodes).set({ usedAt: new Date() }).where(eq(schema.linkCodes.code, invite.code));
  return Response.json({ ok: true });
}
