"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { startBgm } from "@/components/invitation/bgm";
import { CARD_WIDTH, STICKER_SCALE } from "./sticker-size";
import type { GalleryImage } from "@/lib/gallery";

const OPEN = 1100; // 스티커가 떨어지고 봉투가 다 사라질 때까지

type Props = {
  date: string;
  names: string;
  art: GalleryImage;
};

/** 청첩장 앞면: 사진이 인트로 화면을 꽉 채우고, 아래쪽 어두운 옷 위에 날짜와 이름을 흰 글씨로 얹는다 */
function InvitationCard({ date, names, art }: Props) {
  return (
    <div className="absolute inset-0">
      <Image
        src={art.src}
        alt=""
        fill
        priority
        sizes="(max-width: 440px) 100vw, 440px"
        placeholder="blur"
        blurDataURL={art.blurDataURL}
        // className="object-cover grayscale contrast-[1.05]"
        className="object-cover"
      />
      {/* 글씨가 읽히도록 아래쪽만 살짝 어둡게 */}
      <div className="absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-black/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-[7%] flex flex-col items-center text-white">
        <p className="font-[family-name:var(--font-pen)] text-[clamp(15px,4vw,19px)] tracking-[0.12em] tabular-nums">
          {date}
        </p>
        <p className="font-[family-name:var(--font-pen)] text-[clamp(24px,7vw,32px)] leading-tight font-semibold">
          {names}
        </p>
      </div>
    </div>
  );
}

// 반투명 종이 한 겹의 색. 날개가 겹치는 곳일수록 겹이 늘어 더 하얗고 덜 비친다
const VELLUM_LAYER = "rgb(252 251 248 / 0.22)";

/**
 * 반투명(트레싱지) 봉투 뒷면. 인트로 화면(세로 기둥 한 칸)을 통째로 덮는다.
 * 바탕 한 겹 위에 위 덮개와 아래 날개가 완만한 V로 겹쳐, 두 날개 끝이 만나는 한가운데에 스티커가 붙는다.
 * 날개 경계는 선을 긋지 않고 겹 아래로 지는 옅은 그림자로만 보인다.
 */
function Vellum({ opening }: { opening: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: opening ? 0 : 1,
        // 열릴 땐 스티커가 떨어진 뒤 사라지고, 다시 덮일 땐 바로 나타난다
        transition: opening ? "opacity 700ms ease 400ms" : "opacity 450ms ease",
      }}
    >
      {/* 바탕 한 겹: 뒤가 흐릿하게 비친다 */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgb(248 247 243 / 0.5)",
          backdropFilter: "blur(1.2px) saturate(0.6) brightness(1.04)",
          WebkitBackdropFilter: "blur(1.2px) saturate(0.6) brightness(1.04)",
        }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        {/* 아래 날개: 양옆에서 가운데로 완만하게 올라온다 */}
        <path
          d="M0 100 L0 63 L46 48.6 Q50 47.2 54 48.6 L100 63 L100 100 Z"
          fill={VELLUM_LAYER}
          style={{ filter: "drop-shadow(0 -0.4px 0.6px rgb(60 55 45 / 0.1))" }}
        />
        {/* 위 덮개: 맨 위 겹, 가운데로 완만하게 내려온다 */}
        <path
          d="M0 0 L0 37 L46 51.4 Q50 52.8 54 51.4 L100 37 L100 0 Z"
          fill="rgb(252 251 248 / 0.26)"
          style={{ filter: "drop-shadow(0 0.5px 0.8px rgb(60 55 45 / 0.14))" }}
        />
      </svg>
    </div>
  );
}

