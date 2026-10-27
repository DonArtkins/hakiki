import OpenAI from "openai";
import { env } from "./env";

// The ONLY module that knows the model base URL, model IDs and prices (ADR-7 / SDR-006/R4).
// Provider-agnostic: open-weights mode is MODEL_BASE_URL + MODEL_ID env changes only.
export const MODELS = {
  reason: () => env().MODEL_ID,
  sam: "sam-3.1",
  image: "muse-image-1.0",
} as const;

let client: OpenAI | undefined;
export function meta(): OpenAI {
  const key = env().MODEL_API_KEY;
  if (!key) throw new Error("MODEL_API_KEY is not configured");
  client ??= new OpenAI({ baseURL: env().MODEL_BASE_URL, apiKey: key, timeout: 25_000, maxRetries: 1 });
  return client;
}

export function modelConfigured(): boolean {
  return Boolean(env().MODEL_API_KEY);
}

const PRICE = { input: 1.25 / 1_000_000, output: 4.25 / 1_000_000, cached: 0.15 / 1_000_000 };

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cached_tokens?: number;
}

export function costOf(u: TokenUsage): number {
  const cached = u.cached_tokens ?? 0;
  return (u.input_tokens - cached) * PRICE.input + cached * PRICE.cached + u.output_tokens * PRICE.output;
}
