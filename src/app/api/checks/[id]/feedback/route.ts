import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { currentSubject } from "@/lib/session-server";

const Body = z.object({ verdict_feedback: z.enum(["correct", "wrong_scam", "wrong_safe", "unsure"]), note: z.string().max(500).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentSubject();
  if (!me || !dbConfigured()) return Response.json({ error: { code: "not_found", message: "Check not found." } }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: { code: "unreadable", message: "Choose whether the verdict was right." } }, { status: 400 });
  const { id } = await params;
  const [check] = await getDb().select({ id: schema.checks.id }).from(schema.checks).where(and(eq(schema.checks.id, id), eq(schema.checks.subjectId, me.subjectId))).limit(1);
  if (!check) return Response.json({ error: { code: "not_found", message: "Check not found." } }, { status: 404 });
  await getDb().insert(schema.reports).values({ checkId: id, verdictFeedback: parsed.data.verdict_feedback, note: parsed.data.note });
  return Response.json({ ok: true });
}
