import type { CSSProperties } from "react";

// 케이크 위로 솔솔 뿌려지는 스프링클 알갱이.
// 뿌리는 판은 케이크 상자와 같은 크기다 (케이크 폭 w-[25%] 그대로).
// x: 케이크 폭 안 가로 위치(%), r: 처음 기울기, dx: 옆으로 흘러가는 거리(px),
// dy: 떨어지는 거리 (케이크 높이 기준 %. 가운데일수록 짧게 35 → 꼭대기 단, 가장자리일수록 길게 ~68 → 아랫단에 내려앉는다),
// du: 한 번 떨어지는 시간(초), d: 시작 지연(초), c: 색
const SPRINKLES = [
  { x: 6, r: -32, dx: -6, dy: 68, du: 3.6, d: 0.3, c: "#f3ead9" },
  { x: 12, r: 24, dx: 4, dy: 64, du: 3.3, d: 2.1, c: "#efc6cc" },
  { x: 20, r: -50, dx: -4, dy: 58, du: 3.1, d: 1.6, c: "#b9cde6" },
  { x: 28, r: 42, dx: 5, dy: 52, du: 3.4, d: 0.4, c: "#c8424f" },
  { x: 37, r: 12, dx: -5, dy: 45, du: 3.0, d: 1.2, c: "#f3ead9" },
  { x: 45, r: -22, dx: 4, dy: 39, du: 3.5, d: 2.0, c: "#b9cde6" },
  { x: 55, r: 58, dx: -4, dy: 39, du: 3.2, d: 0.7, c: "#efc6cc" },
  { x: 63, r: -8, dx: 4, dy: 45, du: 3.0, d: 2.6, c: "#f3ead9" },
  { x: 71, r: 36, dx: -5, dy: 51, du: 3.4, d: 2.9, c: "#c8424f" },
  { x: 80, r: -46, dx: 5, dy: 58, du: 3.1, d: 3.3, c: "#b9cde6" },
  { x: 88, r: 50, dx: 4, dy: 64, du: 3.7, d: 1.0, c: "#efc6cc" },
  { x: 94, r: -36, dx: 6, dy: 68, du: 3.5, d: 3.6, c: "#f3ead9" },
  { x: 41, r: 30, dx: 3, dy: 42, du: 3.3, d: 3.9, c: "#efc6cc" },
  { x: 59, r: -60, dx: -3, dy: 42, du: 3.6, d: 4.3, c: "#f3ead9" },
];

/**
 * 스프링클이 케이크 위쪽에서 시간차로 계속 떨어지다 케이크에 내려앉듯 작아지며 사라진다.
 * 감싸는 상자(position: relative, 케이크 크기) 위에 겹쳐 놓는다. 떨어지는 거리는 케이크 높이에 비례해서
 * 케이크 크기를 바꿔도 알갱이가 윗단에 내려앉는다. 움직임을 줄인 환경에서는 보이지 않는다.
 */
export function Sprinkles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10"
      style={{ containerType: "size" }} // 알갱이의 dy 를 판 높이(cqh) 기준으로 쓴다
    >
      {SPRINKLES.map((s, i) => (
        <i
          key={i}
          className="sprinkle"
          style={
            {
              left: `${s.x}%`,
              "--r": `${s.r}deg`,
              "--dx": `${s.dx}px`,
              "--dy": `${s.dy}cqh`,
              "--c": s.c,
              animationDuration: `${s.du}s`,
              animationDelay: `${s.d}s`,
            } as CSSProperties
          }
        />
      ))}
      <style>{`
        .sprinkle {
          position: absolute;
          top: -14%;
          width: 3px;
          height: 8px;
          border-radius: 1.6px / 1.9px;
          background: var(--c);
          box-shadow: inset 0 0 0 0.6px rgb(70 80 105 / 0.38), inset -0.8px -1px 1px rgb(60 50 45 / 0.16);
          filter: drop-shadow(0 1px 1px rgb(52 46 40 / 0.28));
          opacity: 0;
          transform: rotate(var(--r));
          animation: sprinkle-fall 3s ease-in infinite;
        }
        @keyframes sprinkle-fall {
          0% { opacity: 0; transform: translate(0, 0) rotate(var(--r)); }
          14%, 72% { opacity: 1; }
          100% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy)) rotate(calc(var(--r) + 110deg)) scale(0.5);
            filter: drop-shadow(0 1px 1px rgb(52 46 40 / 0.28)) blur(1.5px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sprinkle { display: none; }
        }
      `}</style>
    </div>
  );
}