const HEART_SRC = "/envelope/heart2.png"; // 체크무늬 바탕을 지워 투명으로 만든 것
const HEART_W = 400; // 그림 크기 — 스티커 상자 비율과 뒷면 반사 계산에 쓴다
const HEART_H = 353;
// 벗겨진 정도 d는 이미지 상자 모서리부터 잰다. 하트 그림은 오른쪽 아래 모서리가 0.4쯤 투명한 빈 공간이라
// 그 값(PEEL_FLAT)까지는 접힌 선이 빈 공간에만 걸려 스티커가 평평하게 붙어 있다.
const PEEL_FLAT = 0.41; // 스티커 종이가 들리기 시작하는 값
const PEEL_IDLE = PEEL_FLAT; // 가만히 있을 땐 평평하게 붙어 있다
const PEEL_HOVER = 0.66; // 마우스를 올렸을 때
const PEEL_RELEASE = 0.95; // 이만큼 넘게 벗기고 놓으면 떨어진다
const PEEL_MAX = 1.7; // 다 벗겨진 상태

/**
 * 봉투를 봉한 하트 스티커 (public/envelope/heart2.png). 오른쪽 아래 모서리부터 종이 스티커처럼 벗겨진다.
 *
 * 벗겨진 정도 d(0..1)에 따라 접힌 선 x + y = 2 - d (스티커 크기를 1로 본 좌표) 를 기준으로
 * - 앞면: 접힌 선 바깥 삼각형을 잘라낸다
 * - 뒷면: 잘린 삼각형을 접힌 선에 대해 뒤집어(반사) 흰 종이로 보여준다. 모양은 하트 이미지를 마스크로 써서 하트 그대로
 * - 그림자: 접힌 선 쪽 앞면에 옅게
 */
