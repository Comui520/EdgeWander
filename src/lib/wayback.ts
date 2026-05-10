import { SEED_DOMAINS } from "./seeds";

/**
 * The CDX server is the Wayback Machine's queryable index. We ask it for
 * snapshots of a specific domain between two timestamps, limited to 200
 * 200-status captures, and pick one at random.
 *
 * Docs: https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server
 */
const CDX_BASE = "https://web.archive.org/cdx/search/cdx";

/**
 * How long a single batch of parallel requests is allowed to run. Measured
 * end-to-end: from some regions (mainland China especially) a CDX call can
 * easily take 15-30 seconds, so we budget generously and rely on the race
 * to return as soon as *any* domain comes back.
 */
const BATCH_TIMEOUT_MS = 28_000;

/**
 * How many domains to race in parallel per batch. The CDX server is the
 * bottleneck, not bandwidth, so piling on more requests doesn't help much
 * — but six gives us a good shot that at least one returns promptly.
 */
const PARALLEL_FANOUT = 6;

export type YearRange = { from: number; to: number };

export type ArchivedPick = {
  url: string;
  originalUrl: string;
  timestamp: string;
  year: number;
  host: string;
};

function yearToTimestamp(year: number, end = false): string {
  return `${year}${end ? "1231235959" : "0101000000"}`;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

async function cdxLookup(
  domain: string,
  range: YearRange,
  signal?: AbortSignal,
): Promise<ArchivedPick | null> {
  // CDX expects multiple `filter=` query params, which URLSearchParams would
  // coalesce — so we build the string by hand.
  const qs =
    `url=${encodeURIComponent(domain)}` +
    `&output=json` +
    `&from=${yearToTimestamp(range.from)}` +
    `&to=${yearToTimestamp(range.to, true)}` +
    `&filter=statuscode:200` +
    `&filter=mimetype:text/html` +
    `&limit=200` +
    `&fl=timestamp,original` +
    `&collapse=timestamp:6`;

  const res = await fetch(`${CDX_BASE}?${qs}`, {
    signal,
    headers: { "user-agent": "EdgeWander/1.0 (+https://github.com)" },
    cache: "no-store",
  });
  if (!res.ok) return null;

  // CDX sometimes returns an HTML error page with status 200 when the
  // archive is overloaded — guard against non-JSON bodies.
  const text = await res.text();
  if (!text || text[0] !== "[") return null;

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!Array.isArray(data) || data.length <= 1) return null;

  // First row is the header: ["timestamp","original"]
  const rows = (data as string[][]).slice(1);
  if (rows.length === 0) return null;

  const [timestamp, original] = pick(rows);
  if (!timestamp || !original) return null;

  return {
    url: `https://web.archive.org/web/${timestamp}/${original}`,
    originalUrl: original,
    timestamp,
    year: Number(timestamp.slice(0, 4)),
    host: domain,
  };
}

/**
 * Race PARALLEL_FANOUT domains at once; first success wins and the rest
 * are aborted. If the whole batch returns nothing, try another batch —
 * up to maxAttempts domains total.
 *
 * The previous implementation tried one domain at a time under a 9s total
 * budget. Over a high-latency link to web.archive.org (common in CN), the
 * first slow domain would eat the entire budget and every subsequent try
 * would be skipped. Racing in parallel hides the long tail.
 */
export async function randomArchivedPage(
  range: YearRange,
  maxAttempts = 12,
): Promise<ArchivedPick | null> {
  const domains = shuffle(SEED_DOMAINS).slice(0, maxAttempts);

  for (let i = 0; i < domains.length; i += PARALLEL_FANOUT) {
    const batch = domains.slice(i, i + PARALLEL_FANOUT);
    const result = await raceBatch(batch, range);
    if (result) return result;
  }
  return null;
}

async function raceBatch(
  batch: string[],
  range: YearRange,
): Promise<ArchivedPick | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BATCH_TIMEOUT_MS);

  try {
    // Wrap each lookup so it returns its pick (or null) instead of throwing,
    // then race. We resolve at the first non-null pick and abort the rest.
    let settled = 0;
    return await new Promise<ArchivedPick | null>((resolve) => {
      const finish = (value: ArchivedPick | null) => {
        controller.abort();
        resolve(value);
      };

      for (const domain of batch) {
        cdxLookup(domain, range, controller.signal)
          .then((pick) => {
            if (pick) {
              finish(pick);
              return;
            }
            if (++settled === batch.length) resolve(null);
          })
          .catch(() => {
            if (++settled === batch.length) resolve(null);
          });
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function clampYearRange(from: unknown, to: unknown): YearRange {
  const floor = 1996;
  const ceil = 2010;
  const f = Math.max(floor, Math.min(ceil, Number(from) || floor));
  const t = Math.max(floor, Math.min(ceil, Number(to) || ceil));
  return f <= t ? { from: f, to: t } : { from: t, to: f };
}
