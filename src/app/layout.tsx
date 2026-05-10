import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { CrtOverlay } from "@/components/CrtOverlay";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EdgeWander // 时光机随机跳转",
  description:
    "Wander to a random corner of the archived early internet. A time machine for the abandoned web.",
};

export const viewport: Viewport = {
  themeColor: "#1a1d14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${pressStart.variable} ${vt323.variable}`}>
      <body>
        <CrtOverlay />
        <header className="relative z-10 border-b-2 border-black/70 bg-black/40 backdrop-blur-[1px]">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link
              href="/"
              className="font-pixel text-[0.85rem] tracking-widest text-crt-amber hover:text-crt-bone"
            >
              ◩ EDGEWANDER
            </Link>
            <nav className="flex items-center gap-2 font-pixel text-[0.62rem] tracking-wider">
              <Link
                href="/"
                className="retro-button retro-button--ghost !py-2 !px-3 !text-[0.62rem]"
              >
                穿越 / WANDER
              </Link>
              <Link
                href="/hall"
                className="retro-button retro-button--ghost !py-2 !px-3 !text-[0.62rem]"
              >
                名人堂 / HALL
              </Link>
            </nav>
          </div>
        </header>
        <main className="relative z-10 mx-auto max-w-5xl px-4 py-6 md:py-10">
          {children}
        </main>
        <footer className="relative z-10 mx-auto max-w-5xl px-4 py-8 text-center font-terminal text-base text-crt-bone/60">
          <p className="animate-[flicker_4s_infinite_steps(1)]">
            [ SIGNAL LOST ] — this CRT has been glowing since 1998.
          </p>
        </footer>
      </body>
    </html>
  );
}
