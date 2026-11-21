"use client";

import { useState, type ReactNode } from "react";

/**
 * 감싼 장식을 살짝 흔든다: 마우스를 올리거나(데스크톱) 누르면(모바일) 한 번 까딱까딱.
 * 위치·크기 클래스는 className 으로 이 상자에 준다. 흔들림은 rotate 속성만 써서 안쪽 그림의 기울기(transform)와 겹치지 않는다.
 * 움직임을 줄인 환경에서는 흔들리지 않는다.
 */
export function Wiggle({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [on, setOn] = useState(false);

  // 흔들리는 중에 또 누르면 처음부터 다시 흔든다
  const play = () => {
    setOn(false);
    requestAnimationFrame(() => setOn(true));
  };

  return (
    <div
      className={`${on ? "deco-wiggle" : ""} ${className}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && play()}
      onClick={play}
      onAnimationEnd={() => setOn(false)}
    >
      {children}
      <style href="deco-wiggle" precedence="default">{`
        .deco-wiggle { animation: deco-wiggle 650ms ease-in-out; }
        @keyframes deco-wiggle {
          0%, 100% { rotate: 0deg; }
          20% { rotate: -5deg; }
          45% { rotate: 4deg; }
          70% { rotate: -2deg; }
          85% { rotate: 1deg; }
        }
        @media (prefers-reduced-motion: reduce) {
          .deco-wiggle { animation: none; }
        }
      `}</style>
    </div>
  );
}
