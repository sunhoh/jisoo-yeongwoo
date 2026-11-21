// 인트로 카드·하트 스티커 크기. 인트로(envelope-intro)와 마지막 섹션의 하트가 같은 크기로 보이도록 한 곳에서 정한다.
// 퍼센트는 종이 기둥 폭 기준이라, 기둥 폭을 꽉 쓰는 자리에 두어야 같은 크기가 된다.

/** 인트로 카드 폭: 기둥 폭의 80%, 최대 360px, 화면이 낮으면 높이에 맞춰 줄어든다 */
export const CARD_WIDTH = "min(80%, 360px, calc((100dvh - 7rem) * 2 / 3))";

/** 하트 스티커는 카드 폭의 26% */
export const STICKER_SCALE = 0.26;

/** 기둥 폭 기준 하트 스티커 폭 */
export const STICKER_WIDTH = `calc(${CARD_WIDTH} * ${STICKER_SCALE})`;
