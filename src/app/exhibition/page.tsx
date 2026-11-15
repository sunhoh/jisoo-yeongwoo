import type { Metadata } from "next";
import { ArtworkWall, WallLabel } from "@/components/exhibition/artwork-wall";
import { TicketIntro } from "@/components/exhibition/ticket-intro";
import { AccountAccordion } from "@/components/invitation/account-accordion";
import { Bgm } from "@/components/invitation/bgm";
import { ContactDialog } from "@/components/invitation/contact-dialog";
import { CoverSlideshow } from "@/components/invitation/cover-slideshow";
import { DevEasterEggs } from "@/components/invitation/dev-easter-eggs";
import { Guestbook } from "@/components/invitation/guestbook";
import { NaverMap } from "@/components/invitation/naver-map";
import { Share } from "@/components/invitation/share";
import { TransportList, VenueInfo } from "@/components/invitation/venue-info";
import { Reveal } from "@/components/ui/reveal";
import { invitation } from "@/config/invitation";
import { coverDate } from "@/lib/date";
import { getGalleryImages, getImages } from "@/lib/gallery";

// 전시회 컨셉 청첩장 (/exhibition). 내용은 메인과 같은 src/config/invitation.ts

export const metadata: Metadata = {
  title: "The First Page — 지수 🖤 영우",
};

const { groom, bride, venue, accounts, contacts } = invitation;
const TITLE = "The First Page";

/** 섹션 머리: 작은 영문 라벨 + 큰 한글 제목 */
function SectionHead({ en, ko, aside }: { en: string; ko: string; aside?: string }) {
  return (
    <Reveal className="mb-10 px-8">
      <div className="flex items-baseline justify-between border-t border-ink pt-3">
        <p className="text-[10px] font-bold tracking-[0.18em] text-ink">{en}</p>
        {aside && <p className="type-meta tabular-nums">{aside}</p>}
      </div>
      <h2 className="mt-5 text-[28px] leading-tight font-bold tracking-[-0.03em] text-ink">{ko}</h2>
    </Reveal>
  );
}

export default async function ExhibitionPage() {
  const [gallery, coverPhotos] = await Promise.all([
    getGalleryImages(),
    getImages(invitation.coverPhotos),
  ]);
  const { date, time } = coverDate(invitation.date);
  const year = date.slice(0, 4);
  const names = `${bride.en} & ${groom.en}`;
  const venueName = `${venue.name} ${venue.hall}`;

  return (
    <>
      <TicketIntro
        title={TITLE}
        names={names}
        date={date}
        time={time.toUpperCase()}
        venue={venueName}
        serial={`No. ${date.replaceAll(".", "")}`}
      />
      <Bgm src={invitation.bgm} />

      {/* 전시 포스터 */}
      <section className="flex min-h-dvh flex-col px-6 pt-6 pb-10">
        <div className="flex items-baseline justify-between text-[10px] font-bold tracking-[0.18em] text-ink">
          <span>EXHIBITION</span>
          <span className="tabular-nums">{year}</span>
        </div>

        <h1 className="mt-10 text-[clamp(56px,17vw,96px)] leading-[0.86] font-bold tracking-[-0.05em] text-ink uppercase">
          The
          <br />
          First
          <br />
          Page
        </h1>
        <p className="type-label mt-4 text-ink-soft">{names}</p>

        {/* 액자에 건 커버 사진 (두 장이 번갈아) */}
        <div className="mt-10 bg-paper p-3 shadow-[0_18px_40px_-20px_rgb(17_17_17/0.4)]">
          <div className="relative aspect-[4/5] overflow-hidden bg-ink">
            <CoverSlideshow photos={coverPhotos} />
          </div>
        </div>
        <WallLabel
          className="mt-3"
          no="No. 00"
          title={`${TITLE}, ${year}`}
          meta={`${names} · Mixed media, love`}
        />

        <dl className="mt-12 grid grid-cols-2 gap-4 border-t border-ink pt-4 text-[11px] tracking-[0.04em]">
          <div>
            <dt className="font-bold text-ink">OPENING</dt>
            <dd className="mt-1 text-ink-soft tabular-nums">
              {date} {time.toUpperCase()}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-ink">VENUE</dt>
            <dd className="mt-1 text-ink-soft">{venueName}</dd>
          </div>
        </dl>
      </section>

      <div className="space-y-32 pt-16 pb-24">
        {/* 전시 서문 */}
        <section>
          <SectionHead en="CURATOR'S NOTE" ko="전시 서문" />
          <Reveal className="space-y-6 px-8">
            {invitation.greeting.split("\n\n").map((paragraph) => (
              <p key={paragraph} className="type-body whitespace-pre-line text-ink-soft">
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal className="mt-12 px-8">
            <p className="text-[10px] font-bold tracking-[0.18em] text-ink">CURATED BY</p>
            <dl className="mt-3 space-y-2">
              {[groom, bride].map((p) => (
                <div key={p.shortName} className="type-body flex items-baseline gap-3">
                  <dt className="text-ink-soft">{p.parents.join(" · ")}</dt>
                  <dd>
                    <span className="text-ink-soft">의 {p.relation} </span>
                    <span className="font-bold text-ink">{p.shortName}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <ContactDialog groom={contacts.groom} bride={contacts.bride} />
            </div>
          </Reveal>
        </section>

        {/* 작품 */}
        <section>
          <SectionHead en="WORKS" ko="작품" aside={`${gallery.length} works`} />
          <ArtworkWall images={gallery} year={year} />
        </section>

        {/* 관람 안내 */}
        <section>
          <SectionHead en="VISITOR INFORMATION" ko="관람 안내" />
          <Reveal className="px-8">
            <dl className="divide-y divide-line border-y border-line">
              {[
                ["OPENING", `${date} ${time.toUpperCase()}`],
                ["VENUE", venueName],
                ["ADMISSION", "Free · 소중한 분들 모두"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 py-3.5">
                  <dt className="w-24 shrink-0 text-[11px] font-bold tracking-[0.12em] text-ink">
                    {k}
                  </dt>
                  <dd className="type-body-sm text-ink-soft tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal className="mt-10 space-y-6">
            <NaverMap lat={venue.lat} lng={venue.lng} className="h-64" />
            <div className="mx-8 space-y-6">
              <VenueInfo venue={venue} />
              <TransportList items={venue.transport} />
            </div>
          </Reveal>
        </section>

        {/* 후원 안내 */}
        <section>
          <SectionHead en="SUPPORT" ko="후원 안내" />
          <Reveal className="px-8">
            <p className="type-body-sm mb-6 text-ink-soft">
              참석이 어려우신 분들을 위해 기재했습니다.
            </p>
            <AccountAccordion
              groups={[
                { title: "신랑측 계좌번호", accounts: accounts.groom },
                { title: "신부측 계좌번호", accounts: accounts.bride },
              ]}
            />
          </Reveal>
        </section>

        {/* 방명록 */}
        <section>
          <SectionHead en="VISITOR'S BOOK" ko="방명록" />
          <Reveal className="px-8">
            <Guestbook />
          </Reveal>
        </section>

        {/* 출구 */}
        <section className="px-8 text-center">
          <p className="text-[clamp(44px,13vw,72px)] leading-none font-bold tracking-[-0.05em] text-ink uppercase">
            Exit
          </p>
          <p className="type-label mt-3 text-ink-soft">Thank you for visiting.</p>
          <div className="mt-10 flex justify-center">
            <Share />
          </div>
        </section>
      </div>

      <DevEasterEggs bride={bride.en} groom={groom.en} date={invitation.date.slice(0, 10)} />
    </>
  );
}
