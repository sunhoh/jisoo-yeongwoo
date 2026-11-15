"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Star3D } from "@/components/ui/star-3d";
import { startBgm } from "./bgm";
import { FluidLayer } from "./fluid-layer";
import { StudioLight } from "./studio-light";
import { requestMotionPermission } from "@/lib/tilt";
import { cn } from "@/lib/utils";

const SEEN_KEY = "intro";
const LEAVE = 1100;

/**
 * 첫 화면 오프닝: 3D 별 → 손글씨처럼 써지는 이름 → 날짜 → "touch to open".
 * 탭하면 걷히면서 <html data-opened> 를 달아 커버 등장 애니메이션을 시작시킨다.
 * 오프닝 화면은 FluidLayer로 다시 그려 포인터를 따라 물처럼 일렁인다.
 * 탭은 배경음악 시작과 iOS 기울기 권한 요청도 겸한다. 같은 탭 세션에서 다시 열면 건너뛴다.
 */
export function Intro({ names, date }: { names: string; date: string }) {
  const [phase, setPhase] = useState<"show" | "leave" | "gone">("show");
  const closing = useRef(false);
  const overlay = useRef<HTMLDivElement>(null);

  const open = useCallback((withMotion: boolean) => {
    if (closing.current) return;
    closing.current = true;
    if (withMotion) {
      // 둘 다 사용자 탭 안에서 바로 불러야 브라우저가 허락한다
      startBgm();
      void requestMotionPermission();
    }
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    document.documentElement.dataset.opened = "";
    setPhase("leave");
    setTimeout(() => setPhase("gone"), LEAVE);
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen) {
      open(false);
      return;
    }
    // 자동으로 넘어가지 않는다. 탭해야 열린다.
    // JS가 붙었다는 표시: 이게 없을 때만 CSS 안전장치가 오프닝을 치운다
    overlay.current?.setAttribute("data-ready", "");
  }, [open]);

  // 오프닝이 떠 있는 동안 뒤 페이지 스크롤 잠금
  useEffect(() => {
    if (phase === "gone") return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      ref={overlay}
      role="button"
      tabIndex={0}
      aria-label="청첩장 열기"
      onClick={() => open(true)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open(true)}
      // 폰에서 손가락으로 끌 때 브라우저가 스크롤 제스처로 가로채지 않게 해서 일렁임이 손가락을 따라가게 한다.
      // (인트로는 원래 스크롤이 없는 화면이라 잃는 동작이 없다)
      style={{ touchAction: "none" }}
      className={cn(
        "fixed inset-0 z-[70] flex cursor-pointer flex-col items-center justify-center bg-paper outline-none select-none",
        "transition-[opacity,filter,transform] duration-[1100ms] ease-soft",
        // JS가 아예 안 붙어 탭을 받을 수 없을 때만 12초 뒤 CSS로 사라진다
        "not-data-ready:animate-intro-failsafe",
        phase === "leave" &&
          "pointer-events-none scale-[1.03] opacity-0 blur-md",
      )}
    >
      <FluidLayer background="#ffffff" />

      {/* 조명이 떨어지는 스튜디오 공간 */}
      <StudioLight />

      {/* 일렁임이 켜지면 아래 요소들은 캔버스가 대신 그리고, 원래 요소는 화면에서만 숨긴다 */}
      <div
        data-fluid-image
        className="relative motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-90 motion-safe:fill-mode-both motion-safe:[animation-duration:1600ms] in-data-fluid:invisible"
      >
        <Star3D size={44} />
      </div>

      <p
        data-fluid-text
        className="intro-handwriting relative mt-8 px-[0.3em] font-script text-[clamp(30px,10vw,42px)] leading-[1.4] tracking-[1px] whitespace-nowrap text-ink in-data-fluid:text-transparent"
      >
        {names}
      </p>

      <p
        data-fluid-text
        data-fluid-color="rgb(17 17 17 / 0.65)"
        className="type-caption relative mt-2 tracking-[0.2em] text-ink-soft lining-nums in-data-fluid:text-transparent motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both motion-safe:[animation-delay:2600ms] motion-safe:[animation-duration:1200ms]"
      >
        {date}
      </p>

      <p className="type-meta absolute bottom-[12vh] tracking-[0.3em] uppercase motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both motion-safe:[animation-delay:3400ms] motion-safe:[animation-duration:1200ms]">
        <span
          data-fluid-text
          data-fluid-color="#7f7d77"
          className="motion-safe:animate-[pulse_2.4s_ease-in-out_4.6s_infinite] in-data-fluid:text-transparent"
        >
          touch to open
        </span>
      </p>
    </div>
  );
}