function Sticker({
  opening,
  onOpen,
}: {
  opening: boolean;
  onOpen: () => void;
}) {
  const [peel, setPeel] = useState(PEEL_IDLE);
  const target = useRef(PEEL_IDLE);
  const value = useRef(PEEL_IDLE);
  const frame = useRef(0);
  const drag = useRef<{
    x: number;
    y: number;
    from: number;
    size: number;
    moved: boolean;
  } | null>(null);
  const finished = useRef(false);

  // 목표값을 향해 부드럽게 따라간다
  const animateTo = (next: number, then?: () => void) => {
    target.current = next;
    cancelAnimationFrame(frame.current);
    const step = () => {
      const v = value.current + (target.current - value.current) * 0.18;
      value.current = Math.abs(target.current - v) < 0.002 ? target.current : v;
      setPeel(value.current);
      if (value.current !== target.current)
        frame.current = requestAnimationFrame(step);
      else then?.();
    };
    frame.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    // 브라우저가 소리를 허락하도록 손을 뗀 이 순간에 바로 음악을 시작한다
    startBgm();
    // 끝까지 벗긴 뒤 떨어지며 봉투가 열린다
    animateTo(PEEL_MAX, onOpen);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (finished.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      from: value.current,
      size: e.currentTarget.getBoundingClientRect().width,
      moved: false,
    };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    // 오른쪽 아래 모서리를 왼쪽 위로 끌수록 더 벗겨진다
    const pulled = -(e.clientX - d.x + (e.clientY - d.y)) / d.size;
    if (Math.abs(pulled) > 0.04) d.moved = true;
    cancelAnimationFrame(frame.current);
    value.current = Math.min(PEEL_MAX, Math.max(PEEL_IDLE, d.from + pulled));
    target.current = value.current;
    setPeel(value.current);
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || finished.current) return;
    if (!d.moved || value.current > PEEL_RELEASE)
      finish(); // 탭이거나 충분히 벗겼으면
    else animateTo(PEEL_IDLE); // 덜 벗겼으면 다시 붙는다
  };

  const d = Math.min(peel, PEEL_MAX);
  // 접힌 선 그림자는 실제로 들린 만큼만 (평평할 땐 0)
  const lift = Math.min(1, Math.max(0, (d - PEEL_FLAT) / 0.15));
  const fold = 100 - d * 100; // 접힌 선이 가장자리와 만나는 위치(%)
  const c = 2 - d;
  const mask = {
    WebkitMaskImage: `url(${HEART_SRC})`,
    maskImage: `url(${HEART_SRC})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  } as const;

  return (
    <button
      type="button"
      aria-label="스티커를 벗겨 청첩장 열기"
      disabled={opening}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={(e) =>
        e.pointerType === "mouse" &&
        !finished.current &&
        !drag.current &&
        animateTo(PEEL_HOVER)
      }
      onPointerLeave={(e) =>
        e.pointerType === "mouse" &&
        !finished.current &&
        !drag.current &&
        animateTo(PEEL_IDLE)
      }
      onKeyDown={(e) => {
        e.stopPropagation(); // 스페이스가 화면 쪽 키 처리로 새지 않게
        if (e.key === "Enter" || e.key === " ") finish();
      }}
      onClick={(e) => e.stopPropagation()} // 벗기는 동작이 끝난 뒤 스스로 연다
      className="absolute top-1/2 left-1/2 z-10 touch-none select-none"
      style={{
        transform: opening
          ? "translate(-10%, -150%) rotate(-28deg) scale(1.08)"
          : "translate(-50%, -50%) rotate(-7deg)",
        opacity: opening ? 0 : 1,
        transition:
          "transform 650ms cubic-bezier(0.3, 0, 0.2, 1), opacity 450ms ease 200ms",
        cursor: "grab",
        width: `${STICKER_SCALE * 100}%`,
        aspectRatio: `${HEART_W} / ${HEART_H}`,
      }}
    >
      {/* 앞면: 접힌 선 바깥을 잘라낸 하트 */}
      <span
        className="absolute inset-0"
        style={{
          clipPath: `polygon(0 0, 100% 0, 100% ${fold}%, ${fold}% 100%, 0 100%)`,
          filter: "drop-shadow(0.5px 2px 2.5px rgb(0 0 0 / 0.22))",
        }}
      >
        <Image
          src={HEART_SRC}
          alt=""
          fill
          priority
          draggable={false}
          sizes="120px"
          className="select-none"
        />
        {/* 접힌 선을 따라 지는 그림자 (하트 모양 안에서만) */}
        <span
          className="absolute inset-0"
          style={{
            ...mask,
            background: `linear-gradient(to bottom right, transparent ${(1 - d / 2 - 0.14) * 100}%, rgb(0 0 0 / ${0.28 * lift}) ${(1 - d / 2) * 100}%)`,
          }}
        />
      </span>

      {/* 뒷면: 벗겨져 뒤집힌 흰 종이 (접힌 선에 대해 반사) */}
      <span
        className="absolute inset-0"
        style={{
          transformOrigin: "0 0",
          // 접힌 선 x/W + y/H = c 에 대한 반사. 상자가 정사각형이 아니라 가로·세로 비율을 곱해 줘야
          // 접힌 선 위의 점이 제자리에 머물러 앞면과 뒷면 사이에 틈이 안 생긴다
          transform: `translate(${c * 100}%, ${c * 100}%) matrix(0, ${-HEART_H / HEART_W}, ${-HEART_W / HEART_H}, 0, 0, 0)`,
          filter: "drop-shadow(-1px -1px 2px rgb(0 0 0 / 0.2))",
        }}
      >
        <span
          className="absolute inset-0"
          style={{
            ...mask,
            clipPath: `polygon(100% ${fold}%, ${fold}% 100%, 100% 100%)`,
            background: `linear-gradient(to bottom right, #ffffff ${(1 - d / 2) * 100}%, #e7e3dc 100%)`,
          }}
        />
      </span>
    </button>
  );
}

