import { and, eq } from "drizzle-orm";
import { LocalizedText } from "@/components/LocaleProvider";
import { VerdictCard } from "@/components/VerdictCard";
import type { Verdict } from "@/engine/schemas";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { currentSubject } from "@/lib/session-server";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await currentSubject();
  if (!me || !dbConfigured()) return <LocalizedText k="result.openOnDevice" />;
  const { id } = await params;
  const [row] = await getDb().select().from(schema.checks).where(and(eq(schema.checks.id, id), eq(schema.checks.subjectId, me.subjectId))).limit(1);
  if (!row) return <LocalizedText k="result.notHere" />;
  const verdict = { risk: row.risk, scamType: row.scamTypeId, confidence: row.confidence, reasons: row.reasons, nextSteps: row.nextSteps, needsMore: null, language: row.language } as unknown as Verdict;
  return <VerdictCard verdict={verdict} />;
}
