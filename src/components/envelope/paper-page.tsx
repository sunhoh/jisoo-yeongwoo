"use client";

import { useEffect, type ReactNode } from "react";

// 종이 기둥 바탕색 (질감 이미지 없이 단색)
const PAPER = "#faf9f6";

// 종이 기둥 바깥(데스크톱 양옆·고무줄 스크롤 여백)은 무늬 없는 거의 흰 미색
const OUTSIDE = "#f7f7f5";
// 종이 기둥은 휴대폰 한 화면 폭으로 좁히고, 양옆에 옅은 그림자를 둔다
const COLUMN = {
  background: PAPER,
  maxWidth: "440px",
  boxShadow: "0 0 36px rgb(60 55 45 / 0.08)",
};

/**
 * 종이 질감을 레이아웃 틀(<main>)에만 깔아 가운데 종이 한 장처럼 세우고, 바깥은 단색으로 둔다.
 * 이 페이지에 있는 동안만 바꾸고, 떠나면 body·main 둘 다 되돌린다.
 */
export function PaperPage({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const body = document.body;
    const main = document.querySelector("main");
    const prevBody = body.getAttribute("style") ?? "";
    const prevMain = main?.getAttribute("style") ?? "";
    body.style.background = OUTSIDE;
    if (main) Object.assign(main.style, COLUMN);
    return () => {
      body.setAttribute("style", prevBody);
      main?.setAttribute("style", prevMain);
    };
  }, []);

  return <div className={`min-h-dvh ${className}`}>{children}</div>;
}
