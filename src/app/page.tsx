import Link from "next/link";
import { LeaveNameModal } from "@/components/LeaveNameModal";
import { TimeMachine } from "@/components/TimeMachine";
import { VisitorCounter } from "@/components/VisitorCounter";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-5 pt-4 text-center">
        <VisitorCounter />

        <h1
          className="pixel-title pixel-title--flicker relative text-[1.1rem] leading-[1.7] sm:text-[1.6rem] md:text-[2rem]"
          data-text="TIME  MACHINE"
        >
          ▙ 时 光 机 ▟
          <br />
          <span className="pixel-title--flicker text-crt-bone">
            RANDOM · WANDER · 1996-2010
          </span>
        </h1>

        <p className="font-terminal text-lg text-crt-bone/75 max-w-xl">
          这是一台挖自废弃硬盘的浏览器。按下按钮，它会把你扔进
          Internet Archive 某个被遗忘的角落 —— 一个 GeoCities 的主页、一个
          2001 年的论坛、或者某人早已停更的 LiveJournal。
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <LeaveNameModal />
          <Link
            href="/hall"
            className="retro-button retro-button--ghost"
          >
            ✦ 名人堂 · HALL OF FAME
          </Link>
        </div>
      </section>

      <TimeMachine />

      <section className="retro-panel">
        <h2 className="font-pixel text-[0.72rem] tracking-widest text-crt-green">
          ▲ 系统提示 / README
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 font-terminal text-lg text-crt-bone/80">
          <li>
            存档数据来自 Wayback Machine — 有些网页图片已经失踪，只剩文字骸骨。
          </li>
          <li>如果拨号失败，点一次「随机穿越」再试，档案馆偶尔会打喷嚏。</li>
          <li>链接会在新窗口打开。别忘了带上锡箔纸。</li>
        </ul>
      </section>
    </div>
  );
}
