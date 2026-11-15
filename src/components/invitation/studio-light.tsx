"use client";

import { useEffect, useRef } from "react";

/** 스튜디오 공간: 회색 벽 + 위에서 떨어지는 스포트라이트 */
function paint(g: CanvasRenderingContext2D, w: number, h: number) {
  // 벽: 가운데가 조금 밝고 양옆으로 살짝 어두워지는 연한 회색
  const wall = g.createLinearGradient(0, 0, w, 0);
  wall.addColorStop(0, "#e6e6e5");
  wall.addColorStop(0.5, "#efefee");
  wall.addColorStop(1, "#e6e6e5");
  g.fillStyle = wall;
  g.fillRect(0, 0, w, h);

  // 스포트라이트: 위 가운데에서 아래로 길게 퍼지는 빛 (타원 방사형)
  g.save();
  g.translate(w / 2, 0);
  g.scale(Math.min(w, h * 0.75) * 0.3, h * 0.62);
  const spot = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  spot.addColorStop(0, "rgba(255,255,255,1)");
  spot.addColorStop(0.45, "rgba(255,255,255,0.92)");
  spot.addColorStop(0.75, "rgba(255,255,255,0.45)");
  spot.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = spot;
  g.fillRect(-1.2, 0, 2.4, 1.2);
  g.restore();

  // 벽을 타고 아래로 흘러내리며 옅어지는 빛 기둥
  g.save();
  g.translate(w / 2, 0);
  g.scale(Math.min(w, h * 0.75) * 0.36, h);
  const column = g.createRadialGradient(0, 0.2, 0, 0, 0.2, 1);
  column.addColorStop(0, "rgba(255,255,255,0.5)");
  column.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = column;
  g.fillRect(-1.2, 0, 2.4, 1);
  g.restore();

  // 사진 같은 질감을 위해 아주 옅은 노이즈 (색 띠 방지)
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 3;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
}

/**
 * 인트로 배경: 조명이 떨어지는 스튜디오 공간.
 * 부모(relative)를 꽉 채우는 캔버스이고, [data-fluid-image]라 인트로 일렁임 효과에도 그대로 들어간다.
 */
export function StudioLight() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      paint(g, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={ref}
      data-fluid-image
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full in-data-fluid:invisible"
    />
  );
}
