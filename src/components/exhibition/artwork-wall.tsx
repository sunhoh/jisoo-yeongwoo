"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GalleryViewer } from "@/components/invitation/gallery";
import { Reveal } from "@/components/ui/reveal";
import type { GalleryImage } from "@/lib/gallery";

/** 미술관 작품 캡션 */
export function WallLabel({
  no,
  title,
  meta,
  className = "",
}: {
  no: string;
  title: string;
  meta: string;
  className?: string;
}) {
  return (
    <div className={`text-left ${className}`}>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink tabular-nums">
        {no}
      </p>
      <p className="type-label mt-1 text-ink">{title}</p>
      <p className="type-meta mt-0.5">{meta}</p>
    </div>
  );
}

/**
 * 작품 전시 벽: 대표 작품 한 점을 크게 걸고, 아래에 전체 작품을 한 줄 썸네일 캐러셀로 보여준다.
 * 썸네일을 누르면 대표 작품이 바뀌고 그 썸네일이 가운데로 미끄러져 온다. 대표 작품을 누르면 크게 보기.
 */
export function ArtworkWall({
  images,
  year,
}: {
  images: GalleryImage[];
  year: string;
}) {
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);

  // 고른 썸네일을 캐러셀 가운데로 (페이지 세로 스크롤은 건드리지 않도록 가로만 직접 이동)
  useEffect(() => {
    const row = strip.current;
    const item = row?.children[active] as HTMLElement | undefined;
    if (!row || !item) return;
    row.scrollTo({
      left: item.offsetLeft - (row.clientWidth - item.clientWidth) / 2,
      behavior: "smooth",
    });
  }, [active]);

  // 데스크톱 마우스: 끌어서 넘기기 + 휠을 가로 스크롤로
  const dragged = useRef(false);
  useEffect(() => {
    const row = strip.current;
    if (!row) return;
    let startX = 0;
    let startLeft = 0;
    let down = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      dragged.current = false;
      startX = e.clientX;
      startLeft = row.scrollLeft;
      row.style.cursor = "grabbing";
      // 끄는 동안에는 칸 맞춤을 꺼야 손을 따라 매끄럽게 움직인다
      row.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) dragged.current = true;
      row.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      row.style.cursor = "";
      row.style.scrollSnapType = "";
    };
    // 세로 휠을 가로로. 끝에 닿으면 페이지가 스크롤되도록 놓아준다
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = row.scrollWidth - row.clientWidth;
      const atEdge =
        (e.deltaY < 0 && row.scrollLeft <= 0) ||
        (e.deltaY > 0 && row.scrollLeft >= max - 1);
      if (atEdge) return;
      e.preventDefault();
      row.scrollLeft += e.deltaY;
    };

    row.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    row.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      row.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      row.removeEventListener("wheel", onWheel);
    };
  }, []);

  if (images.length === 0) return null;

  const no = (i: number) => `No. ${String(i + 1).padStart(2, "0")}`;

  return (
    <>
      {/* 대표 작품 */}
      <Reveal className="px-6">
        <button
          type="button"
          onClick={() => setIndex(active)}
          aria-label={`작품 ${active + 1} 크게 보기`}
          className="block w-full bg-paper p-3 shadow-[0_18px_40px_-20px_rgb(17_17_17/0.4)]"
        >
          <span className="relative block aspect-[4/5] overflow-hidden bg-mist">
            {images.map((image, i) => (
              <Image
                key={image.src}
                src={image.src}
                alt=""
                fill
                sizes="(max-width: 600px) 100vw, 600px"
                placeholder="blur"
                blurDataURL={image.blurDataURL}
                className="object-cover"
                // 고른 작품만 보이게, 바뀔 때는 겹쳐지며 전환
                style={{
                  opacity: i === active ? 1 : 0,
                  transition: "opacity 600ms ease-in-out",
                }}
                loading={i === active ? "eager" : "lazy"}
              />
            ))}
          </span>
        </button>
        <div className="mt-3 flex items-start justify-between gap-4">
          <WallLabel
            no={no(active)}
            title="Untitled"
            meta={`${year} · Archival pigment print`}
          />
          <p className="type-meta pt-0.5 tabular-nums">
            {active + 1} / {images.length}
          </p>
        </div>
      </Reveal>

      {/* 전체 작품 목록: 한 줄 캐러셀 (손가락으로 넘기면 칸마다 멈춘다) */}
      <Reveal className="mt-10">
        <div
          ref={strip}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-6 px-6 pb-1 select-none"
          style={{ scrollbarWidth: "none", cursor: "grab" }}
        >
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              // 끌어서 넘긴 경우에는 클릭으로 치지 않는다
              onClick={() => !dragged.current && setActive(i)}
              aria-label={`${no(i)} 보기`}
              draggable={false}
              aria-pressed={i === active}
              className="relative aspect-square w-[22%] shrink-0 snap-center overflow-hidden bg-mist transition-opacity duration-300"
              style={{ opacity: i === active ? 1 : 0.45 }}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="(max-width: 600px) 22vw, 130px"
                placeholder="blur"
                blurDataURL={image.blurDataURL}
                className="pointer-events-none object-cover"
                draggable={false}
              />
              {/* 고른 작품은 안쪽 테두리로 표시 */}
              <span
                aria-hidden
                className="absolute inset-0 transition-[box-shadow] duration-300"
                style={{
                  boxShadow: i === active ? "inset 0 0 0 2px #111111" : "none",
                }}
              />
            </button>
          ))}
        </div>
      </Reveal>

      <GalleryViewer images={images} index={index} onIndexChange={setIndex} />
    </>
  );
}
