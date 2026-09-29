import { logError } from "@/lib/logger";

type ConsumeResult = boolean;

const memory = new Map<string, { count: number; reset: number }>();

export function consumeMemoryLimit(key: string, limit: number, windowMs: number, now = Date.now()): ConsumeResult {
  const current = memory.get(key);
  if (!current || current.reset < now) {
    memory.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function resetMemoryLimits() {
  memory.clear();
}

function upstashConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export class MemoryRateLimiter {
  allow(key: string, limit: number, windowMs: number, now = Date.now()) {
    return consumeMemoryLimit(key, limit, windowMs, now);
  }
}

export class RedisRateLimiter {
  async allow(key: string, limit: number, windowMs: number): Promise<ConsumeResult | null> {
    const base = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
    if (!base || !token) return null;
    const namespaced = `rl:${key}`;
    const res = await fetch(`${base}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", namespaced],
        ["PTTL", namespaced],
      ]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ result: number }>;
    const count = Number(json?.[0]?.result || 0);
    const ttl = Number(json?.[1]?.result || -1);
    if (count === 1 || ttl < 0) {
      await fetch(`${base}/pexpire/${encodeURIComponent(namespaced)}/${windowMs}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    }
    return count <= limit;
  }
}

const memoryLimiter = new MemoryRateLimiter();
const redisLimiter = new RedisRateLimiter();

export class RateLimiter {
  async allow(key: string, limit: number, windowMs: number) {
    const production = process.env.NODE_ENV === "production";
    const railwaySingleReplica = Boolean(process.env.RAILWAY_ENVIRONMENT);
    if (production && !upstashConfigured() && !railwaySingleReplica) {
      logError("rate_limit_fail_closed_no_redis", { keyKind: key.split(":")[0] });
      return false;
    }
    if (upstashConfigured()) {
      try {
        const distributed = await redisLimiter.allow(key, limit, windowMs);
        if (distributed !== null) return distributed;
      } catch {
        /* backend distribuído indisponível */
      }
      if (production) {
        logError("rate_limit_distributed_unavailable", { keyKind: key.split(":")[0] });
        return false;
      }
    }
    return memoryLimiter.allow(key, limit, windowMs);
  }
}

const limiter = new RateLimiter();

export async function rateLimit(key: string, limit: number, windowMs: number) {
  return limiter.allow(key, limit, windowMs);
}

export function productionRequiresDistributedLimit(env = process.env.NODE_ENV, redis = upstashConfigured()) {
  return env === "production" && !redis;
}
