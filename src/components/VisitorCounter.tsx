"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires a single POST /api/visit per *browser tab load* (guarded by
 * sessionStorage so navigating between pages doesn't double-count), then
 * displays the total with a per-digit reel animation whenever the number
 * changes.
 */
export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const prevRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const alreadyCounted =
          typeof window !== "undefined" &&
          sessionStorage.getItem("edgewander:counted") === "1";

        const res = await fetch(alreadyCounted ? "/api/visit" : "/api/visit", {
          method: alreadyCounted ? "GET" : "POST",
          cache: "no-store",
        });
        const data = (await res.json()) as { count?: number };
        if (cancelled) return;
        setCount(Number(data.count ?? 0));
        if (!alreadyCounted && typeof window !== "undefined") {
          sessionStorage.setItem("edgewander:counted", "1");
        }
      } catch {
        if (!cancelled) setCount(0);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const display = (count ?? 0).toString().padStart(7, "0");
  const digits = display.split("");
  const prev = prevRef.current.padStart(7, "0").split("");
  prevRef.current = display;

  return (
    <div className="retro-panel inline-flex items-center gap-3 px-4 py-2">
      <span className="font-pixel text-[0.6rem] tracking-widest text-crt-bone/80">
        访客计数 / VISITORS
      </span>
      <span
        className="font-pixel text-[1.15rem] text-crt-amber"
        aria-live="polite"
      >
        {digits.map((d, i) => (
          <span
            key={i}
            className="digit-reel"
            style={{
              background: "#0d0f08",
              padding: "2px 3px",
              margin: "0 1px",
              boxShadow: "inset 1px 1px 0 #000, inset -1px -1px 0 #3e3a25",
            }}
          >
            <span key={`${i}-${d}-${prev[i] ?? ""}`}>{d}</span>
          </span>
        ))}
      </span>
    </div>
  );
}
