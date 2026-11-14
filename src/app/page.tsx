import { AccountAccordion } from "@/components/invitation/account-accordion";
import { Bgm } from "@/components/invitation/bgm";
import Image from "next/image";
import { ContactDialog } from "@/components/invitation/contact-dialog";
import { DateMonogram } from "@/components/invitation/date-monogram";
import { FamilyNames } from "@/components/invitation/family-names";
import { Intro } from "@/components/invitation/intro";
import { Gallery } from "@/components/invitation/gallery";
import { Guestbook } from "@/components/invitation/guestbook";
import { NaverMap } from "@/components/invitation/naver-map";
import { Share } from "@/components/invitation/share";
import { TransportList, VenueInfo } from "@/components/invitation/venue-info";
import { WeddingCalendar } from "@/components/invitation/wedding-calendar";
import { Reveal } from "@/components/ui/reveal";
import { Signature } from "@/components/ui/signature";
import { CaptionRow, Rule, SectionHeading } from "@/components/ui/typography";
import { invitation } from "@/config/invitation";
import { coverDate } from "@/lib/date";
import { getGalleryImages, getImage } from "@/lib/gallery";

const { groom, bride, venue, accounts, contacts } = invitation;

export default async function Home() {
  const [gallery, photo] = await Promise.all([
    getGalleryImages(),
    getImage(invitation.invitationPhoto),
  ]);
  const { date, time } = coverDate(invitation.date);

  return (
    <>
      <Intro names={`${bride.en} & ${groom.en}`} date={date} />
      <Bgm src={invitation.bgm} />
      {/* 커버 */}
      <section className="relative flex h-dvh max-h-[860px] min-h-[640px] flex-col bg-gradient-to-b from-[#e9e9e7] via-[#d6d6d3] to-paper px-5 pt-4 pb-6">
        <CaptionRow left={bride.en} right={groom.en} className="[&>span]:normal-case" />

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="type-meta mb-6">사진 자리 · 흑백 웨딩 사진</span>
          {/* 오프닝이 걷힌 뒤에 등장 */}
          <h1 className="type-display opacity-0 opened:animate-in opened:fade-in opened:slide-in-from-bottom-6 opened:opacity-100 opened:fill-mode-both opened:[animation-delay:400ms] opened:[animation-duration:1600ms]">
            Our First Page
          </h1>
          <p className="type-label mt-1 opacity-0 opened:animate-in opened:fade-in opened:opacity-100 opened:fill-mode-both opened:[animation-delay:1100ms] opened:[animation-duration:1400ms]">
            We&apos;re getting married
          </p>
        </div>

        <CaptionRow left={date} center="With Love" right={time} />
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
              <p key={paragraph} className="type-body whitespace-pre-line text-stone">
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal className="mt-16">
            <Image
              src={photo.src}
              width={photo.width}
              height={photo.height}
              alt=""
              sizes="(max-width: 600px) 100vw, 600px"
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              className="w-full"
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
            <p className="type-meta mt-2 text-center">사진을 누르면 크게 볼 수 있어요</p>
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

      <Signature>jisoo &amp; yeongwoo.</Signature>
    </>
  );
}
