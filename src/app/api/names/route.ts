import { NextResponse } from "next/server";
import { KEYS, store } from "@/lib/redis";
import { sanitizeMessage, sanitizeName, type NameEntry } from "@/lib/names";
import { checkRate, clientIp } from "@/lib/ratelimit";
import { containsLink } from "@/lib/validate";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * The guestbook has two storage regions:
 *
 *   pinned  (KEYS.namesPinned)  — the first PINNED_CAP signers, ever.
 *                                 Append-only, oldest-first, forever.
 *   recent  (KEYS.names)        — a rolling window of the most recent
 *                                 RECENT_CAP non-pinned entries. Newest
 *                                 at the head. On write we LTRIM to cap.
 *
 * So "the first 20 shall shine forever" (user wording) is enforced at
 * write time, and the rolling delete keeps Upstash bounded no matter
 * how many people sign afterward.
 */
const PINNED_CAP = 20;
const RECENT_CAP = 500;
const MAX_RETURN_RECENT = 200;

function parseEntry(raw: unknown): NameEntry | null {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed.name === "string") {
      return {
        name: String(parsed.name).slice(0, 24),
        message: String(parsed.message ?? "").slice(0, 140),
        at: Number(parsed.at) || Date.now(),
      };
    }
  } catch {
    // skip malformed rows
  }
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(
    MAX_RETURN_RECENT,
    Math.max(1, Number(url.searchParams.get("limit") ?? 120) || 120),
  );

  const s = store();
  const [pinnedRaw, recentRaw, pinnedLen, recentLen] = await Promise.all([
    s.lrange<string>(KEYS.namesPinned, 0, -1),
    s.lrange<string>(KEYS.names, 0, limit - 1),
    s.llen(KEYS.namesPinned),
    s.llen(KEYS.names),
  ]);

  const pinned: NameEntry[] = [];
  for (const row of pinnedRaw) {
    const e = parseEntry(row);
    if (e) pinned.push(e);
  }
  const recent: NameEntry[] = [];
  for (const row of recentRaw) {
    const e = parseEntry(row);
    if (e) recent.push(e);
  }

  return NextResponse.json({
    pinned,
    recent,
    total: pinnedLen + recentLen,
    pinnedCap: PINNED_CAP,
  });
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rate = await checkRate(ip);
  if (!rate.ok) {
    return NextResponse.json(
      {
        error: rate.reason === "burst" ? "too_fast" : "daily_limit",
        retryAfter: rate.retryAfterSec,
      },
      {
        status: 429,
        headers: { "retry-after": String(rate.retryAfterSec) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const raw = (body ?? {}) as { name?: unknown; message?: unknown };
  const name = sanitizeName(raw.name);
  const message = sanitizeMessage(raw.message);

  if (!name) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  // No-link policy applies to both name AND message — otherwise spammers
  // just move the URL into the name field.
  if (containsLink(name) || containsLink(message)) {
    return NextResponse.json({ error: "no_links" }, { status: 400 });
  }

  const entry: NameEntry = { name, message, at: Date.now() };
  const payload = JSON.stringify(entry);

  const s = store();
  const pinnedLen = await s.llen(KEYS.namesPinned);

  if (pinnedLen < PINNED_CAP) {
    // Seat in the permanent first-20 list. RPUSH keeps the pinned list
    // oldest-first, so #1 is always at index 0 and stays there.
    const newPinnedLen = await s.rpush(KEYS.namesPinned, payload);
    return NextResponse.json({
      ok: true,
      entry,
      pinned: true,
      pinnedIndex: newPinnedLen - 1,
    });
  }

  // Append to the rolling recent list, then trim to cap. LPUSH + LTRIM 0 N-1
  // is the canonical Redis pattern for a bounded FIFO from the head.
  await s.lpush(KEYS.names, payload);
  await s.ltrim(KEYS.names, 0, RECENT_CAP - 1);

  return NextResponse.json({ ok: true, entry, pinned: false });
}
