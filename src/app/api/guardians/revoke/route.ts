import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { currentSubject } from "@/lib/session-server";

const Body = z.object({ linkId: z.string().uuid() });

export async function POST(req: Request) {
  const me = await currentSubject();
  if (!me || !dbConfigured()) return Response.json({ error: { code: "not_found", message: "Link not found." } }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: { code: "unreadable", message: "Choose a guardian link." } }, { status: 400 });
  await getDb().update(schema.guardianLinks).set({ status: "revoked" }).where(and(eq(schema.guardianLinks.id, parsed.data.linkId), eq(schema.guardianLinks.wardId, me.subjectId)));
  return Response.json({ ok: true });
}
