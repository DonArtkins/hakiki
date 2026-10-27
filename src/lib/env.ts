import { z } from "zod";

// Env is validated once, server-side. Names come from .env.example; secrets never reach the client.
const Env = z.object({
  MODEL_API_KEY: z.string().optional(),
  MODEL_BASE_URL: z.string().url().default("https://api.meta.ai/v1"),
  MODEL_ID: z.string().default("muse-spark-1.3"),
  DATABASE_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SESSION_SECRET: z.string().min(16).optional(),
  INDICATOR_PEPPER: z.string().min(16).optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  ADMIN_TOKEN: z.string().optional(),
  JUDGE_CODE: z.string().optional(),
  DAILY_CAP_USD: z.coerce.number().positive().default(6),
  TOTAL_CAP_USD: z.coerce.number().positive().default(40),
  APP_URL: z.string().url().default("https://hakiki.vercel.app"),
});

export type Env = z.infer<typeof Env>;

let cached: Env | undefined;
export function env(): Env {
  cached ??= Env.parse(process.env);
  return cached;
}
