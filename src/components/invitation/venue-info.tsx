"use client";

import { invitation, type Transport } from "@/config/invitation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowTopRightIcon, MapPointIcon } from "@/components/ui/icons";
import { copy } from "@/lib/copy";

type Venue = typeof invitation.venue;

/** 예식장 이름·주소 + 주소 복사 / 지도 앱 열기 메뉴 */
export function VenueInfo({ venue }: { venue: Venue }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <p className="type-name">
          {venue.name} <span className="font-normal text-ink-soft">{venue.hall}</span>
        </p>
        <p className="type-body-sm mt-1 text-ink-soft">{venue.address}</p>
        <a href={`tel:${venue.tel}`} className="type-meta mt-1 inline-block">
          {venue.tel}
        </a>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="지도 메뉴"
          className="rounded-full border border-line p-2.5 text-ink transition-colors active:bg-mist"
        >
          <MapPointIcon className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => copy(venue.address)}>
            주소 복사하기
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => window.open(venue.links.naver, "_blank")}
          >
            네이버 지도
            <ArrowTopRightIcon className="text-ink-faint" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => window.open(venue.links.kakao, "_blank")}
          >
            카카오맵
            <ArrowTopRightIcon className="text-ink-faint" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** 교통편 안내 목록 */
export function TransportList({ items }: { items: Transport[] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {items.map((t) => (
        <div key={t.label} className="flex gap-4 py-4">
          <dt className="type-body-sm w-14 shrink-0 font-medium">{t.label}</dt>
          <dd className="type-body-sm space-y-1 text-ink-soft">
            {t.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {t.notes?.map((note) => (
              <p key={note} className="type-meta">
                * {note}
              </p>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
