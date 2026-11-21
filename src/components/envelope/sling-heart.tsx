"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PAPER_SHADOW } from "./deco";

const SRC = "/envelope/heart2.png";
const PULL_MAX = 90; // 당길 수 있는 최대 거리(px). 넘으면 고무줄처럼 점점 덜 늘어난다
const FIRE_AT = 28; // 이만큼 넘게 당겼다 놓으면 날아간다
const LAUNCH = 15; // 당긴 거리 1px 당 발사 속도(px/s)
const GRAVITY = 1400; // 날아가는 동안 아래로 당기는 힘(px/s²)
const SPRING = 260; // 덜 당겼을 때 제자리로 돌아오는 탄성
const DAMP = 13; // 그 떨림이 잦아드는 정도
const BURST = [
  "#c8424f",
  "#efc6cc",
  "#f3ead9",
  "#c8424f",
  "#efc6cc",
  "#b9cde6",
];

type Vec = { x: number; y: number };

/**
 * 새총 하트: 하트 스티커를 당기면 고무줄이 늘어나고, 놓으면 반대쪽으로 날아간 뒤 제자리에 다시 톡 붙는다.
 * 조금만 당겼다 놓으면 고무줄 탄성으로 출렁이며 돌아오고, 그냥 누르면 통통 튄다.
 * 움직임을 줄인 환경에서는 날아가지 않고 제자리로만 돌아온다.
 */
