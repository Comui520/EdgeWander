"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function LeaveNameModal() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

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
    setSubmitting(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/names", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (!res.ok) {
        setStatus("err");
        return;
      }
      setStatus("ok");
      setName("");
      setMessage("");
      setTimeout(() => setOpen(false), 1200);
    } catch {
      setStatus("err");
    } finally {
      setSubmitting(false);
    }
  }

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
                {t("modal.name")}
                <input
                  className="retro-input mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={24}
                  placeholder={t("modal.namePlaceholder")}
                  autoFocus
                />
              </label>

              <label className="mb-4 block font-terminal text-base text-crt-bone/80">
                {t("modal.message")}
                <textarea
                  className="retro-input mt-1 h-24 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={140}
                  placeholder={t("modal.msgPlaceholder")}
                />
              </label>

              <div className="flex items-center justify-between gap-3">
                <span className="font-terminal text-sm text-crt-bone/60">
                  {submitting
                    ? t("modal.status.writing")
                    : status === "ok"
                    ? t("modal.status.ok")
                    : status === "err"
                    ? t("modal.status.err")
                    : t("modal.status.idle")}
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
