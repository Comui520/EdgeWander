import { KEYS, store } from "@/lib/redis";
import type { NameEntry } from "@/lib/names";
import { HallShell } from "@/components/HallShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    // skip
  }
  return null;
}

async function loadInitial(): Promise<{
  pinned: NameEntry[];
  recent: NameEntry[];
  total: number;
}> {
  try {
    const s = store();
    const [pinnedRaw, recentRaw, pinnedLen, recentLen] = await Promise.all([
      s.lrange<string>(KEYS.namesPinned, 0, -1),
      s.lrange<string>(KEYS.names, 0, 119),
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
    return { pinned, recent, total: pinnedLen + recentLen };
  } catch {
    return { pinned: [], recent: [], total: 0 };
  }
}

// Demo data, used ONLY when the store is empty (fresh deploy, dev fallback).
// Split into pinned + recent so the visual treatment is still correct in the
// demo case: the first names shown in the Hall look "eternal", the rest drift.
const DEMO_PINNED: NameEntry[] = [
  { name: "张三", message: "到此一游", at: 0 },
  { name: "Anon1998", message: "hello from dialup", at: 0 },
  { name: "小王", message: "我曾在这", at: 0 },
  { name: "GhostOfGeocities", message: "the stars remember", at: 0 },
  { name: "李雷", message: "Handshake... 56k", at: 0 },
];

const DEMO_RECENT: NameEntry[] = [
  { name: "韩梅梅", message: "where did everyone go", at: 0 },
  { name: "NeonPilot", message: "signal received", at: 0 },
  { name: "老网民", message: "1999 never ended", at: 0 },
  { name: "pixelghost", message: "", at: 0 },
  { name: "CRTgirl", message: "still glowing", at: 0 },
  { name: "webring_wanderer", message: "", at: 0 },
  { name: "无名氏", message: "to whomever finds this", at: 0 },
];

export default async function HallPage() {
  const { pinned, recent, total } = await loadInitial();
  const isEmpty = pinned.length === 0 && recent.length === 0;
  const pinnedSeed = pinned.length > 0 ? pinned : DEMO_PINNED;
  const recentSeed = recent.length > 0 ? recent : DEMO_RECENT;
  return (
    <HallShell
      pinned={pinnedSeed}
      recent={recentSeed}
      total={total}
      isEmpty={isEmpty}
    />
  );
}
