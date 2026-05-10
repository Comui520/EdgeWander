"use client";

import Link from "next/link";
import { LeaveNameModal } from "@/components/LeaveNameModal";
import { TimeMachine } from "@/components/TimeMachine";
import { VisitorCounter } from "@/components/VisitorCounter";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t, lang } = useI18n();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-5 pt-4 text-center">
        <VisitorCounter />

        <h1
          className="pixel-title pixel-title--flicker relative text-[1.1rem] leading-[1.7] sm:text-[1.6rem] md:text-[2rem]"
          data-text="TIME  MACHINE"
        >
          {lang === "zh" ? "▙ 时 光 机 ▟" : "▙ TIME  MACHINE ▟"}
          <br />
          <span className="pixel-title--flicker text-crt-bone">
            {t("home.hero.sub")}
          </span>
        </h1>

        <p className="max-w-xl font-terminal text-lg text-crt-bone/75">
          {t("home.hero.intro")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <LeaveNameModal />
          <Link href="/hall" className="retro-button retro-button--ghost">
            ✦ {t("home.hallOfFame")}
          </Link>
        </div>
      </section>

      <TimeMachine />

      <section className="retro-panel">
        <h2 className="font-pixel text-[0.72rem] tracking-widest text-crt-green">
          {t("readme.title")} {t("readme.sub")}
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 font-terminal text-lg text-crt-bone/80">
          <li>{t("readme.1")}</li>
          <li>{t("readme.2")}</li>
          <li>{t("readme.3")}</li>
        </ul>
      </section>
    </div>
  );
}
