import { NextResponse } from "next/server";
import { KEYS, store } from "@/lib/redis";
import { sanitizeMessage, sanitizeName, type NameEntry } from "@/lib/names";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_RETURN = 200;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(
    MAX_RETURN,
    Math.max(1, Number(url.searchParams.get("limit") ?? 120) || 120),
  );

  const s = store();
  const [rawEntries, total] = await Promise.all([
    s.lrange<string>(KEYS.names, 0, limit - 1),
    s.llen(KEYS.names),
  ]);

  const entries: NameEntry[] = [];
  for (const raw of rawEntries) {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed && typeof parsed.name === "string") {
        entries.push({
          name: String(parsed.name).slice(0, 24),
          message: String(parsed.message ?? "").slice(0, 140),
          at: Number(parsed.at) || Date.now(),
        });
      }
    } catch {
      // Skip malformed rows rather than 500.
    }
  }

  return NextResponse.json({ entries, total });
}

export async function POST(req: Request) {
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

  const entry: NameEntry = { name, message, at: Date.now() };
  const total = await store().lpush(KEYS.names, JSON.stringify(entry));
  return NextResponse.json({ ok: true, entry, total });
}
