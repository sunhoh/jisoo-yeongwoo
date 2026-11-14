"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { StarFinish } from "./star-3d-engine";

/**
 * 리퀴드 메탈 ✷ 장식.
 * three.js는 처음 별이 마운트될 때 지연 로드되고, 렌더러 하나를 모든 별이 공유한다.
 */
export function Star3D({
  size = 16,
  finish = "ink",
  spin = true,
  className,
}: {
  size?: number;
  /** ink: 검정 크롬 · chrome: 은색 · pearl: 진주빛 */
  finish?: StarFinish;
  /** 기본은 정면 고정, true면 천천히 회전 */
  spin?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = canvas.height = Math.round(size * dpr);

    let cleanup = () => {};
    let cancelled = false;
    import("./star-3d-engine").then(({ registerStar }) => {
      if (cancelled) return;
      cleanup = registerStar(canvas, finish, spin);
      setReady(true);
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [size, finish, spin]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn(
        "inline-block transition-opacity duration-700",
        ready ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
