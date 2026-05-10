"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Pick = {
  url: string;
  originalUrl: string;
  timestamp: string;
  year: number;
  host: string;
};

const RANGES: { from: number; to: number; key: string }[] = [
  { from: 1996, to: 1999, key: "tm.era.1" },
  { from: 2000, to: 2003, key: "tm.era.2" },
  { from: 2004, to: 2007, key: "tm.era.3" },
  { from: 2008, to: 2010, key: "tm.era.4" },
  { from: 1996, to: 2010, key: "tm.era.5" },
];

function formatTimestamp(ts: string): string {
  if (ts.length < 8) return ts;
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
}

export function TimeMachine() {
  const { t } = useI18n();
  const [rangeIdx, setRangeIdx] = useState(4);
  const [loading, setLoading] = useState(false);
  const [pick, setPick] = useState<Pick | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wander = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPick(null);
    const { from, to } = RANGES[rangeIdx];
    try {
      const res = await fetch(`/api/random?from=${from}&to=${to}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setError(t("tm.error"));
        return;
      }
      const data = (await res.json()) as Pick;
      setPick(data);
    } catch {
      setError(t("tm.error.conn"));
    } finally {
      setLoading(false);
    }
  }, [rangeIdx, t]);

  const range = RANGES[rangeIdx];

  return (
    <section className="retro-panel">
      <div className="flex flex-col gap-4">
        <h2 className="font-pixel text-[0.78rem] tracking-widest text-crt-amber">
          {t("tm.title")}{" "}
          <span className="text-crt-bone/60">{t("tm.titleSub")}</span>
        </h2>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {RANGES.map((r, i) => {
            const active = i === rangeIdx;
            return (
              <button
                key={r.key}
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
                {t(r.key)}
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
            {loading ? t("tm.wander.loading") : t("tm.wander")}
          </button>
          <p className="font-terminal text-base text-crt-bone/60">
            {t("tm.caption", { from: range.from, to: range.to })}
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
                  {t("tm.result.locked", { date: formatTimestamp(pick.timestamp) })}
                </span>
                <span className="break-all font-terminal text-xl text-crt-amber">
                  {pick.originalUrl}
                </span>
                <span className="font-terminal text-base text-crt-bone/70">
                  {t("tm.result.host", { host: pick.host })}
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
  const { t } = useI18n();
  const [phase, setPhase] = useState(0);
  const phaseKeys = [
    "tm.loader.1",
    "tm.loader.2",
    "tm.loader.3",
    "tm.loader.4",
    "tm.loader.5",
  ];
  useEffect(() => {
    const id = setInterval(
      () => setPhase((p) => (p + 1) % phaseKeys.length),
      3200,
    );
    return () => clearInterval(id);
  }, [phaseKeys.length]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-[2px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.span
            key={i}
            className="block h-4 w-2"
            style={{
              background:
                i % 3 === 0 ? "#c9a227" : i % 3 === 1 ? "#6b8e5a" : "#7a2828",
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 0.9, delay: i * 0.05, repeat: Infinity }}
          />
        ))}
      </div>
      <span className="font-pixel text-[0.62rem] tracking-widest">
        {t(phaseKeys[phase])}
      </span>
    </div>
  );
}