/**
 * 인트로: 화면을 통째로 덮은 반투명 봉투 너머로 카드가 비치고, 가운데 분홍 스티커를 누르면
 * 스티커가 떨어지고 → 봉투가 제자리에서 스르르 사라져 카드만 남는다.
 * 스티커 말고 화면 아무 데나 누르거나 아래로 스크롤해도 열린다. 여는 동작은 배경음악 시작도 겸한다.
 * 열린 뒤 맨 위로 다시 올라오면 봉투가 다시 덮이고 스티커도 새로 붙는다.
 */
export function EnvelopeIntro(props: Props) {
  const [state, setState] = useState<"sealed" | "opening" | "open">("sealed");
  const [round, setRound] = useState(0); // 다시 덮일 때마다 스티커를 새로 붙인다
  const done = useRef(false);
  const timer = useRef(0);

  const open = () => {
    if (done.current) return;
    done.current = true;
    setState("opening");
    timer.current = window.setTimeout(() => setState("open"), OPEN);
  };

  const seal = () => {
    clearTimeout(timer.current);
    done.current = false;
    setRound((r) => r + 1);
    setState("sealed");
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  // 화면 아무 데나 눌러도 열린다. 스티커를 벗겨 연 경우엔 Sticker가 이미 음악을 시작했다
  const openByTap = () => {
    if (done.current) return;
    startBgm();
    open();
  };

  // 닫혀 있을 땐 아래로 스크롤하려 하면 열리고, 열린 뒤엔 맨 위에서 더 위로 올리려 하면 다시 덮인다 (휠·스와이프·키)
  useEffect(() => {
    if (state === "opening") return;
    const sealed = state === "sealed";
    const atTop = () => window.scrollY <= 0;
    let touchY = 0;
    let swiped = false;
    let leftTop = !atTop();

    const onWheel = (e: WheelEvent) => {
      if (sealed && e.deltaY > 0) open();
      else if (!sealed && e.deltaY < 0 && atTop()) seal();
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchY - e.touches[0].clientY; // 위로 쓸면 +
      if (sealed && dy > 24) {
        swiped = true;
        open();
      } else if (!sealed && dy < -24 && atTop()) seal();
    };
    // 스와이프(touchmove)는 브라우저가 소리 재생을 허락하는 동작이 아니라 손을 뗄 때 음악을 시작한다
    const onTouchEnd = () => swiped && startBgm();
    const onKey = (e: KeyboardEvent) => {
      if (sealed && ["ArrowDown", "PageDown", " ", "End"].includes(e.key)) {
        startBgm();
        open();
      } else if (
        !sealed &&
        ["ArrowUp", "PageUp", "Home"].includes(e.key) &&
        atTop()
      )
        seal();
    };
    // 아래로 내려갔다가 스크롤로 맨 위까지 돌아오면 덮인다
    const onScroll = () => {
      if (sealed) return;
      if (!atTop()) leftTop = true;
      else if (leftTop) seal();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [state]);

  // 봉투가 닫혀 있는 동안 스크롤 잠금
  useEffect(() => {
    if (state === "open") return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [state]);

  const opening = state !== "sealed";

  return (
    <section
      onClick={state === "sealed" ? openByTap : undefined}
      className={`relative flex h-dvh flex-col items-center justify-center overflow-hidden px-6 ${state === "sealed" ? "cursor-pointer" : ""}`}
    >
      <InvitationCard {...props} />
      {/* 다시 덮일 수 있어 봉투는 늘 두고 투명도로만 숨긴다 */}
      <Vellum opening={opening} />
      {/* 스티커는 화면 정가운데, 봉투 날개 끝이 만나는 자리에 붙는다 */}
      <div
        key={round}
        className="absolute inset-0 m-auto aspect-[2/3]"
        style={{
          width: CARD_WIDTH,
          visibility: state === "open" ? "hidden" : "visible",
          animation: round ? "sticker-in 450ms ease both" : undefined,
        }}
      >
        <Sticker opening={opening} onOpen={open} />
      </div>
      <style>{`@keyframes sticker-in { from { opacity: 0; transform: scale(1.15); } }`}</style>
    </section>
  );
}
