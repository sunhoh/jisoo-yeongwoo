"use client";

import { useState } from "react";
import { VolumeOffIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** 자동재생 루프 영상 (음소거로 시작, 버튼으로 해제) */
export function VideoPlayer({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const [muted, setMuted] = useState(true);

  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden bg-mist", className)}>
      <video
        className="size-full object-cover"
        src={src}
        poster={poster}
        preload="auto"
        autoPlay
        loop
        playsInline
        muted={muted}
      />
      {muted && (
        <button
          type="button"
          onClick={() => setMuted(false)}
          className="type-meta absolute top-4 left-4 flex items-center gap-1 rounded-full bg-paper/85 px-3 py-1.5 text-ink backdrop-blur active:bg-paper"
        >
          <VolumeOffIcon />
          음소거 해제
        </button>
      )}
    </div>
  );
}
