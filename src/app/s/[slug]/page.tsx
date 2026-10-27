import { eq } from "drizzle-orm";
import { LocalizedText } from "@/components/LocaleProvider";
import { VerdictCard } from "@/components/VerdictCard";
import type { Verdict } from "@/engine/schemas";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { t, type Locale } from "@/lib/i18n";

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  if (!dbConfigured()) return <LocalizedText k="share.gone" />;
  const { slug } = await params;
  const [share] = await getDb().select().from(schema.shares).where(eq(schema.shares.slug, slug)).limit(1);
  if (!share) return <LocalizedText k="share.gone" />;
  const [check] = await getDb().select().from(schema.checks).where(eq(schema.checks.id, share.checkId)).limit(1);
  if (!check) return <LocalizedText k="share.gone" />;
  const loc: Locale = check.language === "sw" ? "sw" : "en";
  const verdict = { risk: check.risk, scamType: check.scamTypeId, confidence: check.confidence, reasons: check.reasons, nextSteps: check.nextSteps, needsMore: null, language: check.language } as unknown as Verdict;
  return <div><p style={{ color: "var(--muted)", maxWidth: 620 }}>{t(loc, "share.intro")}</p><VerdictCard verdict={verdict} /></div>;
}
