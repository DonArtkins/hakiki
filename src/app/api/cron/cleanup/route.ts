import { sql } from "drizzle-orm";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET(req: Request) {
  const token = env().ADMIN_TOKEN;
  if (token && req.headers.get("authorization") !== `Bearer ${token}`) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!dbConfigured()) return Response.json({ ok: true, skipped: "db_not_configured" });
  const db = getDb();
  await db.delete(schema.checks).where(sql`${schema.checks.expiresAt} < now()`);
  await db.delete(schema.indicators).where(sql`${schema.indicators.lastSeen} < now() - interval '180 days'`);
  await db.delete(schema.modelCalls).where(sql`${schema.modelCalls.createdAt} < now() - interval '90 days'`);
  return Response.json({ ok: true });
}
