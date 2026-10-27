// Rate-limit boundary (SDR-005/R1). Upstash in production; a process-local sliding window
// keeps local development honest. Keys are device hash or IP, never raw identifiers.
export interface RateLimiter {
  limit(key: string, max: number, windowSeconds: number): Promise<boolean>;
}

const buckets = new Map<string, number[]>();

export const memoryRateLimiter: RateLimiter = {
  async limit(key, max, windowSeconds) {
    const now = Date.now();
    const from = now - windowSeconds * 1000;
    const hits = (buckets.get(key) ?? []).filter((t) => t > from);
    if (hits.length >= max) {
      buckets.set(key, hits);
      return false;
    }
    hits.push(now);
    buckets.set(key, hits);
    return true;
  },
};

export const CHECK_LIMITS = [
  { scope: "device-hour", max: 10, windowSeconds: 3600 },
  { scope: "device-day", max: 40, windowSeconds: 86_400 },
  { scope: "ip-hour", max: 30, windowSeconds: 3600 },
] as const;
