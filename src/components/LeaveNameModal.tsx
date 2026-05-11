"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const NAME_MAX = 24;
const MESSAGE_MAX = 140;

type Status =
  | { kind: "idle" }
  | { kind: "writing" }
  | { kind: "ok"; pinned: boolean }
  | { kind: "err" }
  | { kind: "tooFast"; sec: number }
  | { kind: "daily" }
  | { kind: "noLinks" };

export function LeaveNameModal() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const submitting = status.kind === "writing";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setStatus({ kind: "writing" });
    try {
      const res = await fetch("/api/names", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      if (res.status === 429) {
        const data = await res
          .json()
          .catch(() => ({ error: "too_fast", retryAfter: 60 }));
        if (data.error === "daily_limit") {
          setStatus({ kind: "daily" });
        } else {
          setStatus({ kind: "tooFast", sec: Number(data.retryAfter) || 60 });
        }
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === "no_links") {
          setStatus({ kind: "noLinks" });
          return;
        }
        setStatus({ kind: "err" });
        return;
      }

      const data = (await res.json()) as { pinned?: boolean };
      setStatus({ kind: "ok", pinned: Boolean(data.pinned) });
      setName("");
      setMessage("");
      // Keep the modal open a bit longer when pinned so the user actually
      // reads the "you're eternal" line. Otherwise auto-close quickly.
      setTimeout(() => setOpen(false), data.pinned ? 2600 : 1200);
    } catch {
      setStatus({ kind: "err" });
    }
  }

  const statusText = (() => {
    switch (status.kind) {
      case "writing":
        return t("modal.status.writing");
      case "ok":
        return status.pinned
          ? t("modal.status.pinned")
          : t("modal.status.ok");
      case "err":
        return t("modal.status.err");
      case "tooFast":
        return t("modal.status.tooFast", { sec: status.sec });
      case "daily":
        return t("modal.status.daily");
      case "noLinks":
        return t("modal.status.noLinks");
      case "idle":
      default:
        return t("modal.status.idle");
    }
  })();

  const isPinnedOk = status.kind === "ok" && status.pinned;
  const isError =
    status.kind === "err" ||
    status.kind === "tooFast" ||
    status.kind === "daily" ||
    status.kind === "noLinks";

  return (
    <>
      <button
        className="retro-button retro-button--danger"
        onClick={() => setOpen(true)}
      >
        ✎ {t("home.leaveName")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/75" />
            <motion.form
              onSubmit={submit}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 12, filter: "blur(8px)" }}
              animate={{ scale: 1, y: 0, filter: "blur(0)" }}
              exit={{ scale: 0.95, y: 8, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="retro-panel relative z-10 w-full max-w-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-pixel text-[0.7rem] tracking-widest text-crt-amber">
                  {t("modal.title")}
                </h3>
                <button
                  type="button"
                  className="font-pixel text-[0.7rem] text-crt-bone/70 hover:text-crt-blood"
                  onClick={() => setOpen(false)}
                  aria-label="close"
                >
                  ✕
                </button>
              </div>

              <label className="mb-3 block font-terminal text-base text-crt-bone/80">
                <div className="flex items-baseline justify-between">
                  <span>{t("modal.name")}</span>
                  <span
                    className="font-pixel text-[0.55rem] tracking-widest"
                    style={{
                      color:
                        name.length >= NAME_MAX ? "#7a2828" : "rgba(217,201,163,0.55)",
                    }}
                  >
                    {t("modal.counter", { n: name.length, max: NAME_MAX })}
                  </span>
                </div>
                <input
                  className="retro-input mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={NAME_MAX}
                  placeholder={t("modal.namePlaceholder")}
                  autoFocus
                />
              </label>

              <label className="mb-4 block font-terminal text-base text-crt-bone/80">
                <div className="flex items-baseline justify-between">
                  <span>{t("modal.message")}</span>
                  <span
                    className="font-pixel text-[0.55rem] tracking-widest"
                    style={{
                      color:
                        message.length >= MESSAGE_MAX
                          ? "#7a2828"
                          : "rgba(217,201,163,0.55)",
                    }}
                  >
                    {t("modal.counter", { n: message.length, max: MESSAGE_MAX })}
                  </span>
                </div>
                <textarea
                  className="retro-input mt-1 h-24 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MESSAGE_MAX}
                  placeholder={t("modal.msgPlaceholder")}
                />
              </label>

              <div className="flex items-center justify-between gap-3">
                <span
                  className="font-terminal text-sm"
                  style={{
                    color: isError
                      ? "#e07a5a"
                      : isPinnedOk
                      ? "#f2d06b"
                      : "rgba(217,201,163,0.6)",
                    textShadow: isPinnedOk
                      ? "0 0 6px rgba(242, 208, 107, 0.7)"
                      : undefined,
                  }}
                >
                  {statusText}
                </span>
                <button
                  type="submit"
                  disabled={!name.trim() || submitting}
                  className="retro-button !px-3 !py-2 !text-[0.62rem]"
                >
                  {submitting ? t("modal.submitting") : t("modal.submit")}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
