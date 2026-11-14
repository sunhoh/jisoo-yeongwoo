/*
 * 3D 별 기울기 입력. 데스크톱은 마우스 위치, 폰은 기울기 센서를 -1..1 값으로 바꿔 전달한다.
 * iOS는 사용자 탭 안에서 requestMotionPermission()을 불러야 센서 값을 받을 수 있다.
 */

type Tilt = { x: number; y: number };
type Listener = (tilt: Tilt) => void;

const target: Tilt = { x: 0, y: 0 };
const listeners = new Set<Listener>();
let started = false;
let orientationOn = false;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function emit() {
  for (const l of listeners) l(target);
}

function onPointer(e: PointerEvent) {
  if (e.pointerType !== "mouse") return;
  target.x = clamp((e.clientY / window.innerHeight) * 2 - 1);
  target.y = clamp((e.clientX / window.innerWidth) * 2 - 1);
  emit();
}

function onOrientation(e: DeviceOrientationEvent) {
  if (e.beta === null || e.gamma === null) return;
  // 폰을 보통 45도쯤 세워 들고 있다고 보고 그 자세를 중심으로 삼는다
  target.x = clamp((e.beta - 45) / 30);
  target.y = clamp(e.gamma / 30);
  emit();
}

function listenOrientation() {
  if (orientationOn) return;
  orientationOn = true;
  window.addEventListener("deviceorientation", onOrientation);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.addEventListener("pointermove", onPointer, { passive: true });

  // 안드로이드 등 권한이 필요 없는 기기는 바로 센서를 켠다
  const DOE = window.DeviceOrientationEvent as unknown as
    | { requestPermission?: () => Promise<string> }
    | undefined;
  if (DOE && typeof DOE.requestPermission !== "function") listenOrientation();
}

/** 기울기 값을 구독한다. 첫 구독 때 입력 리스너가 붙는다. */
export function subscribeTilt(listener: Listener) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTilt(): Readonly<Tilt> {
  return target;
}

/** iOS 기울기 권한 요청. 반드시 탭/클릭 핸들러 안에서 호출한다. */
export async function requestMotionPermission() {
  start();
  const DOE = window.DeviceOrientationEvent as unknown as
    | { requestPermission?: () => Promise<string> }
    | undefined;
  if (!DOE || typeof DOE.requestPermission !== "function") return;
  try {
    if ((await DOE.requestPermission()) === "granted") listenOrientation();
  } catch {
    // 거절하거나 지원하지 않으면 마우스/정면 고정으로 둔다
  }
}
