"use client";

import { useEffect, useRef } from "react";

/**
 * 부모 영역을 WebGL로 다시 그려 포인터를 따라 물처럼 일렁이게 한다.
 *
 * 부모 안의 표시된 요소를 매 프레임 읽어 2D 캔버스에 똑같이 그리고, 그 그림을 유체 셰이더로 굴절시킨다.
 * - [data-fluid-text]: 글자. 위치·글꼴·자간·대소문자·투명도(조상 포함)·clip-path(inset)를 따라간다.
 *   색은 data-fluid-color (기본 #111111)
 * - [data-fluid-image]: 안에 있는 <canvas>(예: 3D 별)를 그 자리에 그대로 찍는다.
 * 부모에 data-fluid 가 붙으면 원래 요소는 화면에서만 숨긴다(레이아웃·애니메이션·스크린리더 유지).
 * 모션 줄이기, WebGL 미지원이면 아무것도 하지 않아 원래 HTML이 보인다.
 */
export function FluidLayer({ background = "#ffffff" }: { background?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const area = canvas?.parentElement;
    if (!canvas || !area) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!document.createElement("canvas").getContext("webgl2")) return;

    const content = document.createElement("canvas");
    const ctx = content.getContext("2d");
    if (!ctx) return;

    const texts = [...area.querySelectorAll<HTMLElement>("[data-fluid-text]")];
    const images = [...area.querySelectorAll<HTMLElement>("[data-fluid-image]")];

    /** 조상까지 곱한 실제 투명도 (부모 페이드인 + 자식 깜빡임 같은 경우) */
    const opacityOf = (el: HTMLElement) => {
      let o = 1;
      for (let n: HTMLElement | null = el; n && n !== area; n = n.parentElement) {
        o *= Number(getComputedStyle(n).opacity);
      }
      return o;
    };

    /** clip-path: inset(t r b l) → 보이는 사각형 (요소 기준 px) */
    const clipOf = (el: HTMLElement, w: number, h: number) => {
      const m = getComputedStyle(el).clipPath.match(/inset\(([^)]+)\)/);
      if (!m) return null;
      const v = m[1].trim().split(/\s+/).map((t) => {
        const n = parseFloat(t);
        return { n, pct: t.endsWith("%") };
      });
      const [t, r = t, b = t, l = r] = v;
      const px = (x: { n: number; pct: boolean }, size: number) => (x.pct ? (x.n / 100) * size : x.n);
      return { left: px(l, w), top: px(t, h), right: w - px(r, w), bottom: h - px(b, h) };
    };

    let signature = "";

    const drawContent = () => {
      const area_ = area.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const textStates = texts.map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          el,
          r,
          cs,
          opacity: opacityOf(el),
          clip: clipOf(el, r.width, r.height),
        };
      });

      // 이미지(3D 별)는 기울기에 따라 계속 바뀌므로 있으면 매번 다시 그린다
      const next =
        images.length > 0
          ? String(performance.now())
          : `${area_.width}x${area_.height}@${dpr}|${textStates
              .map((s) => `${s.r.left.toFixed(1)},${s.r.top.toFixed(1)},${s.opacity.toFixed(3)},${s.cs.clipPath}`)
              .join("|")}`;
      if (next === signature) return false;
      signature = next;

      const w = Math.round(area_.width * dpr);
      const h = Math.round(area_.height * dpr);
      if (content.width !== w || content.height !== h) {
        content.width = w;
        content.height = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, area_.width, area_.height);

      for (const el of images) {
        const img = el.querySelector("canvas");
        const opacity = opacityOf(el);
        if (!img || img.width === 0 || opacity <= 0.001) continue;
        const r = el.getBoundingClientRect();
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, r.left - area_.left, r.top - area_.top, r.width, r.height);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const { el, r, cs, opacity, clip } of textStates) {
        if (opacity <= 0.001) continue;
        const x = r.left - area_.left;
        const y = r.top - area_.top;
        ctx.save();
        if (clip) {
          ctx.beginPath();
          ctx.rect(x + clip.left, y + clip.top, clip.right - clip.left, clip.bottom - clip.top);
          ctx.clip();
        }
        ctx.globalAlpha = opacity;
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        ctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
        ctx.fillStyle = el.dataset.fluidColor ?? "#111111";
        const raw = el.textContent ?? "";
        const text = cs.textTransform === "uppercase" ? raw.toUpperCase() : raw;
        ctx.fillText(text, x + r.width / 2, y + r.height / 2);
        ctx.restore();
      }
      return true;
    };

    let cleanup = () => {};
    let cancelled = false;

    // 글꼴이 다 받아진 뒤 시작해야 캔버스 글자가 대체 글꼴로 그려지지 않는다
    Promise.all([document.fonts.ready, import("./fluid-engine")]).then(([, { createFluid }]) => {
      if (cancelled) return;
      cleanup = createFluid({ canvas, content, area, drawContent });
      area.setAttribute("data-fluid", "");
    });

    return () => {
      cancelled = true;
      cleanup();
      area.removeAttribute("data-fluid");
    };
  }, [background]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full opacity-0 [[data-fluid]>&]:opacity-100"
    />
  );
}
