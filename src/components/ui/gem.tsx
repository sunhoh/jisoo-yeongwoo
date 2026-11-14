import Image from "next/image";
import { cn } from "@/lib/utils";

const gems = {
  pearl: { src: "/pearl.png", alt: "진주" },
  opal: { src: "/opal.png", alt: "오팔" },
};

/** 섹션 사이 작은 보석 장식 (public/pearl.png, public/opal.png) */
export function Gem({
  type = "pearl",
  size = 14,
  className,
}: {
  type?: keyof typeof gems;
  size?: number;
  className?: string;
}) {
  const gem = gems[type];
  return (
    <Image
      src={gem.src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={cn("pointer-events-none inline-block select-none", className)}
    />
  );
}
