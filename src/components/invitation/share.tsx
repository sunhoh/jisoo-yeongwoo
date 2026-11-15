"use client";

import Script from "next/script";
import { useState } from "react";
import { invitation } from "@/config/invitation";
import { Button } from "@/components/ui/button";
import { KakaoIcon, LinkIcon, ShareIcon } from "@/components/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { copy } from "@/lib/copy";

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Kakao: any;
  }
}

/** 공유하기 — 링크 복사 / 카카오톡 공유 */
export function Share({ share = invitation.share }: { share?: typeof invitation.share }) {
  const [open, setOpen] = useState(false);

  const onCopy = () => {
    copy(share.url);
    setOpen(false);
  };

  const onKakao = () => {
    if (!window.Kakao?.isInitialized()) return;
    const link = { mobileWebUrl: share.url, webUrl: share.url };
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: share.title,
        description: share.description,
        imageUrl: share.imageUrl,
        link,
      },
      buttons: [{ title: "모바일 청첩장 보기", link }],
    });
    setOpen(false);
  };

  return (
    <>
      {KAKAO_KEY && (
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          onReady={() => {
            if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_KEY);
          }}
        />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="sm">
            <ShareIcon className="size-4" />
            공유하기
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-48">
          <ShareItem onClick={onCopy} icon={<LinkIcon className="text-ink-soft" />}>
            링크 복사하기
          </ShareItem>
          <ShareItem
            onClick={onKakao}
            disabled={!KAKAO_KEY}
            icon={<KakaoIcon className="size-4" />}
          >
            카카오톡 공유하기
          </ShareItem>
        </PopoverContent>
      </Popover>
    </>
  );
}

function ShareItem({
  icon,
  children,
  ...props
}: React.ComponentProps<"button"> & { icon: React.ReactNode }) {
  return (
    <button
      type="button"
      className="type-body-sm flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-ink transition-colors focus:outline-none active:bg-mist disabled:opacity-40"
      {...props}
    >
      <span className="flex size-4 items-center justify-center">{icon}</span>
      {children}
    </button>
  );
}
