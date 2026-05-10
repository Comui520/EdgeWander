"use client";

import { useI18n } from "@/lib/i18n";

/**
 * A two-position slide switch, rendered as a tiny 1998-motherboard DIP
 * jumper. Pressing it physically slides the bone-colored slug between
 * EN (pos 0) and 中 (pos 1). No icons, no flags — just the characters
 * themselves, which feels less like a "widget" and more like a label
 * etched on a piece of hardware.
 */
export function LangSwitch() {
  const { lang, toggle, t } = useI18n();
  const pos = lang === "zh" ? 1 : 0;

  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="font-pixel text-[0.5rem] tracking-[0.25em] text-crt-bone/50"
      >
        {t("lang.label")}
      </span>
      <button
        role="switch"
        aria-checked={lang === "zh"}
        aria-label="toggle language"
        className="dip-switch"
        data-pos={pos}
        onClick={toggle}
      >
        <span className="dip-switch-slider" aria-hidden />
        <span
          className="dip-switch-label"
          data-active={lang === "en"}
        >
          EN
        </span>
        <span
          className="dip-switch-label"
          data-active={lang === "zh"}
        >
          中
        </span>
      </button>
    </div>
  );
}
