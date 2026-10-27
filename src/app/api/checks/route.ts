import { desc, eq } from "drizzle-orm";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { currentSubject } from "@/lib/session-server";

export async function GET() {
  const me = await currentSubject();
  if (!me || !dbConfigured()) return Response.json({ checks: [] });
  const rows = await getDb().select({ id: schema.checks.id, risk: schema.checks.risk, scamTypeId: schema.checks.scamTypeId, language: schema.checks.language, createdAt: schema.checks.createdAt })
    .from(schema.checks).where(eq(schema.checks.subjectId, me.subjectId)).orderBy(desc(schema.checks.createdAt)).limit(50);
  return Response.json({ checks: rows });
}
