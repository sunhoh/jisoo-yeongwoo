import type { Metadata } from "next";
import { AccountAccordion } from "@/components/invitation/account-accordion";
import { ContactDialog } from "@/components/invitation/contact-dialog";
import { Gallery } from "@/components/invitation/gallery";
import { Guestbook } from "@/components/invitation/guestbook";
import { NaverMap } from "@/components/invitation/naver-map";
import { Share } from "@/components/invitation/share";
import { TransportList, VenueInfo } from "@/components/invitation/venue-info";
import { Button } from "@/components/ui/button";
import { Gem } from "@/components/ui/gem";
import { Reveal } from "@/components/ui/reveal";
import { Signature } from "@/components/ui/signature";
import { Star3D } from "@/components/ui/star-3d";
import { invitation } from "@/config/invitation";
import { getGalleryImages } from "@/lib/gallery";
import {
  CaptionRow,
  InfoRow,
  Rule,
  SectionHeading,
} from "@/components/ui/typography";

// 디자인 시스템 확인용 페이지 (/design)

const colors = [
  { name: "paper", value: "#FFFFFF", className: "bg-paper border border-line" },
  { name: "mist", value: "#F6F6F4", className: "bg-mist" },
  { name: "ink", value: "#111111", className: "bg-ink" },
  { name: "ink-soft", value: "#111 / 65%", className: "bg-ink-soft" },
  { name: "ink-faint", value: "#111 / 35%", className: "bg-ink-faint" },
  { name: "stone", value: "#7F7D77", className: "bg-stone" },
];

const typeScale = [
  { token: "type-display", sample: "Our First Page", spec: "Pinyon Script 40 / 1.3 / +2px" },
  { token: "type-script", sample: "Party", spec: "Pinyon Script 28 / 1.3 / +1px" },
  { token: "type-title", sample: "OUR, WEDDING", spec: "Cormorant Italic 500 · 28 / 1.08" },
  { token: "type-heading", sample: "CELEBRATE!", spec: "Cormorant Italic 500 · 20 / 1.5" },
  { token: "type-label", sample: "We're getting married", spec: "Cormorant Italic 500 · 15 / +0.5px" },
  { token: "type-caption", sample: "2026.12.24 · WITH LOVE", spec: "Cormorant Italic 500 · 13 / 1.5" },
  { token: "type-name", sample: "김지수 · 이영우", spec: "SUIT 700 · 15 / -0.03em" },
  { token: "type-body", sample: "서로에게 행복을 주는 사람을 만났습니다.", spec: "SUIT 400 · 14 / 1.6 / -0.03em" },
  { token: "type-body-sm", sample: "서울특별시 강남구 선릉로 757", spec: "SUIT 400 · 13 / 1.6" },
  { token: "type-meta", sample: "Our Story · Wedding Photo", spec: "SUIT 400 · 12 · stone" },
];

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false },
};

