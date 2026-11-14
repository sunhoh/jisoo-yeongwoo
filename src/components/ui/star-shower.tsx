"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Star3D } from "./star-3d";

const EVENT = "star-shower";
const TAPS = 5;
const TAP_WINDOW = 1800; // ms 안에 5번
const COUNT = 26;

/** 이스터에그 발동 */
export function triggerStarShower() {
  window.dispatchEvent(new Event(EVENT));
}

type Drop = {
  id: number;
  left: number;
  size: number;
  finish: "ink" | "chrome" | "pearl";
  duration: number;
  delay: number;
  drift: number;
  turn: number;
};

function makeDrops(seed: number): Drop[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: seed * 100 + i,
    left: Math.random() * 100,
    size: 14 + Math.random() * 34,
    finish: Math.random() < 0.7 ? "ink" : Math.random() < 0.5 ? "chrome" : "pearl",
    duration: 2600 + Math.random() * 2200,
    delay: Math.random() * 1400,
    drift: (Math.random() - 0.5) * 120,
    turn: (Math.random() - 0.5) * 540,
  }));
}

/** 3D 별이 화면 위에서 쏟아진다. layout에 한 번 둔다. */
export function StarShower() {
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let seed = 0;
    let timer: ReturnType<typeof setTimeout>;
    const onShower = () => {
      seed += 1;
      setDrops(makeDrops(seed));
      clearTimeout(timer);
      timer = setTimeout(() => setDrops([]), 5000 + 1400);
    };
    window.addEventListener(EVENT, onShower);
    return () => {
      window.removeEventListener(EVENT, onShower);
      clearTimeout(timer);
    };
  }, []);

  if (drops.length === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute top-0 animate-star-fall"
          style={
            {
              left: `${d.left}%`,
              animationDuration: `${d.duration}ms`,
              animationDelay: `${d.delay}ms`,
              "--drift": `${d.drift}px`,
              "--turn": `${d.turn}deg`,
            } as CSSProperties
          }
        >
          <Star3D size={Math.round(d.size)} finish={d.finish} spin />
        </span>
      ))}
    </div>
  );
}

/**
 * 탭하면 살짝 튀고, 짧은 시간 안에 5번 탭하면 별이 쏟아지는 숨은 장식.
 */
export function EasterStar({ size = 16 }: { size?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const taps = useRef<number[]>([]);

  const onTap = () => {
    // 톡 튀는 반응 (별을 다시 마운트하지 않도록 Web Animations로)
    ref.current?.animate(
      [{ transform: "scale(0.78)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }],
      { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );

    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < TAP_WINDOW), now];
    if (taps.current.length >= TAPS) {
      taps.current = [];
      triggerStarShower();
    }
  };

  return (
    <span
      ref={ref}
      onPointerDown={onTap}
      className="inline-flex cursor-default touch-manipulation select-none"
    >
      <Star3D size={size} />
    </span>
  );
}
