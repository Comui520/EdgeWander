"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";

/**
 * Brushed-metal control strip screwed to the top of the CRT bezel. Replaces
 * the old bare nav: the bevel, screws, and horizontal grain give the nav
 * links a legible surface to sit on without breaking the "physical object"
 * illusion. Visibility problem solved at the level of the world, not by
 * slapping on a background color.
 */
export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();

  const onHome = pathname === "/" || pathname === "";
  const onHall = pathname === "/hall" || pathname?.startsWith("/hall");

  return (
    <header className="relative z-10 px-2 pt-3 sm:px-4">
      <div className="control-strip mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        {/* four screws at the corners */}
        <span
          className="control-strip-screw"
          style={{ top: 4, left: 4, ["--screw-rot" as string]: "22" }}
          aria-hidden
        />
        <span
          className="control-strip-screw"
          style={{ top: 4, right: 4, ["--screw-rot" as string]: "-18" }}
          aria-hidden
        />
        <span
          className="control-strip-screw"
          style={{ bottom: 4, left: 4, ["--screw-rot" as string]: "48" }}
          aria-hidden
        />
        <span
          className="control-strip-screw"
          style={{ bottom: 4, right: 4, ["--screw-rot" as string]: "-60" }}
          aria-hidden
        />

        <Link
          href="/"
          className="group relative flex items-center gap-2 pl-2 font-pixel text-[0.7rem] tracking-[0.15em]"
        >
          <span
            aria-hidden
            className="inline-block h-2 w-2 bg-crt-amber"
            style={{
              boxShadow:
                "0 0 6px #c9a227, 0 0 10px rgba(201, 162, 39, 0.6)",
            }}
          />
          <span
            className="text-crt-amber"
            style={{
              textShadow:
                "0 0 8px rgba(201, 162, 39, 0.65), 1px 1px 0 #000",
            }}
          >
            {t("brand.name")}
          </span>
          <span className="hidden font-terminal text-base text-crt-bone/60 sm:inline">
            {t("brand.tagline")}
          </span>
        </Link>

        <nav className="relative flex items-center gap-2">
          <Link
            href="/"
            className="nav-chip"
            data-active={onHome ? "true" : undefined}
          >
            <span
              className={
                "nav-chip-led " + (onHome ? "" : "nav-chip-led--green")
              }
              aria-hidden
            />
            {t("nav.wander")}
          </Link>
          <Link
            href="/hall"
            className="nav-chip"
            data-active={onHall ? "true" : undefined}
          >
            <span
              className={
                "nav-chip-led " + (onHall ? "" : "nav-chip-led--green")
              }
              aria-hidden
            />
            {t("nav.hall")}
          </Link>
          <span
            aria-hidden
            className="mx-1 hidden h-6 w-px bg-black/70 sm:block"
            style={{ boxShadow: "1px 0 0 #3e3a25" }}
          />
          <LangSwitch />
        </nav>
      </div>
    </header>
  );
}
