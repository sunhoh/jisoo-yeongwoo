import { Gaegu } from "next/font/google";

// 손글씨 무드 (/envelope 전용)

/** 한글 손글씨 */
export const handKo = Gaegu({
  variable: "--font-hand-ko",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});
