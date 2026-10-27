import { handleTelegramUpdate } from "@/bot/telegram";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const secret = env().TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) return Response.json({ error: "unauthorized" }, { status: 401 });
  const update = await req.json().catch(() => null);
  if (!update) return Response.json({ error: "bad_update" }, { status: 400 });
  await handleTelegramUpdate(update);
  return Response.json({ ok: true });
}
