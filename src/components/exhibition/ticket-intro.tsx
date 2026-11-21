"use client";

import { useEffect, useRef, useState } from "react";
import { startBgm } from "@/components/invitation/bgm";
import { getTilt, requestMotionPermission, subscribeTilt } from "@/lib/tilt";

const SEEN_KEY = "exhibition-ticket";
const TILT_MAX = 14; // deg
const ENTER = 700; // 탭한 뒤 전시장으로 들어가기까지
const BG = "#f1f1ef";

/*
 * 홀로 효과 스타일. --mx, --my: 빛 위치(%), --tilt: 기운 정도(0..1)를 매 프레임 넣어준다.
 * 전역 CSS가 아니라 컴포넌트 안에 두어, 이 화면에서만 쓰이고 개발 서버 CSS 갱신과 상관없이 바로 반영된다.
 */
const HOLO_CSS = `
.holo-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 무지갯빛 박막: 기울수록 진해지고, 빛 위치를 따라 띠가 흐른다 */
.holo-foil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    115deg,
    hsl(330 70% 82%) 0%,
    hsl(45 80% 80%) 6%,
    hsl(150 60% 80%) 12%,
    hsl(200 75% 82%) 18%,
    hsl(265 65% 84%) 24%,
    hsl(330 70% 82%) 30%
  );
  background-size: 300% 300%;
  background-position: var(--mx, 50%) var(--my, 50%);
  mix-blend-mode: multiply;
  opacity: calc(0.12 + var(--tilt, 0) * 0.45);
}

/* 자잘한 반짝이: 박막을 점 무늬로 한 번 더, 빛 쪽에서 더 반짝인다 */
.holo-glitter {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgb(255 255 255 / 0.9), transparent 45%),
    repeating-linear-gradient(60deg, hsl(200 80% 75%) 0 4%, hsl(300 70% 80%) 4% 8%, hsl(60 80% 78%) 8% 12%);
  background-size: 100% 100%, 240% 240%;
  background-position: center, var(--mx, 50%) var(--my, 50%);
  -webkit-mask: radial-gradient(circle, #000 0.7px, transparent 1.3px) 0 0 / 5px 5px;
  mask: radial-gradient(circle, #000 0.7px, transparent 1.3px) 0 0 / 5px 5px;
  mix-blend-mode: multiply;
  opacity: calc(0.15 + var(--tilt, 0) * 0.5);
}

/* 반사광: 빛 위치에 둥근 하이라이트 */
.holo-glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    circle at var(--mx, 50%) var(--my, 50%),
    rgb(255 255 255 / 0.75) 0%,
    rgb(255 255 255 / 0.2) 30%,
    transparent 60%
  );
  mix-blend-mode: soft-light;
  opacity: calc(0.5 + var(--tilt, 0) * 0.5);
}
`;

type Props = {
  title: string;
  names: string;
  date: string;
  time: string;
  venue: string;
  serial: string;
};

/** 감쇠 스프링 한 스텝 */
function spring(
  value: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
) {
  const force = (target - value) * stiffness - velocity * damping;
  const v = velocity + force * dt;
  return [value + v * dt, v];
}

/**
 * 홀로그램 입장권 인트로.
 * 카드가 마우스(폰은 기울기)를 따라 스프링처럼 기울고, 각도에 따라 무지갯빛 홀로 박막과 반사광이 흐른다.
 * 가만히 두면 혼자 살랑인다. 탭하면 카드가 살짝 떠오르며 화면이 걷히고 전시장으로 들어간다.
 * 탭은 배경음악 시작과 iOS 기울기 권한 요청도 겸한다. 같은 탭 세션에서 다시 열면 건너뛴다.
 */
