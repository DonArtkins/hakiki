import { and, eq } from "drizzle-orm";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { currentSubject } from "@/lib/session-server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentSubject();
  if (!me || !dbConfigured()) return Response.json({ error: { code: "not_found", message: "Check not found." } }, { status: 404 });
  const { id } = await params;
  const [row] = await getDb().select().from(schema.checks).where(and(eq(schema.checks.id, id), eq(schema.checks.subjectId, me.subjectId))).limit(1);
  if (!row) return Response.json({ error: { code: "not_found", message: "Check not found." } }, { status: 404 });
  return Response.json({ check: row });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentSubject();
  if (!me || !dbConfigured()) return Response.json({ error: { code: "not_found", message: "Check not found." } }, { status: 404 });
  const { id } = await params;
  await getDb().delete(schema.checks).where(and(eq(schema.checks.id, id), eq(schema.checks.subjectId, me.subjectId)));
  return Response.json({ ok: true });
}
