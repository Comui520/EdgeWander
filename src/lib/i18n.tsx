"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang = "zh" | "en";

/**
 * Flat dictionary, keyed by a dot-ish path. Keep the two languages in lockstep
 * — if you add a key to one, add it to the other. The site is bilingual by
 * design; missing keys surface as `[[key]]` in the UI so they're obvious.
 */
const DICT: Record<Lang, Record<string, string>> = {
  zh: {
    "brand.name": "EDGEWANDER",
    "brand.tagline": "时 光 机 · TIME MACHINE",
    "nav.wander": "穿越",
    "nav.hall": "名人堂",
    "lang.label": "语言",

    "home.hero.sub": "RANDOM · WANDER · 1996-2010",
    "home.hero.intro":
      "这是一台挖自废弃硬盘的浏览器。按下按钮，它会把你扔进 Internet Archive 某个被遗忘的角落 —— 一个 GeoCities 的主页、一个 2001 年的论坛、或者某人早已停更的 LiveJournal。",
    "home.leaveName": "青史留名",
    "home.hallOfFame": "名人堂",

    "tm.title": "选择年份区间",
    "tm.titleSub": "SELECT ERA",
    "tm.era.1": "1996-1999 // 拨号时代",
    "tm.era.2": "2000-2003 // 千禧互联",
    "tm.era.3": "2004-2007 // 博客纪元",
    "tm.era.4": "2008-2010 // Web 2.0 残响",
    "tm.era.5": "1996-2010 // 全域随机",
    "tm.wander": "▶ 随机穿越",
    "tm.wander.loading": "▓▓ 解调制中 ▓▓",
    "tm.caption": "点击按钮即随机跳转到一个来自 {from}-{to} 的存档网页。",
    "tm.error": "时光机失联。再试一次。",
    "tm.error.conn": "连接档案馆失败。再试一次。",
    "tm.result.locked": "☷ SIGNAL LOCKED — {date}",
    "tm.result.host": "host: {host} · 点击在新窗口打开 Wayback 快照 ↗",
    "tm.loader.1": "DIALING INTERNET ARCHIVE ...",
    "tm.loader.2": "HANDSHAKE ... 56k",
    "tm.loader.3": "CDX LOOKUP — RACING 6 DOMAINS",
    "tm.loader.4": "LONG HAUL TO web.archive.org ...",
    "tm.loader.5": "STILL LISTENING FOR A CARRIER ...",

    "readme.title": "▲ 系统提示",
    "readme.sub": "/ README",
    "readme.1": "存档数据来自 Wayback Machine — 有些网页图片已经失踪，只剩文字骸骨。",
    "readme.2": "如果拨号失败，点一次「随机穿越」再试，档案馆偶尔会打喷嚏。",
    "readme.3": "链接会在新窗口打开。别忘了带上锡箔纸。",

    "modal.title": "▣ 刻下你的名字",
    "modal.name": "名字",
    "modal.message": "留言 (可选)",
    "modal.namePlaceholder": "张三",
    "modal.msgPlaceholder": "到此一游",
    "modal.submit": "刻碑",
    "modal.submitting": "写入中",
    "modal.status.writing": "数据写入中 ... 磁盘卡顿 ▓▓▓",
    "modal.status.ok": "✓ 已刻入历史",
    "modal.status.err": "! 写入失败",
    "modal.status.idle": "按 ESC 或点外部关闭",

    "hall.title": "✧ 名 人 堂",
    "hall.subtitle":
      "每一颗漂浮的星，都曾按下过「青史留名」。信号不稳时他们会短暂扭曲。",
    "hall.total": "总计",
    "hall.empty": "* 当前展示为示例数据。第一个真实留名者将永远闪亮。",

    "footer.tag": "[ SIGNAL LOST ] — this CRT has been glowing since 1998.",
    "counter.label": "访客计数",
  },
  en: {
    "brand.name": "EDGEWANDER",
    "brand.tagline": "◩ TIME MACHINE · 时光机",
    "nav.wander": "WANDER",
    "nav.hall": "HALL",
    "lang.label": "LANG",

    "home.hero.sub": "RANDOM · WANDER · 1996-2010",
    "home.hero.intro":
      "A browser unearthed from an abandoned hard drive. Press the button and it tosses you into a forgotten corner of the Internet Archive — a GeoCities homepage, a 2001 forum thread, or someone's long-silent LiveJournal.",
    "home.leaveName": "LEAVE YOUR NAME",
    "home.hallOfFame": "HALL OF FAME",

    "tm.title": "SELECT ERA",
    "tm.titleSub": "// 选择年份区间",
    "tm.era.1": "1996-1999 // DIAL-UP DAYS",
    "tm.era.2": "2000-2003 // MILLENNIAL WEB",
    "tm.era.3": "2004-2007 // BLOG ERA",
    "tm.era.4": "2008-2010 // WEB 2.0 ECHOES",
    "tm.era.5": "1996-2010 // FULL RANDOM",
    "tm.wander": "▶ WANDER",
    "tm.wander.loading": "▓▓ DEMODULATING ▓▓",
    "tm.caption":
      "Click to hop to a random archived page captured between {from} and {to}.",
    "tm.error": "Time machine lost signal. Try again.",
    "tm.error.conn": "Could not reach the archive. Try again.",
    "tm.result.locked": "☷ SIGNAL LOCKED — {date}",
    "tm.result.host": "host: {host} · opens the Wayback capture in a new tab ↗",
    "tm.loader.1": "DIALING INTERNET ARCHIVE ...",
    "tm.loader.2": "HANDSHAKE ... 56k",
    "tm.loader.3": "CDX LOOKUP — RACING 6 DOMAINS",
    "tm.loader.4": "LONG HAUL TO web.archive.org ...",
    "tm.loader.5": "STILL LISTENING FOR A CARRIER ...",

    "readme.title": "▲ SYSTEM NOTES",
    "readme.sub": "/ README",
    "readme.1":
      "Captures come from the Wayback Machine — some images have gone missing, only the text skeletons remain.",
    "readme.2":
      "If dialing fails, click WANDER again — the archive occasionally sneezes.",
    "readme.3": "Links open in a new window. Bring your tinfoil hat.",

    "modal.title": "▣ CARVE YOUR NAME",
    "modal.name": "NAME",
    "modal.message": "MESSAGE (optional)",
    "modal.namePlaceholder": "anon1998",
    "modal.msgPlaceholder": "i was here",
    "modal.submit": "ENGRAVE",
    "modal.submitting": "WRITING",
    "modal.status.writing": "WRITING TO DISK ... SEEK STUTTER ▓▓▓",
    "modal.status.ok": "✓ ETCHED INTO HISTORY",
    "modal.status.err": "! WRITE FAILED",
    "modal.status.idle": "ESC or click outside to close",

    "hall.title": "✧ HALL OF FAME",
    "hall.subtitle":
      "Every drifting star once pressed LEAVE YOUR NAME. Bad signal warps them briefly.",
    "hall.total": "TOTAL",
    "hall.empty":
      "* Showing sample data. The first real signer will shine forever.",

    "footer.tag": "[ SIGNAL LOST ] — this CRT has been glowing since 1998.",
    "counter.label": "VISITORS",
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

const STORAGE_KEY = "edgewander:lang";

function detectInitial(): Lang {
  if (typeof window === "undefined") return "zh";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "zh" || stored === "en") return stored;
  // First visit: use the browser's preferred language. Default to zh for CJK
  // users, en for everyone else.
  const nav = window.navigator.language || "";
  return nav.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh"); // SSR default — client hydrates with detected value

  useEffect(() => {
    setLangState(detectInitial());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "zh" ? "en" : "zh");
  }, [lang, setLang]);

  const t = useCallback<Ctx["t"]>(
    (key, vars) => {
      const s = DICT[lang][key];
      if (s === undefined) return `[[${key}]]`;
      return interpolate(s, vars);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return ctx;
}
