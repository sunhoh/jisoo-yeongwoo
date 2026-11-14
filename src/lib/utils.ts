import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// type-* 는 커스텀 유틸리티라 tailwind-merge가 text-* 와 충돌로 오인하지 않도록 따로 등록
const twMerge = extendTailwindMerge<"type-scale">({
  extend: {
    classGroups: {
      "type-scale": [
        {
          type: [
            "display",
            "script",
            "title",
            "heading",
            "label",
            "caption",
            "body",
            "body-sm",
            "name",
            "meta",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
