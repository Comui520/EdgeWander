import { KEYS, store } from "@/lib/redis";
import type { NameEntry } from "@/lib/names";
import { HallShell } from "@/components/HallShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadInitialEntries(): Promise<{
  entries: NameEntry[];
  total: number;
}> {
  try {
    const s = store();
    const [raw, total] = await Promise.all([
      s.lrange<string>(KEYS.names, 0, 119),
      s.llen(KEYS.names),
    ]);
    const entries: NameEntry[] = [];
    for (const row of raw) {
      try {
        const parsed = typeof row === "string" ? JSON.parse(row) : row;
        if (parsed && typeof parsed.name === "string") {
          entries.push({
            name: String(parsed.name).slice(0, 24),
            message: String(parsed.message ?? "").slice(0, 140),
            at: Number(parsed.at) || Date.now(),
          });
        }
      } catch {
        // Ignore malformed rows.
      }
    }
    return { entries, total };
  } catch {
    return { entries: [], total: 0 };
  }
}

const DEMO_NAMES: NameEntry[] = [
  { name: "张三", message: "到此一游", at: 0 },
  { name: "Anon1998", message: "hello from dialup", at: 0 },
  { name: "小王", message: "我曾在这", at: 0 },
  { name: "GhostOfGeocities", message: "the stars remember", at: 0 },
  { name: "李雷", message: "Handshake... 56k", at: 0 },
  { name: "韩梅梅", message: "where did everyone go", at: 0 },
  { name: "NeonPilot", message: "signal received", at: 0 },
  { name: "老网民", message: "1999 never ended", at: 0 },
  { name: "pixelghost", message: "", at: 0 },
  { name: "CRTgirl", message: "still glowing", at: 0 },
  { name: "webring_wanderer", message: "", at: 0 },
  { name: "无名氏", message: "to whomever finds this", at: 0 },
];

export default async function HallPage() {
  const { entries, total } = await loadInitialEntries();
  const seed = entries.length > 0 ? entries : DEMO_NAMES;
  return <HallShell seed={seed} total={total} isEmpty={entries.length === 0} />;
}
