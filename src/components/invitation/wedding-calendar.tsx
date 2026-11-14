"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** 한국 시간 기준 연·월·일 */
function seoulYmd(iso: string) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(iso))
    .split("-")
    .map(Number);
  return { year: y, month: m, day: d };
}

/** 예식 달 달력 + 남은 날짜 + 실시간 카운트다운 */
export function WeddingCalendar({ date, className }: { date: string; className?: string }) {
  const { year, month, day } = seoulYmd(date);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={cn("bg-mist px-6 pt-12 pb-14", className)}>
      <h3 className="text-center font-serif text-[30px] leading-none font-semibold lining-nums">
        {MONTHS[month - 1]} {year}
      </h3>

      <div className="mx-auto mt-9 grid max-w-[320px] grid-cols-7 gap-y-3 text-center">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="type-meta pb-1 text-[10px] text-ink-faint">
            {w}
          </span>
        ))}
        {cells.map((d, i) => (
          <span key={i} className="flex justify-center">
            {d && (
              <span
                className={cn(
                  "type-body-sm flex size-8 items-center justify-center rounded-full lining-nums",
                  d === day ? "bg-ink/10 font-bold text-ink" : "text-ink-soft",
                )}
              >
                {d}
              </span>
            )}
          </span>
        ))}
      </div>

      <Countdown date={date} />
    </div>
  );
}

const UNITS = [
  { label: "DAYS", ms: 86_400_000 },
  { label: "HOURS", ms: 3_600_000 },
  { label: "MINS", ms: 60_000 },
  { label: "SECS", ms: 1_000 },
];

function Countdown({ date }: { date: string }) {
  // 서버 렌더와 어긋나지 않게 현재 시각은 마운트 뒤에 읽는다
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = now === null ? null : Math.max(0, new Date(date).getTime() - now);
  // 일·시·분·초로 쪼개기: 각 단위는 바로 위 단위로 나눈 나머지
  const values = UNITS.map(({ ms }, i) => {
    const total = remaining ?? 0;
    const within = i === 0 ? total : total % UNITS[i - 1].ms;
    return Math.floor(within / ms);
  });

  return (
    <div className="mt-10">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <p className="type-caption text-ink-faint lining-nums">
          {remaining === null
            ? " "
            : remaining === 0
              ? "Just married"
              : `${values[0]} Days to go`}
        </p>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="mx-auto mt-7 grid max-w-[300px] grid-cols-4 text-center">
        {UNITS.map(({ label }, i) => (
          <div key={label}>
            <p className="font-serif text-[30px] leading-none font-semibold tabular-nums lining-nums">
              {remaining === null ? "–" : i === 0 ? values[i] : String(values[i]).padStart(2, "0")}
            </p>
            <p className="type-meta mt-2 text-[9px] tracking-[0.08em] text-ink-faint">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
