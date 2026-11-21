"use client";

import { useEffect } from "react";

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

type Props = {
  bride: string;
  groom: string;
  date: string;
  /** 당겨야 보이는 크레딧. 본문 바탕이 투명해 뒤가 비치는 페이지에서는 끈다 */
  credit?: boolean;
};

/**
 * 숨은 장치들.
 * - 맨 아래에서 더 당기면 크레딧 (본문 뒤에 고정해 두고 평소엔 본문 흰 배경에 가려진다.
 *   iOS·맥의 고무줄 스크롤에서만 드러남)
 * - 개발자 도구 콘솔을 열면 인사말
 */
export function DevEasterEggs({ bride, groom, date, credit = true }: Props) {
  useEffect(() => {
    console.log(
      `%c✷ ${bride} & ${groom}%c\n\n<wedding date="${date}">\n  코드까지 열어볼 만큼 궁금하셨다면,\n  결혼식에도 꼭 와주세요 :)\n</wedding>\n`,
      "font: italic 600 16px Georgia, serif; color: #111;",
      `font: 12px ${MONO}; color: #7f7d77; line-height: 1.6;`,
    );
  }, [bride, groom, date]);

  const layer =
    "pointer-events-none fixed left-1/2 -z-10 w-full max-w-invite -translate-x-1/2 px-6 text-center select-none";

  if (!credit) return null;

  return (
    <footer aria-label="만든 사람" className={`${layer} bottom-0 pb-6`}>
      <p className="type-meta text-ink-faint">
        © 2026 sunhoh. All rights reserved.
      </p>
    </footer>
  );
}
