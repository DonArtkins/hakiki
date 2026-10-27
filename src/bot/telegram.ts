import { Bot } from "grammy";
import { runCheckOnce } from "@/engine";
import type { Verdict } from "@/engine/schemas";
import { env } from "@/lib/env";
import { buildGuardianMessage } from "@/lib/notify";

// Telegram is a channel adapter only (architecture rule 2): it formats verdicts from runCheck().
export function formatVerdictMessage(v: Verdict): string {
  const title = v.risk === "high" ? "Likely a scam" : v.risk === "suspicious" ? "Be careful: suspicious" : v.risk === "safe" ? "Looks genuine, but stay careful" : "We cannot tell yet";
  const type = v.scamType ? ` — ${v.scamType.replaceAll("_", " ")}` : "";
  const reasons = v.reasons.map((r) => `• ${r.text}`).join("\n");
  const steps = v.nextSteps.map((s, i) => `${i + 1}) ${s}`).join(" ");
  return `${title}${type}\n${reasons}\nWhat to do: ${steps}`.slice(0, 3900);
}

export function createBot() {
  const token = env().TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const bot = new Bot(token);
  bot.command("start", async (ctx) => {
    await ctx.reply("Karibu Hakiki. Send me a suspicious message or screenshot. / Tuma ujumbe au picha unayoshuku.");
  });
  bot.command("guardian", async (ctx) => {
    await ctx.reply(buildGuardianMessage({ scamType: null, risk: "unclear", at: new Date() }, "en"));
  });
  bot.command("link", async (ctx) => {
    await ctx.reply(ctx.match ? "Link code received. Open Hakiki on the web to finish linking this device." : "Send /link CODE with the code from Hakiki on the web.");
  });
  bot.command("delete", async (ctx) => {
    await ctx.reply("Open Hakiki on the web and use Delete my data so the request is tied to your session.");
  });
  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith("/")) return;
    await ctx.reply("Checking… / Inakagua…");
    const { verdict } = await runCheckOnce({ text, channel: "telegram" }, { traceId: crypto.randomUUID() });
    await ctx.reply(verdict ? formatVerdictMessage(verdict) : "We could not check that. Paste the message text and try again.");
  });
  bot.on("message:photo", async (ctx) => {
    const photo = ctx.message.photo.at(-1);
    if (!photo) return;
    await ctx.reply("Checking… / Inakagua…");
    const file = await ctx.api.getFile(photo.file_id);
    if (!file.file_path) { await ctx.reply("We could not read that photo. Send the original or paste the text."); return; }
    const res = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    const imageDataUrl = `data:image/jpeg;base64,${bytes.toString("base64")}`;
    const { verdict } = await runCheckOnce({ imageDataUrl, channel: "telegram" }, { traceId: crypto.randomUUID() });
    await ctx.reply(verdict ? formatVerdictMessage(verdict) : "We could not read that screenshot. Paste the message text instead.");
  });
  return bot;
}

export async function handleTelegramUpdate(update: unknown): Promise<boolean> {
  if (!env().TELEGRAM_BOT_TOKEN) return false;
  const bot = createBot();
  await bot.init();
  await bot.handleUpdate(update as never);
  return true;
}
