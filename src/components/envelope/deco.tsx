import Image from "next/image";
import type { CSSProperties } from "react";
import { Wiggle } from "./wiggle";

// 손자수 느낌 장식 그림 (public/envelope/*.png). 검은 바탕을 투명으로 바꾸고 여백을 잘라 둔 것.
// 크기 조절·webp 변환은 next/image 가 해 준다.
// 그림을 바꾸거나 더하려면: public/envelope 에 PNG를 넣고 `npm run deco` → 출력된 크기를 아래에 붙여 넣는다
const DECO = {
  bouquet: [1005, 1340],
  cake: [674, 836],
  flower2: [921, 1157], // 은방울꽃
  flower4: [1149, 987],
  frame2: [883, 1081],
  guestbook: [1075, 1264],
  heart2: [400, 353], // 인트로 봉투를 봉한 하트 스티커
  ribbon: [1095, 1018],
} as const;

export type DecoName = keyof typeof DECO;

// 종이 위에 붙여 둔 것처럼 짧고 진한 그림자 + 넓고 옅은 그림자
export const PAPER_SHADOW =
  "drop-shadow(0 2px 1.5px rgb(52 46 40 / 0.3)) drop-shadow(0 7px 5px rgb(52 46 40 / 0.14))";

/**
 * 장식 그림 하나. 크기·위치는 className(폭)으로, 기울기는 rotate(도)로 준다.
 * 마우스를 올리거나 누르면 살짝 흔들린다 (wiggle={false} 로 끌 수 있다 — 액자처럼 다른 것과 같이 흔들어야 할 때)
 */
export function Deco({
  name,
  className = "",
  rotate = 0,
  priority,
  wiggle = true,
}: {
  name: DecoName;
  className?: string;
  rotate?: number;
  priority?: boolean;
  wiggle?: boolean;
}) {
  const [width, height] = DECO[name];
  const style: CSSProperties = { filter: PAPER_SHADOW };
  if (rotate) style.transform = `rotate(${rotate}deg)`;
  const image = (
    <Image
      src={`/envelope/${name}.png`}
      alt=""
      aria-hidden
      width={width}
      height={height}
      sizes="(max-width: 440px) 60vw, 260px"
      priority={priority}
      draggable={false}
      className={`pointer-events-none h-auto select-none ${wiggle ? "block w-full" : className}`}
      style={style}
    />
  );
  return wiggle ? <Wiggle className={className}>{image}</Wiggle> : image;
}
