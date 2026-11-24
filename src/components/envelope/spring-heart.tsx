"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { PAPER_SHADOW } from "./deco";

const SRC = "/envelope/heart2.png";
const PULL_MAX = 80; // 당길 수 있는 최대 거리(px). 넘으면 고무처럼 점점 덜 늘어난다
const SPRAY_AT = 20; // 이만큼 넘게 당겼다 놓으면 반대쪽으로 튀긴다
const SPRING = 420; // 제자리로 튕겨 돌아오는 탄성
const DAMP = 11; // 출렁임이 잦아드는 정도 (작을수록 오래 출렁)
const GRAVITY = 1300; // 튀긴 조각이 떨어지는 힘(px/s²)
const COLORS = ["#c8424f", "#efc6cc", "#f3ead9", "#b9cde6"];
// 하트가 처음 화면에 들어오면 한 번 스스로 당겼다 놓아 "당길 수 있다"는 걸 보여준다
const DEMO_DELAY = 0; // 하트가 보이는 즉시 당기기 시작
const DEMO_PULL = 220; // 당기는 데 걸리는 시간
const DEMO_HOLD = 30; // 당긴 채로 잠깐 버티는 시간
const DEMO_TO: Vec = { x: 0, y: 62 }; // 정확히 아래로 당긴다 → 반대쪽인 정확히 위로 튄다

type Vec = { x: number; y: number };
type Bit = {
  el: HTMLElement;
  p: Vec;
  v: Vec;
  r: number;
  vr: number;
  life: number;
  age: number;
};

/**
 * 고무 하트: 하트를 잡아당기면 그 방향으로 늘어나고, 놓으면 탄성 있게 제자리로 튕겨 돌아오며
 * 당긴 반대쪽으로 작은 하트·스프링클이 튀어 나간다. 세게 당길수록 많이, 멀리 튄다.
 * 움직임을 줄인 환경에서는 튀기지 않고 제자리로만 돌아온다.
 */