export default async function DesignSystemPage() {
  const gallery = await getGalleryImages();

  return (
    <>
      {/* Cover sample */}
      <section className="relative flex h-dvh max-h-[860px] min-h-[640px] flex-col bg-gradient-to-b from-[#e9e9e7] via-[#d6d6d3] to-paper px-5 pt-4 pb-6">
        <CaptionRow left="jisoo" right="yeongwoo" className="[&>span]:normal-case" />

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="type-meta mb-6">사진 자리 · 흑백 웨딩 사진</span>
          <h1 className="type-display animate-in fade-in slide-in-from-bottom-6 fill-mode-both [animation-duration:1400ms]">
            Our First Page
          </h1>
          <p className="type-label mt-1 animate-in fade-in fill-mode-both [animation-delay:600ms] [animation-duration:1200ms]">
            We&apos;re getting married
          </p>
        </div>

        <CaptionRow left="2027.05.22" center="With Love" right="Sat 1:00PM" />
      </section>

      <div className="space-y-24 px-6 py-24">
        <Reveal>
          <SectionHeading>Design System</SectionHeading>
          <p className="type-body-sm mt-4 text-center text-ink-soft">
            흰 배경 위 거의 검정의 잉크. 장식은 줄이고
            <br />
            굵기와 투명도로만 위계를 나눕니다.
          </p>
        </Reveal>

        {/* Colors */}
        <Reveal className="space-y-5">
          <p className="type-label text-center">Colors.</p>
          <div className="grid grid-cols-3 gap-x-3 gap-y-5">
            {colors.map((c) => (
              <div key={c.name} className="space-y-2">
                <div className={`aspect-square rounded-sm ${c.className}`} />
                <div>
                  <p className="type-body-sm font-medium">{c.name}</p>
                  <p className="type-meta">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Ornament */}
        <Reveal className="space-y-6">
          <p className="type-label text-center">Ornament.</p>
          <div className="grid grid-cols-3 gap-3">
            {(["ink", "chrome", "pearl"] as const).map((finish) => (
              <div
                key={finish}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-5 bg-mist"
              >
                <Star3D size={80} finish={finish} />
                <span className="type-meta">{finish}</span>
              </div>
            ))}
          </div>
          <p className="type-meta text-center">
            {"<Star3D size finish spin />"}
          </p>
        </Reveal>

        {/* Typography */}
        <Reveal className="space-y-5">
          <p className="type-label text-center">Typography.</p>
          <div className="divide-y divide-line border-y border-line">
            {typeScale.map((t) => (
              <div key={t.token} className="space-y-1.5 py-4">
                <p className={t.token}>{t.sample}</p>
                <p className="type-meta">
                  <span className="text-ink">.{t.token}</span> — {t.spec}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Components */}
        <Reveal className="space-y-10">
          <p className="type-label text-center">Components.</p>

          <div className="space-y-6 text-center">
            <SectionHeading>Celebrate!</SectionHeading>
            <p className="type-body-sm text-stone">
              서로에게 행복을 주는 사람을 만났습니다.
              <br />
              웃는 날도, 흔들리는 날도 함께 걸어가려 합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 text-center">
            {[
              { role: "Groom.", name: "이영우", parents: "이OO · 박OO 의 아들" },
              { role: "Bride.", name: "김지수", parents: "김OO · 최OO 의 딸" },
            ].map((p) => (
              <div key={p.role} className="space-y-1">
                <p className="type-label">{p.role}</p>
                <p className="type-name">{p.name}</p>
                <p className="type-body-sm text-ink-soft">{p.parents}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <span className="type-script">D</span>
            <span className="type-name ml-1">-191일 ෆ</span>
          </div>

          <dl className="divide-y divide-line border-y border-line">
            <InfoRow label="셔틀버스">행사 당일 30분 간격 운행</InfoRow>
            <InfoRow label="SRT/KTX">수서역 하차 → 택시 15분 내외</InfoRow>
          </dl>

          <div className="flex justify-center gap-2">
            <Button>네이버 지도</Button>
            <Button>카카오맵</Button>
            <Button>티맵</Button>
          </div>
        </Reveal>

        {/* Wedding components — 값은 src/config/invitation.ts */}
        <div className="space-y-20">
          <p className="type-label text-center">Wedding Components.</p>

          <Reveal className="space-y-4 text-center">
            <p className="type-meta">Gem · ContactDialog</p>
            <div className="flex items-center justify-center gap-3">
              <Gem />
              <Gem type="opal" />
            </div>
            <ContactDialog
              groom={invitation.contacts.groom}
              bride={invitation.contacts.bride}
            />
          </Reveal>

          <Reveal className="space-y-6">
            <SectionHeading>Gallery</SectionHeading>
            <Gallery images={gallery} />
          </Reveal>

          <Reveal className="space-y-6">
            <SectionHeading>Location</SectionHeading>
            <NaverMap
              lat={invitation.venue.lat}
              lng={invitation.venue.lng}
              className="-mx-6 h-64"
            />
            <VenueInfo venue={invitation.venue} />
            <TransportList items={invitation.venue.transport} />
          </Reveal>

          <Reveal className="space-y-6">
            <SectionHeading>With Heart</SectionHeading>
            <p className="type-body-sm text-center text-ink-soft">
              참석이 어려우신 분들을 위해 기재했습니다.
            </p>
            <AccountAccordion
              groups={[
                { title: "신랑측 계좌번호", accounts: invitation.accounts.groom },
                { title: "신부측 계좌번호", accounts: invitation.accounts.bride },
              ]}
            />
          </Reveal>

          <Reveal className="space-y-6">
            <SectionHeading>Guestbook</SectionHeading>
            <Guestbook />
          </Reveal>

          <div className="flex justify-center">
            <Share />
          </div>
        </div>

        {/* Motion */}
        <div className="space-y-5">
          <p className="type-label text-center">Motion.</p>
          <p className="type-body-sm text-center text-ink-soft">
            스크롤 시 1초 페이드 + 16px 상승, 순차 지연
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[0, 150, 300].map((d) => (
              <Reveal key={d} delay={d}>
                <div className="flex aspect-[3/4] items-end rounded-sm bg-mist p-2">
                  <span className="type-meta">{d}ms</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Rule />
        <p className="type-caption text-center text-ink-soft">
          Jisoo &amp; Yeongwoo · Thank you
        </p>
      </div>

      <Signature>jisoo &amp; yeongwoo.</Signature>
    </>
  );
}