export function SlingHeart({ rotate = 0 }: { rotate?: number }) {
  const heart = useRef<HTMLDivElement>(null);
  const band = useRef<SVGPolylineElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const pos = useRef<Vec>({ x: 0, y: 0 });
  const drag = useRef<{ start: Vec; moved: boolean } | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // 하트 위치·기울기·크기와 고무줄을 그린다
  const paint = (
    p: Vec,
    spin = 0,
    scale = 1,
    opacity = 1,
    showBand = false,
  ) => {
    const el = heart.current;
    if (el) {
      el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${rotate + spin}deg) scale(${scale})`;
      el.style.opacity = String(opacity);
    }
    const w = box.current?.offsetWidth ?? 0;
    const h = box.current?.offsetHeight ?? 0;
    const line = band.current;
    if (line) {
      // 양쪽 말뚝(하트가 붙어 있던 자리의 좌우 끝) → 하트 가운데 → 반대쪽 말뚝
      const cx = w / 2 + p.x;
      const cy = h / 2 + p.y;
      line.setAttribute("points", `0,${h / 2} ${cx},${cy} ${w},${h / 2}`);
      line.style.opacity = showBand ? "1" : "0";
    }
  };

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 매 프레임 step(dt) 를 부르다가 false 를 돌려주면 멈춘다
  const run = (step: (dt: number) => boolean) => {
    cancelAnimationFrame(frame.current);
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      if (step(dt)) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  // 고무줄 탄성으로 출렁이며 제자리로
  const springBack = (from: Vec, bandOn: boolean) => {
    const p = { ...from };
    const v = { x: 0, y: 0 };
    run((dt) => {
      v.x += (-SPRING * p.x - DAMP * v.x) * dt;
      v.y += (-SPRING * p.y - DAMP * v.y) * dt;
      p.x += v.x * dt;
      p.y += v.y * dt;
      const done = Math.hypot(p.x, p.y) < 0.3 && Math.hypot(v.x, v.y) < 5;
      paint(done ? { x: 0, y: 0 } : p, 0, 1, 1, bandOn && !done);
      pos.current = done ? { x: 0, y: 0 } : p;
      return !done;
    });
  };

  // 제자리에 작게 나타나 톡 붙는다 (크기에 스프링)
  const stickBack = () => {
    let s = 0;
    let vs = 0;
    paint({ x: 0, y: 0 }, 0, 0, 1);
    run((dt) => {
      vs += (-320 * (s - 1) - 14 * vs) * dt;
      s += vs * dt;
      const done = Math.abs(s - 1) < 0.002 && Math.abs(vs) < 0.05;
      paint({ x: 0, y: 0 }, 0, done ? 1 : Math.max(0, s), 1);
      return !done;
    });
  };

  // 당긴 반대쪽으로 날아가 화면 밖으로 사라졌다가 다시 붙는다
  const fire = (from: Vec) => {
    setBursts((b) => [...b, { id: performance.now(), x: from.x, y: from.y }]);
    const p = { ...from };
    const v = { x: -from.x * LAUNCH, y: -from.y * LAUNCH };
    const spinSpeed = (from.x > 0 ? -1 : 1) * 540 + v.x * 0.4;
    let spin = 0;
    let t = 0;
    run((dt) => {
      t += dt;
      v.y += GRAVITY * dt;
      p.x += v.x * dt;
      p.y += v.y * dt;
      spin += spinSpeed * dt;
      // 처음 아주 잠깐만 고무줄이 하트를 따라가다 말뚝으로 튕겨 돌아온다
      paint(p, spin, 1, Math.max(0, 1 - Math.max(0, t - 0.7) * 3), t < 0.04);
      if (t < 1.05) return true;
      window.setTimeout(stickBack, 250);
      return false;
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    cancelAnimationFrame(frame.current);
    drag.current = {
      start: { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y },
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const raw = { x: e.clientX - d.start.x, y: e.clientY - d.start.y };
    const len = Math.hypot(raw.x, raw.y);
    if (len > 4) d.moved = true;
    // 멀리 당길수록 덜 늘어나는 고무줄
    const k = len ? (PULL_MAX * (1 - Math.exp(-len / PULL_MAX))) / len : 0;
    pos.current = { x: raw.x * k, y: raw.y * k };
    // 당기는 만큼 살짝 늘어나 보이게
    paint(pos.current, 0, 1 + Math.min(len, PULL_MAX) / 900, 1, true);
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const from = pos.current;
    if (!d.moved) {
      // 그냥 누르면 통통: 아래로 살짝 눌렸다 튀어 오른다
      springBack({ x: 0, y: 10 }, false);
    } else if (Math.hypot(from.x, from.y) > FIRE_AT && !reducedMotion()) {
      fire(from);
    } else {
      springBack(from, true);
    }
  };

  return (
    <div ref={box} className="relative z-20 w-full touch-none select-none">
      {/* 고무줄: 하트 뒤에 그린다 */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <polyline
          ref={band}
          fill="none"
          stroke="#c8424f"
          strokeOpacity={0.55}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0, transition: "opacity 120ms" }}
        />
      </svg>

      <div
        ref={heart}
        role="img"
        aria-label="당겼다 놓으면 날아가는 하트"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative cursor-grab active:cursor-grabbing"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        <Image
          src={SRC}
          alt=""
          width={400}
          height={353}
          sizes="120px"
          draggable={false}
          className="pointer-events-none block h-auto w-full"
          style={{ filter: PAPER_SHADOW }}
        />
      </div>

      {/* 발사 순간 작은 하트들이 톡 터진다 */}
      {bursts.map((b) => (
        <span
          key={b.id}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2"
          style={{ transform: `translate(${b.x}px, ${b.y}px)` }}
          onAnimationEnd={() =>
            setBursts((all) => all.filter((x) => x.id !== b.id))
          }
        >
          {BURST.map((c, i) => {
            const a = (i / BURST.length) * Math.PI * 2 + 0.4;
            return (
              <i
                key={i}
                className="sling-burst"
                style={
                  {
                    color: c,
                    "--bx": `${Math.cos(a) * 34}px`,
                    "--by": `${Math.sin(a) * 34}px`,
                  } as React.CSSProperties
                }
              >
                ♥
              </i>
            );
          })}
        </span>
      ))}

      <style>{`
        .sling-burst {
          position: absolute;
          left: -4px;
          top: -7px;
          font-size: 10px;
          font-style: normal;
          line-height: 1;
          animation: sling-burst 650ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
        }
        @keyframes sling-burst {
          from { opacity: 1; transform: translate(0, 0) scale(0.4); }
          to { opacity: 0; transform: translate(var(--bx), var(--by)) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sling-burst { display: none; }
        }
      `}</style>
    </div>
  );
}