export function SpringHeart({ rotate = 0 }: { rotate?: number }) {
  const heart = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const pos = useRef<Vec>({ x: 0, y: 0 });
  const vel = useRef<Vec>({ x: 0, y: 0 });
  const drag = useRef<{ start: Vec; moved: boolean } | null>(null);
  const bits = useRef<Bit[]>([]);
  const frame = useRef(0);
  const running = useRef(false);
  const demo = useRef(0); // 시연 중인 rAF/타이머. 사용자가 잡으면 바로 멈춘다
  const demoTimer = useRef(0);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      cancelAnimationFrame(demo.current);
      clearTimeout(demoTimer.current);
      bits.current.forEach((b) => b.el.remove());
    },
    [],
  );

  // 위치만큼 그 방향으로 늘어나고 옆으로는 살짝 홀쭉해진다
  const paint = () => {
    const el = heart.current;
    if (!el) return;
    const { x, y } = pos.current;
    const len = Math.hypot(x, y);
    const a = Math.atan2(y, x);
    const sx = 1 + len / 220;
    const sy = 1 - len / 520;
    el.style.transform = `translate(${x * 0.55}px, ${y * 0.55}px) rotate(${a}rad) scale(${sx}, ${sy}) rotate(${-a}rad) rotate(${rotate}deg)`;
  };

  // 하트 스프링과 튀긴 조각을 한 루프에서 움직인다. 둘 다 멈추면 루프도 멈춘다
  const loop = () => {
    if (running.current) return;
    running.current = true;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;

      let springing = false;
      if (!drag.current) {
        const p = pos.current;
        const v = vel.current;
        v.x += (-SPRING * p.x - DAMP * v.x) * dt;
        v.y += (-SPRING * p.y - DAMP * v.y) * dt;
        p.x += v.x * dt;
        p.y += v.y * dt;
        springing = Math.hypot(p.x, p.y) > 0.2 || Math.hypot(v.x, v.y) > 4;
        if (!springing) pos.current = { x: 0, y: 0 };
        paint();
      }

      bits.current = bits.current.filter((b) => {
        b.age += dt;
        b.v.y += GRAVITY * dt;
        b.p.x += b.v.x * dt;
        b.p.y += b.v.y * dt;
        b.r += b.vr * dt;
        const fade = Math.max(
          0,
          1 - Math.max(0, b.age - b.life * 0.55) / (b.life * 0.45),
        );
        b.el.style.transform = `translate(${b.p.x}px, ${b.p.y}px) rotate(${b.r}deg)`;
        b.el.style.opacity = String(fade);
        if (b.age < b.life) return true;
        b.el.remove();
        return false;
      });

      if (springing || drag.current || bits.current.length) {
        frame.current = requestAnimationFrame(tick);
      } else running.current = false;
    };
    frame.current = requestAnimationFrame(tick);
  };

  // 당긴 반대쪽으로 조각들을 부채꼴로 튀긴다
  const spray = (from: Vec) => {
    const box = layer.current;
    if (!box) return;
    const len = Math.hypot(from.x, from.y);
    const power = Math.min(1, len / PULL_MAX);
    const dir = Math.atan2(-from.y, -from.x);
    const count = Math.round(5 + power * 9);
    for (let i = 0; i < count; i++) {
      const a = dir + (Math.random() - 0.5) * 0.9;
      const speed = (380 + Math.random() * 420) * (0.5 + power);
      const el = document.createElement("i");
      const isHeart = i % 3 === 0;
      el.className = isHeart ? "spring-bit spring-bit-heart" : "spring-bit";
      el.textContent = isHeart ? "♥" : "";
      el.style.setProperty("--c", COLORS[i % COLORS.length]);
      box.appendChild(el);
      bits.current.push({
        el,
        p: { x: 0, y: 0 },
        v: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
        r: Math.random() * 360,
        vr: (Math.random() - 0.5) * 900,
        life: 0.8 + Math.random() * 0.4,
        age: 0,
      });
    }
  };

  const stopDemo = () => {
    cancelAnimationFrame(demo.current);
    clearTimeout(demoTimer.current);
    demo.current = 0;
  };

  // 사람이 당기듯 천천히 늘였다가 잠깐 버티고 놓는다. 놓은 뒤는 실제로 놓을 때와 똑같이 튕긴다
  const playDemo = () => {
    if (drag.current || reducedMotion()) return;
    let started = 0; // 첫 프레임 시각에서 시작
    const step = (now: number) => {
      started ||= now;
      const t = Math.min(1, (now - started) / DEMO_PULL);
      const e = 1 - (1 - t) ** 3; // 처음엔 빠르게, 끝으로 갈수록 버티듯 느리게
      pos.current = { x: DEMO_TO.x * e, y: DEMO_TO.y * e };
      paint();
      if (t < 1) {
        demo.current = requestAnimationFrame(step);
        return;
      }
      demoTimer.current = window.setTimeout(() => {
        demo.current = 0;
        vel.current = { x: 0, y: 0 };
        spray({ ...pos.current });
        loop();
      }, DEMO_HOLD);
    };
    demo.current = requestAnimationFrame(step);
  };

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    stopDemo();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      start: { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y },
      moved: false,
    };
    vel.current = { x: 0, y: 0 };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const raw = { x: e.clientX - d.start.x, y: e.clientY - d.start.y };
    const len = Math.hypot(raw.x, raw.y);
    if (len > 4) d.moved = true;
    // 멀리 당길수록 덜 늘어나는 고무
    const k = len ? (PULL_MAX * (1 - Math.exp(-len / PULL_MAX))) / len : 0;
    pos.current = { x: raw.x * k, y: raw.y * k };
    paint();
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const from = { ...pos.current };
    if (!d.moved) {
      // 그냥 누르면 아래로 살짝 눌렸다 통 튄다
      pos.current = { x: 0, y: 12 };
    } else if (Math.hypot(from.x, from.y) > SPRAY_AT && !reducedMotion()) {
      spray(from);
    }
    loop();
  };

  // 하트 끝이 화면에 걸리는 순간 한 번만 시연한다 (섹션이 아니라 하트 기준)
  useEffect(() => {
    const el = heart.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        demoTimer.current = window.setTimeout(playDemo, DEMO_DELAY);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
    // 처음 한 번만 걸면 된다 (playDemo 는 ref 만 쓴다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative z-20 w-full touch-none select-none">
      <div
        ref={heart}
        role="img"
        aria-label="당겼다 놓으면 튕기는 하트"
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

      {/* 튀긴 조각들이 그려지는 자리: 하트 가운데에서 출발한다 */}
      <div
        ref={layer}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2"
      />

      <style>{`
        .spring-bit {
          position: absolute;
          left: -1.5px;
          top: -4px;
          width: 3px;
          height: 8px;
          border-radius: 1.6px / 1.9px;
          background: var(--c);
          box-shadow: inset 0 0 0 0.6px rgb(70 80 105 / 0.3);
          filter: drop-shadow(0 1px 1px rgb(52 46 40 / 0.25));
        }
        .spring-bit-heart {
          left: -5px;
          top: -6px;
          width: auto;
          height: auto;
          background: none;
          box-shadow: none;
          color: var(--c);
          font-size: 11px;
          font-style: normal;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
