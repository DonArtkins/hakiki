import { and, eq } from "drizzle-orm";
import { createShareSlug, shareCardData } from "@/engine/share";
import type { Verdict } from "@/engine/schemas";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { currentSubject } from "@/lib/session-server";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentSubject();
  if (!me || !dbConfigured()) return Response.json({ error: { code: "not_found", message: "Check not found." } }, { status: 404 });
  const { id } = await params;
  const [check] = await getDb().select().from(schema.checks).where(and(eq(schema.checks.id, id), eq(schema.checks.subjectId, me.subjectId))).limit(1);
  if (!check) return Response.json({ error: { code: "not_found", message: "Check not found." } }, { status: 404 });
  const slug = createShareSlug();
  await getDb().insert(schema.shares).values({ checkId: id, slug });
  const verdict = { risk: check.risk, scamType: check.scamTypeId, confidence: check.confidence, reasons: check.reasons, nextSteps: check.nextSteps, language: check.language, needsMore: null } as unknown as Verdict;
  return Response.json({ slug, card: shareCardData(verdict) });
}
