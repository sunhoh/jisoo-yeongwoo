import { monogramDate } from "@/lib/date";
import { cn } from "@/lib/utils";

/**
 * 큰 연회색 "03/27" 숫자 위에 필기체 "27 March"를 겹치고, 아래에 연도와 시간을 둔 날짜 모노그램.
 */
export function DateMonogram({ date, className }: { date: string; className?: string }) {
  const { month, day, script, year, time } = monogramDate(date);

  return (
    <div className={cn("flex flex-col items-center select-none", className)}>
      <div className="relative flex items-center justify-center">
        <span className="font-serif text-[112px] leading-none font-light tracking-[-0.04em] text-ink-faint/60 lining-nums">
          {month}
        </span>
        {/* 두 숫자 사이 사선 */}
        <span aria-hidden className="mx-3 h-[118px] w-px rotate-[22deg] bg-ink-faint" />
        <span className="font-serif text-[112px] leading-none font-light tracking-[-0.04em] text-ink-faint/60 lining-nums">
          {day}
        </span>

        <span className="font-script absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] text-[34px] leading-none tracking-[1px] whitespace-nowrap text-ink">
          {script}
        </span>
      </div>
      <span className="mt-5 font-serif text-[15px] font-medium tracking-[0.08em] text-ink lining-nums">
        {year}
        <span aria-hidden className="mx-2.5 text-ink-faint">·</span>
        {time}
      </span>
    </div>
  );
}
