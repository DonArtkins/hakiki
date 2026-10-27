import { eq } from "drizzle-orm";
import { VerdictCard } from "@/components/VerdictCard";
import type { Verdict } from "@/engine/schemas";
import { dbConfigured, getDb, schema } from "@/lib/db";

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  if (!dbConfigured()) return <p>This warning is no longer available.</p>;
  const { slug } = await params;
  const [share] = await getDb().select().from(schema.shares).where(eq(schema.shares.slug, slug)).limit(1);
  if (!share) return <p>This warning is no longer available.</p>;
  const [check] = await getDb().select().from(schema.checks).where(eq(schema.checks.id, share.checkId)).limit(1);
  if (!check) return <p>This warning is no longer available.</p>;
  const verdict = { risk: check.risk, scamType: check.scamTypeId, confidence: check.confidence, reasons: check.reasons, nextSteps: check.nextSteps, needsMore: null, language: check.language } as unknown as Verdict;
  return <div><p style={{ color: "var(--muted)", maxWidth: 620 }}>Someone shared this warning to protect others. The message itself is never shown.</p><VerdictCard verdict={verdict} /></div>;
}
