import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { CrtOverlay } from "@/components/CrtOverlay";
import { PixelCursor } from "@/components/PixelCursor";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { I18nProvider } from "@/lib/i18n";

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
    <html lang="zh" className={`${pressStart.variable} ${vt323.variable}`}>
      <body>
        <I18nProvider>
          <CrtOverlay />
          <PixelCursor />
          <SiteHeader />
          <main className="relative z-10 mx-auto max-w-5xl px-4 py-6 md:py-10">
            {children}
          </main>
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
