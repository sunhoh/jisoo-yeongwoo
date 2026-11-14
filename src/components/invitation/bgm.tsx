"use client";

import { useEffect, useRef, useState } from "react";

const PLAY_EVENT = "bgm:play";
const FADE_IN = 2500;
const VOLUME = 0.7;

/**
 * 배경음악 재생 요청. 브라우저 자동재생 제한 때문에 반드시 탭/클릭 핸들러 안에서 동기로 불러야 한다.
 */
export function startBgm() {
  window.dispatchEvent(new Event(PLAY_EVENT));
}

/**
 * 배경음악 + 우측 하단 재생/정지 버튼.
 * 인트로 탭(startBgm)으로 시작하고, 탭이 숨으면 잠시 멈췄다가 돌아오면 이어서 재생한다.
 */
export function Bgm({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const fade = useRef(0);

  const play = () => {
    const el = audio.current;
    if (!el) return;
    // 볼륨을 0에서 천천히 올린다 (iOS는 볼륨 조절이 막혀 있어 바로 원래 크기로 나온다)
    el.volume = 0;
    const started = performance.now();
    cancelAnimationFrame(fade.current);
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / FADE_IN);
      el.volume = VOLUME * t * t;
      if (t < 1) fade.current = requestAnimationFrame(step);
    };
    el.play()
      .then(() => {
        fade.current = requestAnimationFrame(step);
      })
      .catch(() => setPlaying(false));
  };

  const pause = () => {
    cancelAnimationFrame(fade.current);
    audio.current?.pause();
  };

  useEffect(() => {
    window.addEventListener(PLAY_EVENT, play);

    // 다른 앱/탭으로 가면 멈추고, 돌아오면 이어서
    let resume = false;
    const onVisibility = () => {
      const el = audio.current;
      if (!el) return;
      if (document.hidden) {
        resume = !el.paused;
        el.pause();
      } else if (resume) {
        void el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener(PLAY_EVENT, play);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(fade.current);
    };
  }, []);

  return (
    <>
      <audio
        ref={audio}
        src={src}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 w-full max-w-invite -translate-x-1/2 px-5">
        <button
          type="button"
          onClick={() => (playing ? pause() : play())}
          aria-label={playing ? "배경음악 끄기" : "배경음악 켜기"}
          aria-pressed={playing}
          className="pointer-events-auto ml-auto flex size-10 items-center justify-center rounded-full border border-line bg-paper/85 text-ink backdrop-blur transition-colors active:bg-mist"
        >
          {/* 재생 중이면 막대가 출렁이고, 멈추면 낮게 가라앉는다 */}
          <span aria-hidden className="flex h-3.5 items-center gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <Bar key={i} index={i} playing={playing} />
            ))}
          </span>
        </button>
      </div>
    </>
  );
}

/**
 * 음악 버튼 막대 하나. 전역 CSS 없이 Web Animations로 움직여서, 스타일 파일 상태와 상관없이 항상 보인다.
 * 끝이 둥근 알약 모양이 눌려 찌그러지지 않도록 scale 대신 height를 바꾼다.
 */
const BAR_MIN = 4;
const BAR_MAX = 14;

function Bar({ index, playing }: { index: number; playing: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.animate([{ height: `${BAR_MIN}px` }], { duration: 300, fill: "forwards", easing: "ease-out" });
      return;
    }
    const anim = el.animate(
      [{ height: `${BAR_MIN + 1}px` }, { height: `${BAR_MAX}px` }, { height: `${BAR_MIN + 1}px` }],
      { duration: 1100, delay: index * 160, iterations: Infinity, easing: "ease-in-out" },
    );
    return () => anim.cancel();
  }, [playing, index]);

  return (
    <span
      ref={ref}
      className="w-[3px] rounded-full bg-ink"
      style={{ height: BAR_MIN }}
    />
  );
}
