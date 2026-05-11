"use client";

import { useI18n } from "@/lib/i18n";

/**
 * The footer is dressed up as the back/underside of the CRT — two pieces
 * of old hardware sit side by side: the manufacturer's nameplate (the
 * GitHub credit) and a coin-acceptor slot (the 爱发电 tipjar). Both are
 * labeled like real machine parts, so neither reads as a marketing CTA.
 */
export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="relative z-10 mx-auto mt-6 max-w-5xl px-4 pb-10">
      <div className="mx-auto max-w-xl text-center">
        <p className="animate-[flicker_4s_infinite_steps(1)] font-terminal text-base text-crt-bone/60">
          {t("footer.tag")}
        </p>

        <div className="mt-4 flex flex-wrap items-stretch justify-center gap-2">
          {/* Manufacturer's nameplate — the GitHub credit */}
          <div
            className="inline-flex items-center gap-3 border border-black/70 bg-gradient-to-b from-[#3a3528] to-[#1a1710] px-3 py-1.5"
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
                textShadow: "0 0 6px rgba(201, 162, 39, 0.55), 1px 1px 0 #000",
              }}
            >
              <span className="group-hover:hidden">GH/COMUI520</span>
              <span className="hidden group-hover:inline">
                ↗ GITHUB.COM/COMUI520
              </span>
            </a>
            <span
              aria-hidden
              className="font-pixel text-[0.5rem] tracking-[0.22em] text-crt-bone/40"
            >
              · SER 1998-CN
            </span>
          </div>

          {/* Coin-acceptor — the 爱发电 tipjar. Same bevel grammar, slightly
              warmer metal tone so it reads as a separate faceplate screwed
              to the same chassis. The slot itself is an inset black rect
              with a highlighted amber lip; on hover a coin slides halfway
              in. */}
          <a
            href="https://ifdian.net/a/Comui520"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="tip jar — 爱发电"
            className="group relative inline-flex items-center gap-3 border border-black/70 bg-gradient-to-b from-[#3a2d1a] to-[#1a1208] px-3 py-1.5 transition-transform hover:scale-[1.02]"
            style={{
              boxShadow:
                "inset 1px 1px 0 #8b5a2b, inset -1px -1px 0 #06060a, 0 1px 0 rgba(0,0,0,0.5)",
            }}
          >
            <span
              aria-hidden
              className="relative inline-block h-3.5 w-5 bg-[#06060a]"
              style={{
                boxShadow:
                  "inset 1px 1px 0 #000, inset -1px -1px 0 #5a4210, 0 -1px 0 #d9b43a",
              }}
            >
              <span
                className="absolute left-0.5 right-0.5 top-1 block h-px bg-crt-amber/50"
                style={{ boxShadow: "0 0 4px rgba(201, 162, 39, 0.6)" }}
              />
              <span
                className="absolute left-1/2 top-0.5 block h-1.5 w-2 -translate-x-1/2 scale-y-0 bg-crt-amber transition-transform duration-300 group-hover:scale-y-100"
                style={{
                  boxShadow:
                    "inset 0 1px 0 #f2d06b, inset 0 -1px 0 #5a4210, 0 0 6px rgba(201,162,39,0.6)",
                  transformOrigin: "top",
                }}
              />
            </span>
            <span className="font-pixel text-[0.5rem] tracking-[0.22em] text-crt-bone/60">
              TIP
            </span>
            <span
              className="font-pixel text-[0.6rem] tracking-[0.18em] text-[#e0a15a] transition-colors group-hover:text-crt-bone"
              style={{
                textShadow: "0 0 6px rgba(224, 161, 90, 0.55), 1px 1px 0 #000",
              }}
            >
              {t("footer.tipJar")}
            </span>
            <span
              aria-hidden
              className="font-pixel text-[0.5rem] tracking-[0.22em] text-crt-bone/40"
            >
              · 爱发电
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
