import { Amatic_SC, Caveat, Gaegu } from "next/font/google";

// 손글씨 무드 (/envelope 전용)

/** 큰 제목: 길쭉한 손글씨 대문자 */
export const hand = Amatic_SC({
  variable: "--font-hand",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

/** 이름·날짜: 흘려 쓴 펜글씨 */
export const pen = Caveat({
  variable: "--font-pen",
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
});

/** 한글 손글씨 */
export const handKo = Gaegu({
  variable: "--font-hand-ko",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});
