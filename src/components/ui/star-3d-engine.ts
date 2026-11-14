import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { getTilt, subscribeTilt } from "@/lib/tilt";

/*
 * ✷ 리퀴드 메탈 렌더러.
 * 페이지에 별이 여러 개 있어도 WebGL 컨텍스트는 하나만 쓰고,
 * 렌더 결과를 각 별의 2D 캔버스에 복사한다.
 */

export type StarFinish = "ink" | "chrome" | "pearl";

type Entry = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  finish: StarFinish;
  spin: boolean;
  visible: boolean;
  drawn: boolean;
};

const RENDER_SIZE = 384;
const SPIN_SPEED = 0.7; // rad/s
const SPIN_TILT = -0.22; // 회전할 때는 살짝 내려다본다
// 마우스·기울기에 따라 정면 별이 돌아가는 최대 각도 (rad)
const TILT_RANGE = { x: 0.42, y: 0.55 };
const TILT_EASE = 0.08;

// ---------- geometry ----------

const RAYS = 8;
const VALLEY = 0.34;

/** ✷ 외곽선: 끝점 8개 + 사이 골 8개 */
function starOutline() {
  const pts: [number, number][] = [];
  for (let i = 0; i < RAYS * 2; i++) {
    const r = i % 2 === 0 ? 1 : VALLEY;
    const a = (i * Math.PI) / RAYS + Math.PI / 2;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

function distanceToOutline(x: number, y: number, poly: [number, number][]) {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[(i + 1) % poly.length];
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
  }
  return best;
}

/**
 * 외곽선 안쪽을 풍선처럼 부풀린 앞면 메시.
 * 가시마다 (중심 - 골 - 끝 - 골) 사각 패치를 따로 짜서 가장자리가 외곽선과 정확히 맞물리게 하고,
 * 높이는 외곽선까지 거리로 만든 원형 단면이라 가시 가운데에 자연스러운 능선이 생긴다.
 */
function inflatedStar(height: number, n = 56) {
  const poly = starOutline();
  const center = [0, 0] as const;
  const positions: number[] = [];
  const faces: number[] = [];
  const dists: number[] = [];

  // 가장자리(1 쪽)로 갈수록 촘촘하게 — 경사가 급한 테두리를 매끈하게
  const ease = (t: number) => Math.sin((t * Math.PI) / 2);

  for (let r = 0; r < RAYS; r++) {
    const tip = poly[r * 2];
    const v1 = poly[(r * 2 + 1) % poly.length];
    const v2 = poly[(r * 2 - 1 + poly.length) % poly.length];
    const base = positions.length / 3;

    for (let j = 0; j <= n; j++) {
      const v = ease(j / n);
      for (let i = 0; i <= n; i++) {
        const u = ease(i / n);
        // 양선형 보간: (0,0)=중심, (1,0)=골1, (1,1)=끝, (0,1)=골2
        const x =
          (1 - u) * (1 - v) * center[0] + u * (1 - v) * v1[0] + u * v * tip[0] + (1 - u) * v * v2[0];
        const y =
          (1 - u) * (1 - v) * center[1] + u * (1 - v) * v1[1] + u * v * tip[1] + (1 - u) * v * v2[1];
        positions.push(x, y, 0);
        dists.push(distanceToOutline(x, y, poly));
      }
    }

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const a = base + j * (n + 1) + i;
        const b = a + 1;
        const d = a + n + 1;
        const c = d + 1;
        // 대각선(a-c)이 가시 중심선을 따라가도록. u축(골1)이 v축(골2)의 반시계 방향이라 감는 순서를 뒤집어 앞면이 +z를 보게 한다
        faces.push(a, c, b, a, d, c);
      }
    }
  }

  const maxD = Math.max(...dists);
  for (let k = 0; k < dists.length; k++) {
    const t = 1 - dists[k] / maxD;
    positions[k * 3 + 2] = height * Math.sqrt(Math.max(0, 1 - t * t));
  }

  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(faces);
  // 이웃 가시끼리 맞닿는 선의 정점을 합쳐 법선이 끊기지 않게
  geometry = mergeVertices(geometry, 1e-5);
  geometry.computeVertexNormals();
  return geometry;
}

