import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  /** 테두리만 있는 둥근 버튼 (기본) */
  outline:
    "rounded-full border border-line text-ink hover:border-ink active:bg-mist",
  /** 검정 채움 — 폼 제출 */
  solid: "rounded-full bg-ink text-paper active:bg-ink/85",
  /** 텍스트만 — 취소 등 */
  ghost: "rounded-full text-ink-soft active:bg-mist",
};

const sizes = {
  sm: "h-9 px-4 gap-1.5",
  md: "h-11 px-5 gap-2",
};

export type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  variant = "outline",
  size = "sm",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "type-body-sm inline-flex items-center justify-center whitespace-nowrap transition-colors duration-300 select-none",
        "disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
