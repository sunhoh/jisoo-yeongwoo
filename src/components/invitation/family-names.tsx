type Person = {
  shortName: string;
  parents: string[];
  relation: string;
};

/**
 * 혼주 소개: 부모님 이름 두 줄 + "의 장남 영우".
 * 열 너비를 맞춰 신랑·신부 두 줄의 "의 / 관계 / 이름"이 세로로 정렬되게 한다.
 */
export function FamilyNames({ groom, bride }: { groom: Person; bride: Person }) {
  return (
    <dl className="mx-auto grid w-fit grid-cols-[auto_auto_auto_auto] items-center gap-x-4 gap-y-8">
      {[groom, bride].map((p) => (
        <div key={p.shortName} className="contents">
          <dt className="type-body leading-[1.7] text-ink-soft">
            {p.parents.map((name) => (
              <span key={name} className="block">
                {name}
              </span>
            ))}
          </dt>
          <dd className="type-body text-ink-soft">의</dd>
          <dd className="type-body text-ink-soft">{p.relation}</dd>
          <dd className="type-name text-[16px]">{p.shortName}</dd>
        </div>
      ))}
    </dl>
  );
}