// ---------- scene ----------

const materials: Record<StarFinish, () => THREE.MeshPhysicalMaterial> = {
  // 검정 크롬: 어두운 금속 + 투명 코팅으로 하이라이트만 하얗게
  ink: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x1c1c1c,
      metalness: 1,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.6,
    }),
  chrome: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0xd8d8d8,
      metalness: 1,
      roughness: 0.08,
      envMapIntensity: 1.2,
    }),
  pearl: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0xf4f1ee,
      metalness: 0.15,
      roughness: 0.22,
      clearcoat: 1,
      iridescence: 1,
      iridescenceIOR: 1.6,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xe9dff0),
    }),
};

let engine: ReturnType<typeof createEngine> | null = null;

function createEngine() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(RENDER_SIZE, RENDER_SIZE, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 3.9);

  const geometry = inflatedStar(0.34);
  const bead = new THREE.SphereGeometry(0.1, 32, 16);
  const cache = new Map<StarFinish, THREE.MeshPhysicalMaterial>();
  const material = (f: StarFinish) => {
    if (!cache.has(f)) cache.set(f, materials[f]());
    return cache.get(f)!;
  };

  const group = new THREE.Group();
  const front = new THREE.Mesh(geometry);
  const back = new THREE.Mesh(geometry);
  back.scale.z = -1;
  const beadFront = new THREE.Mesh(bead);
  beadFront.position.z = 0.32;
  const beadBack = beadFront.clone();
  beadBack.position.z = -0.32;
  group.add(front, back, beadFront, beadBack);
  scene.add(group);

  const entries = new Set<Entry>();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  const start = performance.now();

  // 현재 기울기 (목표값을 향해 부드럽게 따라간다)
  const tilt = { x: 0, y: 0 };

  /** spinning이 아니면 정면을 보되 마우스·기울기만큼 살짝 돌아간다 */
  const renderGroup = (finish: StarFinish, spinning: boolean, targets: Entry[]) => {
    const m = material(finish);
    front.material = back.material = beadFront.material = beadBack.material = m;
    group.rotation.x = spinning ? SPIN_TILT : tilt.x * TILT_RANGE.x;
    group.rotation.y = spinning
      ? ((performance.now() - start) / 1000) * SPIN_SPEED
      : tilt.y * TILT_RANGE.y;
    renderer.render(scene, camera);
    for (const e of targets) {
      e.ctx.clearRect(0, 0, e.canvas.width, e.canvas.height);
      e.ctx.drawImage(renderer.domElement, 0, 0, e.canvas.width, e.canvas.height);
      e.drawn = true;
    }
  };

  const tick = () => {
    frame = 0;
    const groups = new Map<string, Entry[]>();

    const goal = getTilt();
    const dx = goal.x - tilt.x;
    const dy = goal.y - tilt.y;
    const tilting = Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001;
    if (tilting) {
      tilt.x += dx * TILT_EASE;
      tilt.y += dy * TILT_EASE;
    }
    let animating = tilting;

    for (const e of entries) {
      if (!e.visible) continue;
      const spinning = e.spin && !reducedMotion.matches;
      if (!spinning && !tilting && e.drawn) continue;
      animating ||= spinning;
      const key = `${e.finish}:${spinning}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }

    for (const [key, targets] of groups) {
      const [finish, spinning] = key.split(":") as [StarFinish, string];
      renderGroup(finish, spinning === "true", targets);
    }

    if (animating) frame = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  subscribeTilt(wake);

  const observer = new IntersectionObserver((records) => {
    for (const r of records) {
      for (const e of entries) if (e.canvas === r.target) e.visible = r.isIntersecting;
    }
    wake();
  });

  return {
    add(entry: Entry) {
      entries.add(entry);
      observer.observe(entry.canvas);
      wake();
    },
    remove(entry: Entry) {
      entries.delete(entry);
      observer.unobserve(entry.canvas);
    },
  };
}

export function registerStar(canvas: HTMLCanvasElement, finish: StarFinish, spin: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  engine ??= createEngine();
  const entry: Entry = { canvas, ctx, finish, spin, visible: false, drawn: false };
  engine.add(entry);
  return () => engine?.remove(entry);
}
