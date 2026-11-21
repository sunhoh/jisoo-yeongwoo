// 지금까지 만든 청첩장 디자인 목록. 메인(/)에서 이 순서대로 보여준다.
// 새 디자인을 만들면 src/app/<경로>/page.tsx 를 만들고 여기에 한 줄 더한다.

export type Design = {
  /** 라우트 경로 */
  href: string;
  /** 디자인 제목 (페이지 안 큰 제목) */
  title: string;
  /** 한 줄 컨셉 설명 */
  concept: string;
};

export const designs: Design[] = [
  {
    href: "/magazine",
    title: "Magazine",
    concept: "흑백 매거진 — 커버 사진 슬라이드쇼와 잡지 같은 타이포그래피",
  },
  {
    href: "/exhibition",
    title: "Exhibition",
    concept: "전시회 — 입장권을 넘기며 들어가는 갤러리 전시",
  },
  {
    href: "/envelope",
    title: "Envelope",
    concept: "반투명 봉투 — 하트 스티커를 떼면 열리는 종이 편지와 손자수 장식",
  },
];
