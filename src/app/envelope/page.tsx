import type { Metadata } from "next";
import Image from "next/image";
import { DoodleUnderline } from "@/components/envelope/doodles";
import { EnvelopeIntro } from "@/components/envelope/envelope-intro";
import { Deco, PAPER_SHADOW } from "@/components/envelope/deco";
import { Garden } from "@/components/envelope/garden";
import { PaperPage } from "@/components/envelope/paper-page";
import { SpringHeart } from "@/components/envelope/spring-heart";
import { Sprinkles } from "@/components/envelope/sprinkles";
import { STICKER_WIDTH } from "@/components/envelope/sticker-size";
import { AccountAccordion } from "@/components/invitation/account-accordion";
import { Bgm } from "@/components/invitation/bgm";
import { ContactDialog } from "@/components/invitation/contact-dialog";
import { DevEasterEggs } from "@/components/invitation/dev-easter-eggs";
import { Gallery } from "@/components/invitation/gallery";
import { Guestbook } from "@/components/invitation/guestbook";
import { NaverMap } from "@/components/invitation/naver-map";
import { Share } from "@/components/invitation/share";
import { TransportList, VenueInfo } from "@/components/invitation/venue-info";
import { WeddingCalendar } from "@/components/invitation/wedding-calendar";
import { Reveal } from "@/components/ui/reveal";
import { invitation } from "@/config/invitation";
import { koreanDateTime } from "@/lib/date";
import { getGalleryImages, getImages } from "@/lib/gallery";
import { hand, handKo, pen } from "./fonts";

export const metadata: Metadata = {
  title: "We Said Yes — 지수 🖤 영우",
};

const INTRO_PHOTO = "/IMG_4107.jpg"; // 인트로 카드 사진
const GREETING_PHOTO = "/envelope/cake.png"; // 인사말 날짜 아래 케이크
const { groom, bride, venue, accounts, contacts } = invitation;

const GREETING = [
  `서로의 하루를 나누고 함께 걷는 시간이 쌓여
평생을 함께하고 싶은 사이가 되었습니다.`,
  `기쁜 날에는 함께 웃고
힘든 날에는 서로의 손을 잡으며
다가올 계절들을 나란히 걸어가려 합니다.`,
  `따스한 봄을 맞이하는 3월,
저희의 새로운 시작에 함께하시어
자리를 빛내주시면 감사하겠습니다.`,
];

/** 손글씨 제목 + 물결 밑줄 */
function HandTitle({ children }: { children: string }) {
  return (
    <div className="mb-header flex flex-col items-center">
      <h2 className="font-[family-name:var(--font-hand)] text-[32px] leading-none font-bold tracking-[0.04em] text-[#1b1b1b] uppercase">
        {children}
      </h2>
      <DoodleUnderline className="mt-1 h-2.5 w-28 text-[#ad2329]" />
    </div>
  );
}

/**
 * 종이 바탕 위 한 섹션. 좌우 여백은 안에서 정한다: 사진·지도는 꽉 채우고 글·목록만 mx-gutter.
 * heading: 손글씨 제목 대신 쓸 그림 (제목 글자는 화면 읽기용으로만 남긴다)
 */
function Sheet({
  title,
  className = "",
  heading,
  children,
}: {
  title: string;
  className?: string;
  heading?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Reveal className={`relative ${className}`}>
      {heading ? (
        <div className="mb-header flex justify-center">
          <h2 className="sr-only">{title}</h2>
          {heading}
        </div>
      ) : (
        <HandTitle>{title}</HandTitle>
      )}
      {children}
    </Reveal>
  );
}

