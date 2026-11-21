import type { ComponentProps, ReactNode } from "react";
import { EasterStar } from "./star-shower";

/** 섹션 위 작은 별 장식 + 이탤릭 헤딩 ("✷ CELEBRATE!") */
// ornament = "✷",
export function SectionHeading({
  children,
  ornament = <EasterStar />,
  // ornament = "✷",
  className = "",
}: {
  children: ReactNode;
  ornament?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 text-center ${className}`}
    >
      {ornament && (
        <span aria-hidden className="flex leading-none text-ink">
          {ornament}
        </span>
      )}
      <h2 className="type-heading uppercase">{children}</h2>
    </div>
  );
}

/** 매거진 표지식 3단 캡션 줄 ("2026.12.24 / WITH LOVE / THU 3:00PM") */
export function CaptionRow({
  left,
  center,
  right,
  className = "",
}: {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`type-caption grid grid-cols-3 items-center ${className}`}>
      <span className="text-left">{left}</span>
      <span className="text-center uppercase">{center}</span>
      <span className="text-right uppercase">{right}</span>
    </div>
  );
}

/** 얇은 구분선 */
export function Rule({ className = "", ...props }: ComponentProps<"hr">) {
  return (
    <hr className={`border-0 border-t border-line ${className}`} {...props} />
  );
}
