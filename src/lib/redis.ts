import { Redis } from "@upstash/redis";

/**
 * The app works without Upstash configured — it falls back to a process-local
 * Map so `npm run dev` works out of the box. The fallback is obviously not
 * shared across serverless invocations, so production MUST set the env vars.
 */
type StoreLike = {
  incr(key: string): Promise<number>;
  get<T = unknown>(key: string): Promise<T | null>;
  lpush(key: string, value: string): Promise<number>;
  rpush(key: string, value: string): Promise<number>;
  lrange<T = unknown>(key: string, start: number, stop: number): Promise<T[]>;
  llen(key: string): Promise<number>;
  ltrim(key: string, start: number, stop: number): Promise<string>;
};

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const globalForStore = globalThis as unknown as {
  __edgewanderMemStore?: {
    counters: Map<string, number>;
    lists: Map<string, string[]>;
  };
};

function memStore(): StoreLike {
  if (!globalForStore.__edgewanderMemStore) {
    globalForStore.__edgewanderMemStore = {
      counters: new Map(),
      lists: new Map(),
    };
  }
  const { counters, lists } = globalForStore.__edgewanderMemStore;
  return {
    async incr(key) {
      const next = (counters.get(key) ?? 0) + 1;
      counters.set(key, next);
      return next;
    },
    async get(key) {
      if (counters.has(key)) return counters.get(key) as never;
      return null;
    },
    async lpush(key, value) {
      const list = lists.get(key) ?? [];
      list.unshift(value);
      lists.set(key, list);
      return list.length;
    },
    async rpush(key, value) {
      const list = lists.get(key) ?? [];
      list.push(value);
      lists.set(key, list);
      return list.length;
    },
    async lrange(key, start, stop) {
      const list = lists.get(key) ?? [];
      const end = stop === -1 ? list.length : stop + 1;
      return list.slice(start, end) as never;
    },
    async llen(key) {
      return lists.get(key)?.length ?? 0;
    },
    async ltrim(key, start, stop) {
      const list = lists.get(key) ?? [];
      const end = stop === -1 ? list.length : stop + 1;
      lists.set(key, list.slice(start, end));
      return "OK";
    },
  };
}

let client: StoreLike | null = null;

export function store(): StoreLike {
  if (client) return client;
  if (hasUpstash) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    client = {
      incr: (k) => redis.incr(k),
      get: (k) => redis.get(k),
      lpush: (k, v) => redis.lpush(k, v),
      rpush: (k, v) => redis.rpush(k, v),
      lrange: (k, s, e) => redis.lrange(k, s, e) as Promise<never[]>,
      llen: (k) => redis.llen(k),
      ltrim: (k, s, e) => redis.ltrim(k, s, e),
    };
  } else {
    client = memStore();
  }
  return client;
}

export const KEYS = {
  visitors: "edgewander:visitors",
  names: "edgewander:names",
  namesPinned: "edgewander:names:pinned",
} as const;

export const isUpstashConfigured = hasUpstash;

/**
 * Return the raw Upstash Redis client, or null when running against the
 * in-memory fallback. `@upstash/ratelimit` needs the real client to
 * function — in dev without env vars we just let every request through.
 */
let rawClient: Redis | null = null;
export function rawRedis(): Redis | null {
  if (!hasUpstash) return null;
  if (!rawClient) {
    rawClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return rawClient;
}
