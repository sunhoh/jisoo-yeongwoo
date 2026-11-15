"use client";

import Image from "next/image";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseLineIcon,
  DownIcon,
} from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import type { GalleryImage } from "@/lib/gallery";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

/**
 * 3열 사진 그리드 + 더보기 + 전체화면 뷰어.
 * 사진이 로드되기 전에는 plaiceholder 블러 미리보기가 먼저 보인다.
 */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [index, setIndex] = useState<number | null>(null);

  // 사진이 아직 없으면 자리표시 칸을 보여준다
  if (images.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: PAGE_SIZE }, (_, i) => (
          <div key={i} className="aspect-square bg-mist" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {images.slice(0, visible).map((image, i) => (
          <Reveal key={image.src} delay={(i % PAGE_SIZE) * 40}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`사진 ${i + 1} 크게 보기`}
              className="relative block aspect-square w-full overflow-hidden bg-mist"
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="(max-width: 600px) 33vw, 200px"
                placeholder="blur"
                blurDataURL={image.blurDataURL}
                className="object-cover transition-transform duration-700 ease-soft hover:scale-[1.03]"
              />
            </button>
          </Reveal>
        ))}
      </div>

      {images.length > visible && (
        <div className="mt-8 flex justify-center">
          <Button size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            <DownIcon className="text-ink-soft" />
            사진 더보기
          </Button>
        </div>
      )}

      <GalleryViewer
        images={images}
        index={index}
        onIndexChange={setIndex}
      />
    </>
  );
}

export function GalleryViewer({
  images,
  index,
  onIndexChange,
}: {
  images: GalleryImage[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}) {
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const current = index ?? 0;

  const go = (next: number) => {
    if (next < 0 || next >= images.length) return;
    onIndexChange(next);
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => !o && onIndexChange(null)}
    >
      <DialogPrimitive.Portal>
        {/* 연락하기 다이얼로그와 같은 배경: 뒤 페이지가 흐릿하게 비친다 */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-paper/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 mx-auto flex max-w-invite flex-col outline-none"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") go(current - 1);
            if (e.key === "ArrowRight") go(current + 1);
          }}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? current + 1 : current - 1);
            touchX.current = null;
          }}
        >
          <DialogPrimitive.Title className="sr-only">사진 보기</DialogPrimitive.Title>
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="type-caption">
              {current + 1} / {images.length}
            </span>
            <DialogPrimitive.Close aria-label="닫기" className="p-2 text-ink">
              <CloseLineIcon className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="relative flex-1 overflow-hidden select-none">
            {images[current] && (
              <Image
                key={current}
                src={images[current].src}
                alt=""
                fill
                sizes="(max-width: 600px) 100vw, 600px"
                placeholder="blur"
                blurDataURL={images[current].blurDataURL}
                className="animate-in object-contain duration-500 fade-in-0"
              />
            )}
          </div>

          <div className="flex items-center justify-center gap-10 pt-4 pb-10">
            {[
              { label: "이전 사진", icon: ArrowLeftIcon, to: current - 1 },
              { label: "다음 사진", icon: ArrowRightIcon, to: current + 1 },
            ].map(({ label, icon: Icon, to }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                disabled={to < 0 || to >= images.length}
                onClick={() => go(to)}
                className={cn(
                  "rounded-full border border-line p-2.5 text-ink transition-opacity",
                  "disabled:opacity-30 active:bg-mist",
                )}
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
