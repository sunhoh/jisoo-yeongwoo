import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import localFont from "next/font/local";

// 한글 본문 — 레퍼런스와 동일한 SUIT (OFL)
export const suit = localFont({
  variable: "--font-suit",
  display: "swap",
  src: [
    { path: "../fonts/SUIT-Light.woff2", weight: "300" },
    { path: "../fonts/SUIT-Regular.woff2", weight: "400" },
    { path: "../fonts/SUIT-Medium.woff2", weight: "500" },
    { path: "../fonts/SUIT-Bold.woff2", weight: "700" },
  ],
});

// 메인 타이틀 필기체 — The Californication 대체
export const script = Pinyon_Script({
  variable: "--font-pinyon",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// 영문 소제목 이탤릭 세리프 — HappyTimeTwo 대체
export const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});
