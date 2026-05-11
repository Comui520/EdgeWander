"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export type CardEntry = {
  name: string;
  message: string;
  at: number;
  pinned: boolean;
  pinnedIndex?: number; // 1-based for display
};

/**
 * Detail card shown when a star is clicked in the NameSky. Shares the
 * visual vocabulary of LeaveNameModal — same retro-panel bevel, same
 * blur-fade-in, same ESC / click-outside close behavior — so the user
 * only has to learn one modal in this whole app.
 *
 * Non-interactive (read-only): no form, just typography + a status chip
 * at the top distinguishing eternal signers from recent ones.
 */
export function NameCard({
  entry,
  onClose,
}: {
  entry: CardEntry | null;
  onClose: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (entry) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entry, onClose]);

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/75" />
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 12, filter: "blur(8px)" }}
            animate={{ scale: 1, y: 0, filter: "blur(0)" }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="retro-panel relative z-10 w-full max-w-md"
            role="dialog"
            aria-modal="true"
          >
            {/* Header row: a status chip on the left, close X on the right.
                The chip color tells you whether this person is eternal
                (amber) or simply among the most-recent (phosphor green). */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <span
                className="inline-flex items-center gap-2 border px-2 py-1 font-pixel text-[0.55rem] tracking-[0.18em]"
                style={
                  entry.pinned
                    ? {
                        color: "#1a1710",
                        background:
                          "linear-gradient(180deg, #f2d06b 0%, #c9a227 100%)",
                        borderColor: "#0d0f08",
                        boxShadow:
                          "inset 1px 1px 0 #f5e1c4, inset -1px -1px 0 #5a4210",
                      }
                    : {
                        color: "#c7dcbe",
                        background:
                          "linear-gradient(180deg, #2e3624 0%, #1a1d14 100%)",
                        borderColor: "#0d0f08",
                        boxShadow:
                          "inset 1px 1px 0 #6b8e5a, inset -1px -1px 0 #0d0f08",
                      }
                }
              >
                <span aria-hidden>
                  {entry.pinned ? "✦" : "☷"}
                </span>
                {entry.pinned
                  ? t("hall.card.pinned", {
                      n: String(entry.pinnedIndex ?? 0).padStart(3, "0"),
                    })
                  : t("hall.card.recent")}
              </span>

              <button
                type="button"
                className="font-pixel text-[0.7rem] text-crt-bone/70 hover:text-crt-blood"
                onClick={onClose}
                aria-label="close"
              >
                ✕
              </button>
            </div>

            {/* Name — the main attraction. Pixel font, brighter if eternal. */}
            <div
              className="mb-4 break-words font-pixel text-[1.05rem] leading-[1.5] tracking-[0.04em] sm:text-[1.25rem]"
              style={{
                color: entry.pinned ? "#f2d06b" : "#d9c9a3",
                textShadow: entry.pinned
                  ? "0 0 12px rgba(242, 208, 107, 0.55), 2px 2px 0 #3a2a08"
                  : "0 0 6px rgba(217, 201, 163, 0.35), 1px 1px 0 #06060a",
              }}
            >
              {entry.name}
            </div>

            {/* Message, if any — in the VT323 terminal face, inside 「 」 */}
            {entry.message ? (
              <div
                className="mb-4 break-words font-terminal text-lg leading-[1.55] text-crt-bone/90 sm:text-xl"
                style={{ whiteSpace: "pre-wrap" }}
              >
                <span
                  aria-hidden
                  style={{
                    color: entry.pinned ? "#c9a227" : "#6b8e5a",
                    marginRight: 4,
                  }}
                >
                  「
                </span>
                {entry.message}
                <span
                  aria-hidden
                  style={{
                    color: entry.pinned ? "#c9a227" : "#6b8e5a",
                    marginLeft: 4,
                  }}
                >
                  」
                </span>
              </div>
            ) : (
              <div className="mb-4 font-terminal text-base italic text-crt-bone/40">
                — {t("modal.msgPlaceholder")}
              </div>
            )}

            {/* Footer: etch timestamp + relative time, whispered. */}
            {entry.at > 0 && (
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-black/70 pt-3 font-pixel text-[0.5rem] tracking-[0.22em] text-crt-bone/45">
                <span>
                  {t("hall.card.etched")} {formatAbsolute(entry.at)}
                </span>
                <span>{formatRelative(entry.at, t)}</span>
              </div>
            )}

            <div className="mt-4 text-right font-terminal text-sm text-crt-bone/40">
              {t("hall.card.close")}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatAbsolute(at: number): string {
  const d = new Date(at);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function formatRelative(
  at: number,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const sec = Math.max(0, Math.floor((Date.now() - at) / 1000));
  if (sec < 60) return t("hall.card.justNow");
  const min = Math.floor(sec / 60);
  if (min < 60) return t("hall.card.minutesAgo", { n: min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t("hall.card.hoursAgo", { n: hr });
  const day = Math.floor(hr / 24);
  return t("hall.card.daysAgo", { n: day });
}
