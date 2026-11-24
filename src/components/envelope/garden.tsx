import Image from "next/image";
import { PAPER_SHADOW } from "./deco";

/**
 * 맨 아래 꽃밭. 종이 바닥에 딱 붙여 두고, 다른 장식과 같은 종이 그림자를 준다.
 * crop: 상자 높이(그림 원래 비율 1774/701 중 701 자리). 줄일수록 아랫부분이 잘려 꽃이 더 아래로 내려가 보인다.
 */
export function Garden({ crop = 580 }: { crop?: number }) {
  return (
    <div className="overflow-hidden" style={{ aspectRatio: `1774 / ${crop}` }}>
      <Image
        src="/envelope/garden.png"
        alt=""
        aria-hidden
        width={1774}
        height={701}
        sizes="(max-width: 600px) 100vw, 600px"
        draggable={false}
        className="pointer-events-none block w-full select-none"
        style={{ filter: PAPER_SHADOW }}
      />
    </div>
  );
}