export function TicketIntro({
  title,
  names,
  date,
  time,
  venue,
  serial,
}: Props) {
  const [phase, setPhase] = useState<"show" | "enter" | "gone">("show");
  const done = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const rotor = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const entered = useRef(false);

  const enter = (byTap: boolean) => {
    if (done.current) return;
    done.current = true;
    if (byTap) {
      // 사용자 탭 안에서 바로 불러야 브라우저가 허락한다
      startBgm();
      void requestMotionPermission();
      entered.current = true;
    }
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setPhase("enter");
    setTimeout(() => setPhase("gone"), byTap ? ENTER + 400 : 0);
  };

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen) enter(false);
  }, []);

  // 입장 전에는 뒤 페이지 스크롤 잠금
  useEffect(() => {
    if (phase === "gone") return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [phase]);

  // 기울기·광택 애니메이션
  useEffect(() => {
    const el = rotor.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const unsubscribe = subscribeTilt(() => {});

    const s = {
      rx: 0,
      vx: 0,
      ry: 0,
      vy: 0,
      lx: 50,
      vlx: 0,
      ly: 30,
      vly: 0,
      lift: 1,
      vl: 0,
    };
    let last = performance.now();
    let frame = 0;
    const start = last;

    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const t = (now - start) / 1000;

      let tx: number;
      let ty: number;
      let lx: number;
      let ly: number;
      const gyro = getTilt();
      if (pointer.current) {
        // 마우스·손가락 위치 쪽으로 기운다
        tx = (0.5 - pointer.current.y) * 2 * TILT_MAX;
        ty = (pointer.current.x - 0.5) * 2 * TILT_MAX;
        lx = pointer.current.x * 100;
        ly = pointer.current.y * 100;
      } else if (Math.abs(gyro.x) + Math.abs(gyro.y) > 0.02) {
        // 폰 기울기
        tx = -gyro.x * TILT_MAX;
        ty = gyro.y * TILT_MAX;
        lx = 50 + gyro.y * 50;
        ly = 50 + gyro.x * 50;
      } else if (still) {
        tx = ty = 0;
        lx = 50;
        ly = 30;
      } else {
        // 가만히 두면 혼자 살랑인다
        tx = Math.sin(t * 0.7) * TILT_MAX * 0.28;
        ty = Math.sin(t * 0.53 + 1.2) * TILT_MAX * 0.4;
        lx = 50 + ty * 2.4;
        ly = 50 - tx * 2.4;
      }
      const lift = entered.current ? 1.08 : pointer.current ? 1.04 : 1;

      // (객체 속성으로 바로 구조분해 대입하면 번들러가 깨뜨려서 한 줄씩 넣는다)
      const step = (
        key: "rx" | "ry" | "lx" | "ly" | "lift",
        vel: "vx" | "vy" | "vlx" | "vly" | "vl",
        target: number,
        k: number,
        c: number,
      ) => {
        const next = spring(s[key], s[vel], target, k, c, dt);
        s[key] = next[0];
        s[vel] = next[1];
      };
      step("rx", "vx", tx, 150, 16);
      step("ry", "vy", ty, 150, 16);
      step("lx", "vlx", lx, 220, 30);
      step("ly", "vly", ly, 220, 30);
      step("lift", "vl", lift, 320, 30);

      el.style.transform = `perspective(1100px) scale(${s.lift}) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`;
      // 박막·반사광이 쓰는 값: 빛 위치(%)와 기운 정도(0..1)
      el.style.setProperty("--mx", `${s.lx}%`);
      el.style.setProperty("--my", `${s.ly}%`);
      el.style.setProperty(
        "--tilt",
        String(Math.min(1, Math.hypot(s.rx, s.ry) / TILT_MAX)),
      );
      if (shadow.current) {
        shadow.current.style.transform = `translate(${-s.ry * 0.7}px, ${s.rx * 0.7 + 10}px) scale(${0.92 + (s.lift - 1) * 1.5})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

  const track = (e: React.PointerEvent) => {
    // 손가락은 누른 채 움직일 때만 따라간다
    if (e.pointerType === "touch" && e.type === "pointermove" && !e.buttons)
      return;
    const r = card.current?.getBoundingClientRect();
    if (!r) return;
    pointer.current = {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  };
  const leave = () => {
    pointer.current = null;
  };

  if (phase === "gone") return null;
  const entering = phase === "enter";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="입장권을 눌러 전시 입장하기"
      onClick={() => enter(true)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && enter(true)}
      className="fixed inset-0 z-[70] flex cursor-pointer flex-col items-center justify-center outline-none select-none"
      style={{
        background: BG,
        touchAction: "none",
        opacity: entering ? 0 : 1,
        transition: `opacity 500ms ease ${ENTER - 300}ms`,
      }}
    >
      <style>{HOLO_CSS}</style>
      <div
        ref={card}
        onPointerEnter={track}
        onPointerMove={track}
        onPointerDown={track}
        onPointerLeave={leave}
        onPointerCancel={leave}
        className="relative w-[min(78vw,300px)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:[animation-duration:1200ms]"
      >
        <div
          ref={shadow}
          aria-hidden
          className="absolute inset-x-[8%] top-[12%] bottom-[-4%] rounded-md bg-black/25 blur-2xl"
        />

        <div
          ref={rotor}
          // 입장권 내용 높이가 카드 크기가 된다
          className="relative"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          <div className="holo-face relative overflow-hidden rounded-md bg-paper">
            <div className="px-6 pt-7 pb-6">
              <div className="flex items-baseline justify-between text-[10px] font-bold tracking-[0.18em] text-ink">
                <span>EXHIBITION</span>
                <span className="tabular-nums">{serial}</span>
              </div>
              <p className="mt-8 text-[34px] leading-[0.95] font-bold tracking-[-0.03em] text-ink uppercase">
                {title}
              </p>
              <p className="type-label mt-3 text-ink-soft">{names}</p>

              <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[11px] tracking-[0.04em]">
                <dt className="font-bold text-ink">DATE</dt>
                <dd className="text-ink-soft tabular-nums">{date}</dd>
                <dt className="font-bold text-ink">TIME</dt>
                <dd className="text-ink-soft">{time}</dd>
                <dt className="font-bold text-ink">VENUE</dt>
                <dd className="text-ink-soft">{venue}</dd>
              </dl>
            </div>

            {/* 절취선 */}
            <div className="relative h-0">
              <span
                className="absolute top-0 -left-2.5 size-5 -translate-y-1/2 rounded-full"
                style={{ background: BG }}
              />
              <span
                className="absolute top-0 -right-2.5 size-5 -translate-y-1/2 rounded-full"
                style={{ background: BG }}
              />
              <span className="absolute inset-x-4 top-0 border-t border-dashed border-ink-faint" />
            </div>
            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-[13px] font-bold tracking-[0.2em] text-ink">
                ADMIT ONE
              </span>
              <span className="type-meta">Free</span>
            </div>

            {/* <span aria-hidden className="holo-foil" /> */}
            {/* <span aria-hidden className="holo-glitter" /> */}
            <span aria-hidden className="holo-glare" />
          </div>
        </div>
      </div>

      <p className="type-meta absolute bottom-[10vh] tracking-[0.3em] uppercase motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both motion-safe:[animation-delay:1400ms] motion-safe:[animation-duration:1000ms]">
        tap to enter
      </p>
    </div>
  );
}
