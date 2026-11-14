// 예식 일시 표시용. 서버 시간대와 상관없이 한국 시간 기준으로 쪼갠다.

function partsOf(iso: string) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
}

/** 커버 캡션: "2027.03.27" / "Sat 5:00PM" */
export function coverDate(iso: string) {
  const p = partsOf(iso);
  return {
    date: `${p.year}.${p.month}.${p.day}`,
    time: `${p.weekday} ${p.hour}:${p.minute}${p.dayPeriod}`,
  };
}

/** 날짜 모노그램: "03" / "27" / "27 March" / "2027" / "SAT 5:00 PM" */
export function monogramDate(iso: string) {
  const p = partsOf(iso);
  const monthName = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "long",
  }).format(new Date(iso));
  return {
    month: p.month,
    day: p.day,
    script: `${Number(p.day)} ${monthName}`,
    year: p.year,
    time: `${p.weekday} ${p.hour}:${p.minute} ${p.dayPeriod}`.toUpperCase(),
  };
}
