import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { runCheck, type CheckEvent } from "@/engine";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { assertBudget, budgetTripped, type BudgetState } from "@/lib/budget";
import { env } from "@/lib/env";
import { CHECK_LIMITS, memoryRateLimiter } from "@/lib/ratelimit";
import { ensureSubject, sessionCookieHeader } from "@/lib/session-server";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  text: z.string().max(10_000).optional(),
  imageDataUrl: z.string().max(7_000_000).optional(),
  locale: z.enum(["en", "sw"]).optional(),
  channel: z.enum(["web", "telegram", "share"]).default("web"),
});

function sse(event: unknown): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

async function budgetState(): Promise<BudgetState> {
  const e = env();
  if (!dbConfigured()) return { spentTodayUsd: 0, spentTotalUsd: 0, dailyCapUsd: e.DAILY_CAP_USD, totalCapUsd: e.TOTAL_CAP_USD };
  const db = getDb();
  const [total] = await db.select({ value: sql<string>`coalesce(sum(${schema.modelCalls.costUsd}), 0)` }).from(schema.modelCalls);
  const [today] = await db.select({ value: sql<string>`coalesce(sum(${schema.modelCalls.costUsd}), 0)` }).from(schema.modelCalls).where(sql`${schema.modelCalls.createdAt} >= date_trunc('day', now())`);
  return { spentTodayUsd: Number(today?.value ?? 0), spentTotalUsd: Number(total?.value ?? 0), dailyCapUsd: e.DAILY_CAP_USD, totalCapUsd: e.TOTAL_CAP_USD };
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: { code: "unreadable", message: "Paste a message or add a screenshot first." } }, { status: 400 });
  const subject = await ensureSubject();
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "local";
  const ipKey = createHmac("sha256", env().SESSION_SECRET ?? "hakiki-local").update(ip).digest("hex");
  for (const limit of CHECK_LIMITS) {
    const key = limit.scope === "ip-hour" ? `ip:${ipKey}` : `${limit.scope}:${subject.deviceHash}`;
    if (!(await memoryRateLimiter.limit(key, limit.max, limit.windowSeconds))) {
      return Response.json({ error: { code: "rate_limited", message: "Too many checks. Wait a little and try again." } }, { status: 429 });
    }
  }
  const state = await budgetState().catch(() => ({ spentTodayUsd: 0, spentTotalUsd: 0, dailyCapUsd: env().DAILY_CAP_USD, totalCapUsd: env().TOTAL_CAP_USD }));
  try {
    assertBudget(state);
  } catch {
    // Budget exhaustion degrades to rules-only inside the engine; it never blocks a text check.
  }
  const tripped = budgetTripped(state);
  const traceId = crypto.randomUUID();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      let findings: unknown[] = [];
      let checkId: string | undefined;
      const send = (event: CheckEvent | Record<string, unknown>) => controller.enqueue(encoder.encode(sse(event)));
      try {
        for await (const event of runCheck(
          { text: parsed.data.text, imageDataUrl: parsed.data.imageDataUrl, channel: parsed.data.channel, locale: parsed.data.locale },
          {
            subjectId: subject.subjectId,
            deviceHash: subject.deviceHash,
            traceId,
            budgetTripped: tripped,
            recordModelCall: async (call) => {
              if (!dbConfigured()) return;
              await getDb().insert(schema.modelCalls).values({
                purpose: call.purpose, model: call.model, inTokens: call.usage?.input_tokens, outTokens: call.usage?.output_tokens,
                cachedTokens: call.usage?.cached_tokens, costUsd: call.costUsd, latencyMs: call.latencyMs,
              });
            },
          },
        )) {
          if (event.type === "rules") findings = event.findings;
          if (event.type === "verdict" && dbConfigured()) {
            const db = getDb();
            const [row] = await db.insert(schema.checks).values({
              subjectId: subject.subjectId, channel: parsed.data.channel, inputKind: parsed.data.imageDataUrl ? (parsed.data.text ? "text_image" : "image") : "text",
              risk: event.verdict.risk, scamTypeId: event.verdict.scamType, confidence: event.verdict.confidence,
              reasons: event.verdict.reasons, nextSteps: event.verdict.nextSteps, ruleFindings: findings, language: event.verdict.language,
              expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
            }).returning({ id: schema.checks.id });
            checkId = row?.id;
            if (checkId && event.verdict.risk === "high") {
              const guardians = await db.select({ guardianId: schema.guardianLinks.guardianId }).from(schema.guardianLinks)
                .where(sql`${schema.guardianLinks.wardId} = ${subject.subjectId} and ${schema.guardianLinks.status} = 'active'`);
              for (const g of guardians) {
                await db.insert(schema.notifications).values({ subjectId: g.guardianId, checkId, channel: "inbox", status: "pending" });
              }
            }
          }
          if (event.type === "done" && checkId) send({ ...event, checkId });
          else send(event);
        }
      } catch {
        send({ type: "error", error: { code: "internal", message: "Check failed. Try again." } });
      } finally {
        controller.close();
      }
    },
  });
  const headers = new Headers({ "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
  if (subject.cookieToken) headers.append("set-cookie", sessionCookieHeader(subject.cookieToken));
  return new Response(stream, { headers });
}
