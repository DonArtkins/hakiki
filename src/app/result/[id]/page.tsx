import { and, eq } from "drizzle-orm";
import { VerdictCard } from "@/components/VerdictCard";
import type { Verdict } from "@/engine/schemas";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { currentSubject } from "@/lib/session-server";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await currentSubject();
  if (!me || !dbConfigured()) return <p>Sign in on this device to see this result.</p>;
  const { id } = await params;
  const [row] = await getDb().select().from(schema.checks).where(and(eq(schema.checks.id, id), eq(schema.checks.subjectId, me.subjectId))).limit(1);
  if (!row) return <p>Result not found.</p>;
  const verdict = { risk: row.risk, scamType: row.scamTypeId, confidence: row.confidence, reasons: row.reasons, nextSteps: row.nextSteps, needsMore: null, language: row.language } as unknown as Verdict;
  return <VerdictCard verdict={verdict} />;
}
