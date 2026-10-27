import { dbConfigured } from "@/lib/db";
import { modelConfigured } from "@/lib/meta";

export function GET() {
  return Response.json({ ok: true, model: modelConfigured(), db: dbConfigured(), time: new Date().toISOString() });
}
