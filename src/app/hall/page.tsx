import { KEYS, store } from "@/lib/redis";
import type { NameEntry } from "@/lib/names";
import { LeaveNameModal } from "@/components/LeaveNameModal";
import { NameSky } from "@/components/NameSky";

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

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="pixel-title text-[1.15rem] sm:text-[1.5rem]"
            data-text="HALL OF FAME"
          >
            ✧ 名 人 堂 · HALL OF FAME
          </h1>
          <p className="mt-2 font-terminal text-lg text-crt-bone/75">
            每一颗漂浮的星，都曾按下过「青史留名」。信号不稳时他们会短暂扭曲。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="retro-panel !p-2 font-pixel text-[0.62rem] tracking-widest text-crt-amber">
            总计 / TOTAL : {total.toString().padStart(5, "0")}
          </div>
          <LeaveNameModal />
        </div>
      </header>

      <NameSky fallback={seed} />

      {entries.length === 0 && (
        <p className="font-terminal text-base text-crt-bone/50">
          * 当前展示为示例数据。第一个真实留名者将永远闪亮。
        </p>
      )}
    </div>
  );
}
