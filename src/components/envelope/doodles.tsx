import type { SVGProps } from "react";

// 손으로 그린 듯한 선 그림들 (펜 선 끝이 둥글고 살짝 흔들린다)
const pen = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 손그림 물결 밑줄 */
export function DoodleUnderline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden {...props}>
      <path
        d="M2 6 C20 2 34 9 52 5 C70 1 86 9 118 4"
        {...pen}
        strokeWidth={1.8}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
