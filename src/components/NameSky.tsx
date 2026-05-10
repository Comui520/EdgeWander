"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type Entry = { name: string; message: string; at: number };

type FloatingEntry = Entry & {
  id: number;
  // 0-100 % of container
  x: number;
  y: number;
  depth: number; // 0 far ... 1 near
  driftSeed: number;
  fontSize: number;
};

const COLORS = ["#c9a227", "#6b8e5a", "#d9c9a3", "#7a2828", "#3a5a5a"];

function hash(n: number): number {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function NameSky({ fallback }: { fallback: Entry[] }) {
  const [entries, setEntries] = useState<Entry[]>(fallback);
  const [revealed, setRevealed] = useState(false);
  const [glitched, setGlitched] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch-then-reveal: start dark, show "tuning" animation, then fade in.
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 800);
    let cancelled = false;

    fetch("/api/names?limit=160", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { entries: Entry[] }) => {
        if (cancelled) return;
        if (Array.isArray(data.entries) && data.entries.length > 0) {
          setEntries(data.entries);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  // Randomly flash the glitch decoration on a few names at a time.
  useEffect(() => {
    if (entries.length === 0) return;
    const interval = setInterval(() => {
      const next = new Set<number>();
      const picks = Math.min(3, Math.max(1, Math.floor(entries.length / 30)));
      for (let i = 0; i < picks; i++) {
        next.add(Math.floor(Math.random() * entries.length));
      }
      setGlitched(next);
      setTimeout(() => setGlitched(new Set()), 800);
    }, 2600);
    return () => clearInterval(interval);
  }, [entries.length]);

  const floating = useMemo<FloatingEntry[]>(() => {
    return entries.map((e, i) => {
      const seed = i + 1;
      const depth = hash(seed * 3);
      return {
        ...e,
        id: i,
        x: hash(seed) * 92 + 4,
        y: hash(seed * 2) * 86 + 7,
        depth,
        driftSeed: hash(seed * 5),
        fontSize: 14 + depth * 18,
      };
    });
  }, [entries]);

  return (
    <div
      ref={containerRef}
      className="relative h-[70vh] min-h-[480px] w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #2a2515 0%, #0d0f08 55%, #06060a 100%)",
        boxShadow:
          "inset 2px 2px 0 #6b5e38, inset -2px -2px 0 #0d0f08, inset 4px 4px 0 #3e3a25, inset -4px -4px 0 #06060a",
        border: "2px solid #0d0f08",
      }}
      aria-label="Hall of Fame starfield"
    >
      {/* Tiny background stars (pure CSS points) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(#d9c9a3 1px, transparent 1px), radial-gradient(#c9a227 1px, transparent 1px)",
          backgroundSize: "120px 120px, 220px 220px",
          backgroundPosition: "0 0, 60px 80px",
          opacity: 0.35,
        }}
      />

      {/* Tuning-in mask: starts as heavy static, fades away once revealed. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 mix-blend-screen"
        initial={{ opacity: 1 }}
        animate={{ opacity: revealed ? 0 : 1 }}
        transition={{ duration: 1.4 }}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.85 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {floating.map((f) => {
        const isGlitch = glitched.has(f.id);
        const color = COLORS[f.id % COLORS.length];
        return (
          <motion.div
            key={f.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              fontSize: f.fontSize,
              color,
              textShadow: `0 0 6px ${color}66, 0 0 2px #000`,
              filter: `brightness(${0.6 + f.depth * 0.7})`,
              zIndex: Math.round(f.depth * 10),
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: revealed ? 0.4 + f.depth * 0.6 : 0,
              scale: 1,
              x: [0, Math.sin(f.driftSeed * 6.28) * 12, 0],
              y: [0, Math.cos(f.driftSeed * 6.28) * 10, 0],
            }}
            transition={{
              opacity: { duration: 1.6, delay: f.depth * 0.5 },
              scale: { duration: 0.6 },
              x: { duration: 9 + f.driftSeed * 8, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 11 + f.driftSeed * 6, repeat: Infinity, ease: "easeInOut" },
            }}
            title={f.message ? `${f.name} — ${f.message}` : f.name}
          >
            <span
              className="name-glitch font-terminal"
              data-text={f.name}
              data-glitch={isGlitch ? "1" : "0"}
              style={{ position: "relative", display: "inline-block" }}
            >
              {f.name}
            </span>
            {f.message && (
              <div
                className="font-terminal"
                style={{
                  fontSize: Math.max(11, f.fontSize * 0.55),
                  opacity: 0.7,
                  marginTop: 2,
                  maxWidth: 180,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#d9c9a3",
                }}
              >
                「{f.message}」
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Foreground scanlines (local, stronger than global) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0 1px, rgba(0,0,0,0) 2px 3px)",
        }}
      />
    </div>
  );
}
