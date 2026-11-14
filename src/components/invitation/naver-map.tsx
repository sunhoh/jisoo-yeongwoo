"use client";

import Script from "next/script";
import { useRef } from "react";
import { DestinationIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// NCP 콘솔(Maps > Application)에서 발급받은 Client ID
const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    naver: any;
  }
}

/** 네이버 지도 + "예식장으로 돌아가기" 버튼. 흑백 무드에 맞춰 지도는 채도를 뺀다. */
export function NaverMap({
  lat,
  lng,
  className,
}: {
  lat: number;
  lng: number;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);

  const initMap = () => {
    if (!container.current) return;
    const { maps } = window.naver;
    const position = new maps.LatLng(lat, lng);
    map.current = new maps.Map(container.current, {
      center: position,
      zoom: 16,
      scaleControl: false,
      mapDataControl: false,
    });
    new maps.Marker({ position, map: map.current });
  };

  const recenter = () => {
    if (!map.current) return;
    map.current.setCenter(new window.naver.maps.LatLng(lat, lng));
    map.current.setZoom(16);
  };

  return (
    <>
      {CLIENT_ID && (
        <Script
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`}
          onReady={initMap}
        />
      )}
      <div className={cn("relative overflow-hidden bg-mist", className)}>
        <div ref={container} className="size-full grayscale" />
        {!CLIENT_ID && (
          <p className="type-meta absolute inset-0 flex items-center justify-center">
            NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 설정 필요
          </p>
        )}
        <button
          type="button"
          onClick={recenter}
          aria-label="예식장 위치로 이동"
          className="absolute right-3 bottom-3 z-10 rounded-full border border-line bg-paper p-2 text-ink transition-colors active:bg-mist"
        >
          <DestinationIcon className="size-5" />
        </button>
      </div>
    </>
  );
}
