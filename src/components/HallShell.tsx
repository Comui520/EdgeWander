"use client";

import { LeaveNameModal } from "@/components/LeaveNameModal";
import { NameSky } from "@/components/NameSky";
import type { NameEntry } from "@/lib/names";
import { useI18n } from "@/lib/i18n";

/**
 * Client-side shell for the Hall page. The server component pre-fetches
 * entries from Redis and hands them as `seed`; we then pass them through
 * to NameSky (which also re-fetches live). Splitting this off the server
 * page lets us consume the i18n context for bilingual copy.
 */
export function HallShell({
  seed,
  total,
  isEmpty,
}: {
  seed: NameEntry[];
  total: number;
  isEmpty: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="pixel-title text-[1.15rem] sm:text-[1.5rem]"
            data-text="HALL OF FAME"
          >
            {t("hall.title")}
          </h1>
          <p className="mt-2 font-terminal text-lg text-crt-bone/75">
            {t("hall.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="retro-panel !p-2 font-pixel text-[0.62rem] tracking-widest text-crt-amber">
            {t("hall.total")} : {total.toString().padStart(5, "0")}
          </div>
          <LeaveNameModal />
        </div>
      </header>

      <NameSky fallback={seed} />

      {isEmpty && (
        <p className="font-terminal text-base text-crt-bone/50">
          {t("hall.empty")}
        </p>
      )}
    </div>
  );
}
