"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { GalleryImage } from "@/lib/gallery";

const INTERVAL = 3000;
const FADE = 1200;

/**
 * 커버 배경 사진. 여러 장이면 INTERVAL마다 서로 겹쳐지며(크로스페이드) 바뀐다.
 * 부모는 relative 여야 한다.
 */
export function CoverSlideshow({ photos }: { photos: GalleryImage[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), INTERVAL);
    return () => clearInterval(id);
  }, [photos.length]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {photos.map((photo, i) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt=""
          fill
          priority={i === 0}
          sizes="(max-width: 600px) 100vw, 600px"
          placeholder="blur"
          blurDataURL={photo.blurDataURL}
          className="object-cover"
          style={{
            opacity: i === index ? 1 : 0,
            transition: `opacity ${FADE}ms ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}
