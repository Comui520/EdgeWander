import { Ratelimit } from "@upstash/ratelimit";
import { rawRedis } from "./redis";

/**
 * Per-IP rate limiter for the guestbook. Two sliding windows stacked:
 * one to stop burst spam, one to stop long-tail flooding.
 *
 *   burst:   1 write per 60 seconds
 *   daily:   5 writes per 24 hours
 *
 * If either limit is hit, the route returns 429. In the dev fallback
 * (no Upstash configured) both limiters are no-ops so `npm run dev`
 * still works without keys.
 */

const redis = rawRedis();

export const burstLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "60 s"),
      analytics: false,
      prefix: "edgewander:rl:burst",
    })
  : null;

export const dailyLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "24 h"),
      analytics: false,
      prefix: "edgewander:rl:daily",
    })
  : null;

export type RateCheck =
  | { ok: true }
  | { ok: false; retryAfterSec: number; reason: "burst" | "daily" };

export async function checkRate(ip: string): Promise<RateCheck> {
  if (!burstLimiter || !dailyLimiter) return { ok: true };

  const [burst, daily] = await Promise.all([
    burstLimiter.limit(ip),
    dailyLimiter.limit(ip),
  ]);

  if (!burst.success) {
    return {
      ok: false,
      reason: "burst",
      retryAfterSec: Math.max(1, Math.ceil((burst.reset - Date.now()) / 1000)),
    };
  }
  if (!daily.success) {
    return {
      ok: false,
      reason: "daily",
      retryAfterSec: Math.max(1, Math.ceil((daily.reset - Date.now()) / 1000)),
    };
  }
  return { ok: true };
}

/**
 * Extract a best-effort client IP from the request. Behind Vercel the
 * leftmost X-Forwarded-For entry is the real client. Locally we fall back
 * to a constant so the dev flow still works.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}
