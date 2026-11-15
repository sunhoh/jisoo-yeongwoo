"use client";

import { useEffect, useState } from "react";

const LAYERS = 6;
const BASE_BLUR = 0.5; // px, 층마다 2배씩
const SHOW_AFTER = 40; // 이만큼 스크롤한 뒤부터 블러를 보인다 (첫 화면 커버 캡션이 흐려지지 않게)

/**
 * 한쪽 가장자리의 그라데이션 블러.
 * 블러 세기가 다른 층을 겹치고 층마다 다른 높이만 보이게 가려서, 가장자리로 갈수록 점점 더 흐려진다.
 */
function BlurEdge({ edge, height, visible }: { edge: "top" | "bottom"; height: number; visible: boolean }) {
  // 가장자리 쪽으로 갈수록 진한 블러가 되도록 방향을 잡는다
  const dir = edge === "top" ? "to top" : "to bottom";
  const step = 100 / LAYERS;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-1/2 z-30 w-full max-w-invite -translate-x-1/2"
      style={{
        [edge]: 0,
        height,
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease",
      }}
    >
      {Array.from({ length: LAYERS }, (_, i) => {
        const blur = `blur(${BASE_BLUR * 2 ** i}px)`;
        const mask = `linear-gradient(${dir}, transparent ${i * step}%, #000 ${(i + 1) * step}%, #000 ${(i + 2) * step}%, transparent ${(i + 3) * step}%)`;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: blur,
              WebkitBackdropFilter: blur,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
}

/** 화면 위아래 가장자리 그라데이션 블러 (메인 청첩장용) */
export function GradualBlur({ top = 56, bottom = 72 }: { top?: number; bottom?: number }) {
  const [visible, setVisible] = useState(false);
  // [data-no-blur] 요소(맨 아래 서명)가 화면에 들어오면 아래쪽 블러만 걷는다
  const [bottomClear, setBottomClear] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const targets = document.querySelectorAll("[data-no-blur]");
    const inView = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target);
        else inView.delete(e.target);
      }
      setBottomClear(inView.size > 0);
    });
    targets.forEach((t) => io.observe(t));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <BlurEdge edge="top" height={top} visible={visible} />
      <BlurEdge edge="bottom" height={bottom} visible={visible && !bottomClear} />
    </>
  );
}
