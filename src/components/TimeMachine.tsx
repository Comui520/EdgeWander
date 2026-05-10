"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type Pick = {
  url: string;
  originalUrl: string;
  timestamp: string;
  year: number;
  host: string;
};

const PRESETS: { label: string; from: number; to: number }[] = [
  { label: "1996-1999 // 拨号时代", from: 1996, to: 1999 },
  { label: "2000-2003 // 千禧互联", from: 2000, to: 2003 },
  { label: "2004-2007 // 博客纪元", from: 2004, to: 2007 },
  { label: "2008-2010 // Web 2.0 残响", from: 2008, to: 2010 },
  { label: "1996-2010 // 全域随机", from: 1996, to: 2010 },
];

function formatTimestamp(ts: string): string {
  if (ts.length < 8) return ts;
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
}

export function TimeMachine() {
  const [rangeIdx, setRangeIdx] = useState(4);
  const [loading, setLoading] = useState(false);
  const [pick, setPick] = useState<Pick | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wander = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPick(null);
    const { from, to } = PRESETS[rangeIdx];
    try {
      const res = await fetch(`/api/random?from=${from}&to=${to}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setError("时光机失联。再试一次。");
        return;
      }
      const data = (await res.json()) as Pick;
      setPick(data);
    } catch {
      setError("连接档案馆失败。再试一次。");
    } finally {
      setLoading(false);
    }
  }, [rangeIdx]);

  return (
    <section className="retro-panel">
      <div className="flex flex-col gap-4">
        <h2 className="font-pixel text-[0.78rem] tracking-widest text-crt-amber">
          选择年份区间 / SELECT ERA
        </h2>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map((p, i) => {
            const active = i === rangeIdx;
            return (
              <button
                key={p.label}
                onClick={() => setRangeIdx(i)}
                className={
                  "retro-button retro-button--ghost !px-3 !py-2 !text-[0.62rem] " +
                  (active ? "!text-crt-amber" : "")
                }
                style={
                  active
                    ? {
                        boxShadow:
                          "inset 2px 2px 0 #c9a227, inset -2px -2px 0 #0d0f08",
                      }
                    : undefined
                }
              >
                {active ? "▸ " : "  "}
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <button
            className="retro-button scale-100 !px-8 !py-5 !text-[1rem] sm:!text-[1.25rem]"
            onClick={wander}
            disabled={loading}
          >
            {loading ? "▓▓ 解调制中 ▓▓" : "▶ 随机穿越"}
          </button>
          <p className="font-terminal text-base text-crt-bone/60">
            点击按钮即随机跳转到一个来自 {PRESETS[rangeIdx].from}-
            {PRESETS[rangeIdx].to} 的存档网页。
          </p>
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="load"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="font-terminal text-lg text-crt-green"
            >
              <MosaicLoader />
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="err"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="retro-panel !border-crt-blood font-terminal text-lg text-crt-blood"
            >
              ! {error}
            </motion.div>
          )}

          {pick && !loading && (
            <motion.a
              key={pick.url}
              href={pick.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
              transition={{ duration: 0.35 }}
              className="retro-panel block cursor-pointer hover:!border-crt-amber"
            >
              <div className="flex flex-col gap-1">
                <span className="font-pixel text-[0.62rem] tracking-widest text-crt-green">
                  ☷ SIGNAL LOCKED — {formatTimestamp(pick.timestamp)}
                </span>
                <span className="font-terminal break-all text-xl text-crt-amber">
                  {pick.originalUrl}
                </span>
                <span className="font-terminal text-base text-crt-bone/70">
                  host: {pick.host} · 点击在新窗口打开 Wayback 快照 ↗
                </span>
              </div>
            </motion.a>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function MosaicLoader() {
  const [phase, setPhase] = useState(0);
  const phases = [
    "DIALING INTERNET ARCHIVE ...",
    "HANDSHAKE ... 56k",
    "CDX LOOKUP — RACING 6 DOMAINS",
    "LONG HAUL TO web.archive.org ...",
    "STILL LISTENING FOR A CARRIER ...",
  ];
  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % phases.length), 3200);
    return () => clearInterval(id);
  }, [phases.length]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-[2px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.span
            key={i}
            className="block h-4 w-2"
            style={{
              background: i % 3 === 0 ? "#c9a227" : i % 3 === 1 ? "#6b8e5a" : "#7a2828",
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 0.9, delay: i * 0.05, repeat: Infinity }}
          />
        ))}
      </div>
      <span className="font-pixel text-[0.62rem] tracking-widest">
        {phases[phase]}
      </span>
    </div>
  );
}
