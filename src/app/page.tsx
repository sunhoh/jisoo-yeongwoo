import Image from "next/image";
import { AccountAccordion } from "@/components/invitation/account-accordion";
import { Bgm } from "@/components/invitation/bgm";
import { ContactDialog } from "@/components/invitation/contact-dialog";
import { CoverSlideshow } from "@/components/invitation/cover-slideshow";
import { DateMonogram } from "@/components/invitation/date-monogram";
import { DevEasterEggs } from "@/components/invitation/dev-easter-eggs";
import { FamilyNames } from "@/components/invitation/family-names";
import { Intro } from "@/components/invitation/intro";
import { Gallery } from "@/components/invitation/gallery";
import { Guestbook } from "@/components/invitation/guestbook";
import { NaverMap } from "@/components/invitation/naver-map";
import { Share } from "@/components/invitation/share";
import { TransportList, VenueInfo } from "@/components/invitation/venue-info";
import { WeddingCalendar } from "@/components/invitation/wedding-calendar";
import { GradualBlur } from "@/components/ui/gradual-blur";
import { Reveal } from "@/components/ui/reveal";
import { Signature } from "@/components/ui/signature";
import { CaptionRow, Rule, SectionHeading } from "@/components/ui/typography";
import { invitation } from "@/config/invitation";
import { coverDate } from "@/lib/date";
import { getGalleryImages, getImages } from "@/lib/gallery";

const { groom, bride, venue, accounts, contacts } = invitation;

export default async function Home() {
  const [gallery, coverPhotos, [photo]] = await Promise.all([
    getGalleryImages(),
    getImages(invitation.coverPhotos),
    getImages([invitation.invitationPhoto]),
  ]);
  const { date, time } = coverDate(invitation.date);

  return (
    <>
      <Intro names={`${bride.en} & ${groom.en}`} date={date} />
      <Bgm src={invitation.bgm} />
      {/* 화면 위아래 가장자리 그라데이션 블러 */}
      <GradualBlur />
      {/* 커버: 사진들이 3초마다 페이드되며 바뀌고, 글자는 사진 위에 흰색으로 */}
      <section className="relative flex h-dvh max-h-[860px] min-h-[640px] flex-col bg-ink px-5 pt-4 pb-6 text-paper">
        <CoverSlideshow photos={coverPhotos} />
        {/* 위아래 캡션과 가운데 타이틀이 사진 위에서 읽히도록 은은한 그늘 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgb(0 0 0 / 0.35), rgb(0 0 0 / 0) 22%, rgb(0 0 0 / 0.12) 50%, rgb(0 0 0 / 0) 72%, rgb(0 0 0 / 0.4))",
          }}
        />

        <CaptionRow
          left={bride.en}
          right={groom.en}
          className="relative [&>span]:normal-case"
        />

        <div
          className="relative flex flex-1 flex-col items-center justify-center text-center"
          style={{ textShadow: "0 1px 12px rgb(0 0 0 / 0.35)" }}
        >
          {/* 오프닝이 걷힌 뒤에 등장 */}
          <h1 className="type-display opacity-0 opened:animate-in opened:fade-in opened:slide-in-from-bottom-6 opened:opacity-100 opened:fill-mode-both opened:[animation-delay:400ms] opened:[animation-duration:1600ms]">
            Our First Page
          </h1>
          <p className="type-label mt-1 opacity-0 opened:animate-in opened:fade-in opened:opacity-100 opened:fill-mode-both opened:[animation-delay:1100ms] opened:[animation-duration:1400ms]">
            We&apos;re getting married
          </p>
        </div>

        <CaptionRow
          left={date}
          center="With Love"
          right={time}
          className="relative"
        />
      </section>

      {/* wedding-invitation 기준: 본문 좌우 패딩 없이 사진·지도·갤러리는 폭을 꽉 채우고, 목록만 mx-8 */}
      <div className="space-y-28 py-24">
        {/* 초대 인사 */}
        <section>
          <Reveal className="mb-12 text-center">
            <SectionHeading>Wedding Invitation</SectionHeading>
            <p className="type-body mt-3 text-ink-soft">
              {venue.name} {venue.hall}
            </p>
          </Reveal>
          <Reveal delay={150}>
            <DateMonogram date={invitation.date} />
          </Reveal>
          <Reveal delay={300} className="mt-14 space-y-6 text-center">
            {invitation.greeting.split("\n\n").map((paragraph) => (
              <p
                key={paragraph}
                className="type-body whitespace-pre-line text-stone"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          {/* 인사말 아래 사진 */}
          <Reveal className="mt-16">
            <Image
              src={photo.src}
              width={photo.width}
              height={photo.height}
              alt=""
              sizes="(max-width: 600px) 100vw, 600px"
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              className="block w-full"
            />
          </Reveal>

          <Reveal className="mt-16">
            <FamilyNames groom={groom} bride={bride} />
          </Reveal>

          <Reveal className="mt-14 flex justify-center">
            <ContactDialog groom={contacts.groom} bride={contacts.bride} />
          </Reveal>
        </section>

        {/* 갤러리 */}
        <section>
          <Reveal className="mb-10">
            <SectionHeading>Wedding Gallery</SectionHeading>
            <p className="type-meta mt-2 text-center">
              사진을 누르면 크게 볼 수 있어요
            </p>
          </Reveal>
          <Gallery images={gallery} />
        </section>

        {/* 달력 + 카운트다운 */}
        <Reveal>
          <WeddingCalendar date={invitation.date} className="mx-8" />
        </Reveal>

        {/* 오시는 길 */}
        <section>
          <Reveal className="space-y-6">
            <SectionHeading>Location</SectionHeading>
            <NaverMap lat={venue.lat} lng={venue.lng} className="h-64" />
            <div className="mx-8 space-y-6">
              <VenueInfo venue={venue} />
              <TransportList items={venue.transport} />
            </div>
          </Reveal>
        </section>

        {/* 마음 전하실 곳 */}
        <section>
          <Reveal className="space-y-6">
            <SectionHeading>With Heart</SectionHeading>
            <p className="type-body-sm text-center text-ink-soft">
              참석이 어려우신 분들을 위해 기재했습니다.
            </p>
            <div className="mx-8">
              <AccountAccordion
                groups={[
                  { title: "신랑측 계좌번호", accounts: accounts.groom },
                  { title: "신부측 계좌번호", accounts: accounts.bride },
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* 방명록 */}
        <section>
          <Reveal className="space-y-6">
            <SectionHeading>Guestbook</SectionHeading>
            <div className="mx-8">
              <Guestbook />
            </div>
          </Reveal>
        </section>

        {/* 공유 */}
        <div className="flex justify-center">
          <Share />
        </div>

        <Rule className="mx-8" />
        <p className="type-caption text-center text-ink-soft">
          Jisoo &amp; Yeongwoo · Thank you
        </p>
      </div>

      {/* 개발자용 숨은 장치: 위아래로 더 당기면 <wedding> 태그와 크레딧, 콘솔 인사말 */}
      <DevEasterEggs
        bride={bride.en}
        groom={groom.en}
        date={invitation.date.slice(0, 10)}
      />

      <Signature>jisoo &amp; yeongwoo.</Signature>
    </>
  );
}
