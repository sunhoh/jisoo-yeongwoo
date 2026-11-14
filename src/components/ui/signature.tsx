/**
 * 페이지 맨 아래 큰 필기체 서명.
 * 폭에 맞춰 크게 깔고 아래쪽을 잘라 화면 밖으로 이어지는 느낌을 준다.
 */
export function Signature({ children }: { children: string }) {
  return (
    <div aria-hidden className="@container overflow-hidden select-none">
      <p className="font-script text-[16cqw] leading-[1.1] tracking-[-0.01em] whitespace-nowrap text-center text-[#e2e2e0] translate-y-[24%] -mt-[4%]">
        {children}
      </p>
    </div>
  );
}
