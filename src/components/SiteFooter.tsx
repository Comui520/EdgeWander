"use client";

import { useI18n } from "@/lib/i18n";

/**
 * The footer is dressed up as the manufacturer's nameplate on the back of
 * the CRT — the kind of silver foil sticker with model number and maker
 * etched on it. The GitHub link lives here as the "manufactured by" line,
 * which lets us credit the author without breaking the illusion that
 * everything on screen is part of one old machine.
 */
export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="relative z-10 mx-auto mt-6 max-w-5xl px-4 pb-10">
      <div className="mx-auto max-w-xl text-center">
        <p className="animate-[flicker_4s_infinite_steps(1)] font-terminal text-base text-crt-bone/60">
          {t("footer.tag")}
        </p>
        <div
          className="mx-auto mt-4 inline-flex items-center gap-3 border border-black/70 bg-gradient-to-b from-[#3a3528] to-[#1a1710] px-3 py-1.5"
          style={{
            boxShadow:
              "inset 1px 1px 0 #6b5e38, inset -1px -1px 0 #06060a, 0 1px 0 rgba(0,0,0,0.5)",
          }}
          aria-label="manufacturer nameplate"
        >
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-crt-green"
            style={{ boxShadow: "0 0 4px #6b8e5a" }}
          />
          <span className="font-pixel text-[0.5rem] tracking-[0.22em] text-crt-bone/60">
            MFG
          </span>
          <a
            href="https://github.com/comui520"
            target="_blank"
            rel="noopener noreferrer"
            className="group font-pixel text-[0.6rem] tracking-[0.18em] text-crt-amber transition-all hover:text-crt-bone"
            style={{
              textShadow:
                "0 0 6px rgba(201, 162, 39, 0.55), 1px 1px 0 #000",
            }}
          >
            <span className="group-hover:hidden">GH/COMUI520</span>
            <span className="hidden group-hover:inline">↗ GITHUB.COM/COMUI520</span>
          </a>
          <span
            aria-hidden
            className="font-pixel text-[0.5rem] tracking-[0.22em] text-crt-bone/40"
          >
            · SER 1998-CN
          </span>
        </div>
      </div>
    </footer>
  );
}
