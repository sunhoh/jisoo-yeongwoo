"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { CloseLineIcon } from "./icons";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-paper/80 backdrop-blur-sm",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-10/12 max-w-[500px] -translate-x-1/2 -translate-y-1/2",
          "border border-line bg-paper px-6 pt-8 pb-6 shadow-[0_20px_60px_-20px_rgb(17_17_17/0.25)]",
          "duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98]",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            aria-label="닫기"
            className="absolute top-3 right-3 p-2 text-ink-faint transition-colors hover:text-ink"
          >
            <CloseLineIcon className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** 다이얼로그 제목: 이탤릭 영문 헤딩 + 선택적 한글 부제 */
export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("type-heading text-center uppercase", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("type-meta mt-1 text-center", className)}
      {...props}
    />
  );
}
