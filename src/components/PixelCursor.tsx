"use client";

import { useEffect, useRef } from "react";

/**
 * A CRT-era pixel reticle that replaces the native cursor on pointer devices.
 *
 * Design notes:
 * - Native cursor is hidden via CSS (`html[data-pixel-cursor="1"]`) only when
 *   we actually enable ourselves. On touch devices and when the user has
 *   `prefers-reduced-motion: reduce`, we do nothing — the native cursor
 *   stays on, no DOM nodes are rendered.
 * - The main reticle lerps toward the true pointer position with a moderate
 *   ease; the phosphor ghost lerps slower, producing a short trail.
 * - Over anything interactive (`a`, `button`, `[role="button"]`, form
 *   controls), the reticle switches to a tighter, phosphor-green variant —
 *   communicated through `data-cursor-state` on the root.
 */
export function PixelCursor() {
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const touch = window.matchMedia("(hover: none)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (touch || reduced) return;

    const root = document.documentElement;
    root.setAttribute("data-pixel-cursor", "1");

    let targetX = -100;
    let targetY = -100;
    let reticleX = -100;
    let reticleY = -100;
    let ghostX = -100;
    let ghostY = -100;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const isInteractive = (el: EventTarget | null): boolean => {
      if (!(el instanceof Element)) return false;
      return Boolean(
        el.closest(
          'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]',
        ),
      );
    };

    const onOver = (e: PointerEvent) => {
      root.setAttribute(
        "data-cursor-state",
        isInteractive(e.target) ? "hover" : "idle",
      );
    };

    const onDown = () => {
      root.setAttribute("data-cursor-state", "down");
    };
    const onUp = (e: PointerEvent) => {
      root.setAttribute(
        "data-cursor-state",
        isInteractive(e.target) ? "hover" : "idle",
      );
    };

    const onLeave = () => {
      targetX = -100;
      targetY = -100;
    };

    const tick = () => {
      // Main reticle: snappy (~50% per frame)
      reticleX += (targetX - reticleX) * 0.5;
      reticleY += (targetY - reticleY) * 0.5;
      // Ghost: lazy (~18% per frame) — produces the phosphor tail
      ghostX += (targetX - ghostX) * 0.18;
      ghostY += (targetY - ghostY) * 0.18;

      if (reticleRef.current) {
        reticleRef.current.style.transform = `translate3d(${
          reticleX - 10
        }px, ${reticleY - 10}px, 0)`;
      }
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${ghostX - 4}px, ${
          ghostY - 4
        }px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      root.removeAttribute("data-pixel-cursor");
      root.removeAttribute("data-cursor-state");
    };
  }, []);

  return (
    <>
      <div ref={ghostRef} className="pixel-cursor-ghost" aria-hidden />
      <div ref={reticleRef} className="pixel-cursor" aria-hidden>
        <span className="pixel-cursor-ring" />
        <span className="pixel-cursor-arm pixel-cursor-arm--n" />
        <span className="pixel-cursor-arm pixel-cursor-arm--s" />
        <span className="pixel-cursor-arm pixel-cursor-arm--w" />
        <span className="pixel-cursor-arm pixel-cursor-arm--e" />
        <span className="pixel-cursor-dot" />
      </div>
    </>
  );
}
