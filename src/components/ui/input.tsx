import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const field =
  "type-body w-full border-b border-line bg-transparent py-2.5 text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink disabled:opacity-50";

/** 밑줄만 있는 입력창 */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(field, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(field, "min-h-28 resize-none", className)}
      {...props}
    />
  );
}
