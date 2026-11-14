import type { Metadata, Viewport } from "next";
import { StarShower } from "@/components/ui/star-shower";
import { Toaster } from "@/components/ui/toaster";
import { script, serif, suit } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "지수 🖤영우 결혼합니다",
  description: "지수와 영우의 결혼식에 초대합니다.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${suit.variable} ${script.variable} ${serif.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <main className="mx-auto min-h-dvh max-w-invite bg-paper">
          {children}
        </main>
        <Toaster />
        <StarShower />
      </body>
    </html>
  );
}
