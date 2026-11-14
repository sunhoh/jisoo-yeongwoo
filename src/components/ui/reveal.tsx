"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";

type RevealProps = ComponentProps<"div"> & {
  /** ms */
  delay?: number;
  /** tailwindcss-animate 진입 방향 */
  from?: "bottom" | "none";
};

/**
 * 스크롤로 화면에 들어올 때 한 번만 페이드 인.
 * 애니메이션은 tailwindcss-animate 유틸리티(animate-in / fade-in / slide-in-from-*)로 처리.
 */
export function Reveal({
  delay = 0,
  from = "bottom",
  className = "",
  style,
  children,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const motion = shown
    ? `motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both ${
        from === "bottom" ? "motion-safe:slide-in-from-bottom-4" : ""
      }`
    : "motion-safe:opacity-0";

  return (
    <div
      ref={ref}
      className={`${motion} ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: "1000ms",
        animationTimingFunction: "var(--ease-soft)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