export default async function EnvelopePage() {
  const [gallery, [art, cake]] = await Promise.all([
    getGalleryImages(),
    getImages([INTRO_PHOTO, GREETING_PHOTO]),
  ]);
  const d = new Date(invitation.date);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" })
    .format(d)
    .replaceAll("-", " ");
  const names = `${bride.en[0].toUpperCase()}${bride.en.slice(1)} & ${groom.en[0].toUpperCase()}${groom.en.slice(1)}`;

  return (
    <PaperPage
      className={`${hand.variable} ${pen.variable} ${handKo.variable}`}
    >
      <Bgm src={invitation.bgm} />

      {/* 1. 봉투 인트로 → 카드 */}
      <EnvelopeIntro date={date} names={names} art={art} />

      <div className="flow-root overflow-x-clip *:my-section">
        <Sheet title="Invitation" className="mx-gutter text-center">
          <p className="type-body mt-stack text-ink-soft">
            {koreanDateTime(invitation.date)}
            <br />
            {venue.name} {venue.hall}
          </p>

          <div className="relative mx-auto mt-header w-[25%]">
            <Image
              src={cake.src}
              alt=""
              width={cake.width}
              height={cake.height}
              sizes="(max-width: 440px) 80vw, 340px"
              placeholder="blur"
              blurDataURL={cake.blurDataURL}
              className="aspect-3/3.5 w-full origin-bottom rotate-[2.5deg] object-fill"
              style={{ filter: PAPER_SHADOW }}
            />
            <Sprinkles />
          </div>

          <div className="relative mt-header space-y-stack">
            <Deco
              name="flower4"
              rotate={-14}
              className="absolute -top-10 -right-15 w-24"
            />
            <Deco
              name="flower2"
              rotate={12}
              className="absolute -bottom-24 -left-14 w-20"
            />
            {GREETING.map((paragraph) => (
              <p
                key={paragraph}
                className="type-body whitespace-pre-line text-stone"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* 레이스 액자에 인트로 사진 */}
          <div className="relative mx-auto mt-block w-[62%]">
            <div className="absolute inset-x-[12%] inset-y-[11%] overflow-hidden">
              <Image
                src={art.src}
                alt=""
                fill
                sizes="(max-width: 440px) 50vw, 220px"
                placeholder="blur"
                blurDataURL={art.blurDataURL}
                className="object-cover"
              />
            </div>
            <Deco name="frame2" className="relative w-full" wiggle={false} />
          </div>

          {/* 혼주 소개: "이OO · 박OO 의 장남 | 영우" 한 줄씩, 이름 열을 세로로 맞춘다. 글꼴은 메인 페이지와 같다 */}
          <dl className="mt-header inline-grid grid-cols-[auto_auto] items-baseline gap-x-4 gap-y-tight text-left">
            {[groom, bride].map((p) => (
              <div key={p.shortName} className="contents">
                <dt className="type-body text-ink-soft">
                  {p.parents.join(" · ")}
                  <span className="type-body-sm ml-1 text-ink-faint">
                    의 {p.relation}
                  </span>
                </dt>
                <dd className="type-name text-[16px]">{p.shortName}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-block flex justify-center">
            <ContactDialog groom={contacts.groom} bride={contacts.bride} />
          </div>
        </Sheet>

        {/* 3. 사진 */}
        <Sheet title="GALLERY">
          <Gallery images={gallery} />
        </Sheet>

        {/* 3-1. 달력 */}
        <Sheet title="Save The Date">
          <WeddingCalendar date={invitation.date} className="mx-gutter" />
          <Deco
            name="ribbon"
            rotate={-14}
            className="absolute top-15 right-5 w-20"
          />
          <Deco
            name="bouquet"
            rotate={-20}
            className="absolute -bottom-10 left-2 w-20"
          />
        </Sheet>

        {/* 4. 오시는 길 */}
        <Sheet title="LOCATION">
          <NaverMap lat={venue.lat} lng={venue.lng} className="h-60" />
          <div className="mx-gutter mt-stack space-y-stack">
            <VenueInfo venue={venue} />
            <TransportList items={venue.transport} />
          </div>
        </Sheet>

        {/* 5. 마음 전하실 곳 */}
        <Sheet title="With Heart">
          <div className="mx-gutter space-y-stack">
            <AccountAccordion
              groups={[
                { title: "신랑측 계좌번호", accounts: accounts.groom },
                { title: "신부측 계좌번호", accounts: accounts.bride },
              ]}
            />
          </div>
        </Sheet>

        {/* 6. 방명록 */}
        <Sheet
          title="Leave A Note"
          heading={<Deco name="guestbook" rotate={-3} className="w-20" />}
        >
          <div className="mx-gutter">
            <Guestbook />
          </div>
        </Sheet>

        {/* 7. 마무리 */}
        <Reveal className="flex flex-col items-center gap-stack text-center">
          <div style={{ width: STICKER_WIDTH }}>
            <SpringHeart rotate={-8} />
          </div>
          <p className="font-[family-name:var(--font-pen)] text-2xl text-[#3a3a3a]/70">
            {names}
          </p>
          <div className="mt-2">
            <Share />
          </div>
        </Reveal>
      </div>

      {/* 맨 아래 꽃밭: crop 을 줄이면 아랫부분이 더 잘려 꽃이 더 내려가 보인다 */}
      <Garden crop={580} />

      <DevEasterEggs
        bride={bride.en}
        groom={groom.en}
        date={invitation.date.slice(0, 10)}
      />
    </PaperPage>
  );
}
