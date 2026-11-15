/*
 * 커버 유체 굴절 효과.
 * 흐름 시뮬레이션은 antonbobrov/threejs-rgb-fluid (MIT, © Anton Bobrov)를
 * WebGL 셰이더로 옮긴 것이고, RGB 색·색수차는 빼고 굴절만 쓴다.
 *
 * 1) velocity: 포인터 속도를 흐름장(RG)에 찍고, 흘려보내고(advection), 번지고(blur), 서서히 사라진다(decay)
 * 2) display: 흐름 방향만큼 커버 그림의 UV를 밀어 물에 비친 것처럼 일렁이게 한다
 */
import * as THREE from "three";

const SIM_RES = 256;
const BLUR_RES = 128;

// 레퍼런스 DEFAULT 프리셋 값
const SETTINGS = {
  ease: 0.2,
  radius: 0.025,
  strength: 0.5,
  decay: 0.00242,
  advection: 0.007,
  blurStrength: 0.35,
  blurRadius: 1,
  noiseStrength: 0.002,
  noiseScale: 3,
  // scene.distortion × length(liquid.color)
  distortion: 0.015 * Math.hypot(0.98, 0.985, 1),
};

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const VELOCITY_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVel;
  uniform sampler2D uBlur;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uDecay;
  uniform float uAdvection;
  uniform float uBlurStrength;
  uniform float uFps;
  uniform float uNoiseStrength;
  uniform float uNoiseScale;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 ratio = vec2(uAspect, 1.0);
    float dist = distance(vUv * ratio, uMouse * ratio);
    vec2 splat = uVelocity * uStrength * exp(-dist / uRadius);

    vec2 base = texture2D(uVel, vUv).rg;
    vec2 advectUV = vUv - base * uAdvection * uFps;

    // 레퍼런스의 노이즈 텍스처 대신 고정 해시 노이즈로 흐름 결을 살짝 흐트린다
    vec2 cell = floor(vUv * ratio * uNoiseScale * 128.0);
    vec2 noise = (vec2(hash(cell), hash(cell + 17.0)) - 0.5) * uNoiseStrength;
    vec2 uv = advectUV + noise;

    vec2 advected = texture2D(uVel, uv).rg;
    vec2 blurred = texture2D(uBlur, uv).rg;
    vec2 mixed = mix(advected, blurred, uBlurStrength) * exp(-uDecay * uFps);

    gl_FragColor = vec4(mixed + splat, 0.0, 1.0);
  }
`;

const BLUR_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVel;
  uniform vec2 uTexel;

  void main() {
    vec2 sum = vec2(0.0);
    float total = 0.0;
    for (int x = -2; x <= 2; x++) {
      for (int y = -2; y <= 2; y++) {
        float w = exp(-float(x * x + y * y) / 2.0);
        sum += texture2D(uVel, vUv + vec2(float(x), float(y)) * uTexel).rg * w;
        total += w;
      }
    }
    gl_FragColor = vec4(sum / total, 0.0, 1.0);
  }
`;

const DISPLAY_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVel;
  uniform sampler2D uContent;
  uniform float uDistortion;

  void main() {
    vec2 flow = texture2D(uVel, vUv).rg;
    gl_FragColor = texture2D(uContent, vUv - flow * uDistortion);
  }
`;

function target(size: number) {
  return new THREE.WebGLRenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

type Options = {
  /** 효과를 그릴 WebGL 캔버스 */
  canvas: HTMLCanvasElement;
  /** 커버 그림(배경 + 글자)을 그려둔 2D 캔버스 */
  content: HTMLCanvasElement;
  /** 포인터 좌표 기준이 되는 영역 (커버 섹션) */
  area: HTMLElement;
  /** 매 프레임 커버 그림을 다시 그릴지 판단하고 그린다. 바뀌었으면 true */
  drawContent: () => boolean;
};

export function createFluid({ canvas, content, area, drawContent }: Options) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.autoClear = false;

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  scene.add(quad);

  let read = target(SIM_RES);
  let write = target(SIM_RES);
  const blur = target(BLUR_RES);

  const contentTexture = new THREE.CanvasTexture(content);
  contentTexture.minFilter = THREE.LinearFilter;
  contentTexture.generateMipmaps = false;
  const contentSize = { w: content.width, h: content.height };

  const velocity = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: VELOCITY_FRAG,
    uniforms: {
      uVel: { value: read.texture },
      uBlur: { value: blur.texture },
      uMouse: { value: new THREE.Vector2(-10, -10) },
      uVelocity: { value: new THREE.Vector2() },
      uAspect: { value: 1 },
      uRadius: { value: SETTINGS.radius },
      uStrength: { value: SETTINGS.strength },
      uDecay: { value: SETTINGS.decay },
      uAdvection: { value: SETTINGS.advection },
      uBlurStrength: { value: SETTINGS.blurStrength },
      uFps: { value: 1 },
      uNoiseStrength: { value: SETTINGS.noiseStrength },
      uNoiseScale: { value: SETTINGS.noiseScale },
    },
  });
  const blurMat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: BLUR_FRAG,
    uniforms: {
      uVel: { value: read.texture },
      uTexel: { value: new THREE.Vector2(SETTINGS.blurRadius / BLUR_RES, SETTINGS.blurRadius / BLUR_RES) },
    },
  });
  const display = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: DISPLAY_FRAG,
    uniforms: {
      uVel: { value: read.texture },
      uContent: { value: contentTexture },
      uDistortion: { value: SETTINGS.distortion },
    },
  });

  // ---------- pointer (레퍼런스 Pointer: 감속 추적 + 속도) ----------
  const target2 = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let active = false;

  const onMove = (e: PointerEvent) => {
    const rect = area.getBoundingClientRect();
    target2.x = e.clientX - rect.left;
    target2.y = e.clientY - rect.top;
    if (!active) {
      current.x = target2.x;
      current.y = target2.y;
      active = true;
    }
  };
  const onLeave = () => {
    active = false;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerup", onLeave, { passive: true });
  // 폰에서 브라우저가 제스처를 가져가면 손가락을 뗀 것으로 본다
  window.addEventListener("pointercancel", onLeave, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);

  // ---------- size ----------
  let width = 1;
  let height = 1;
  const resize = () => {
    width = Math.max(area.clientWidth, 1);
    height = Math.max(area.clientHeight, 1);
    renderer.setSize(width, height, false);
    velocity.uniforms.uAspect.value = width / height;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(area);

  // ---------- loop ----------
  let frame = 0;
  let last = performance.now();
  let visible = false;

  const pass = (material: THREE.ShaderMaterial, to: THREE.WebGLRenderTarget | null) => {
    quad.material = material;
    renderer.setRenderTarget(to);
    renderer.clear();
    renderer.render(scene, camera);
  };

  const tick = (now: number) => {
    const dt = Math.min(Math.max(now - last, 1), 100);
    last = now;
    const fps = (dt * 60) / 1000;

    // 감속 추적 → 속도 (px/s 를 영역 크기로 나눠 0..1 단위로)
    const prevX = current.x;
    const prevY = current.y;
    if (active) {
      const k = 1 - Math.exp(-SETTINGS.ease * fps);
      current.x += (target2.x - current.x) * k;
      current.y += (target2.y - current.y) * k;
    }
    const vdt = dt / 1000;
    const vx = active ? (current.x - prevX) / vdt / width : 0;
    const vy = active ? (current.y - prevY) / vdt / height : 0;

    const u = velocity.uniforms;
    // GL 좌표는 아래가 0이라 y를 뒤집는다
    u.uMouse.value.set(current.x / width, 1 - current.y / height);
    u.uVelocity.value.set(vx, -vy);
    u.uFps.value = fps;

    blurMat.uniforms.uVel.value = read.texture;
    pass(blurMat, blur);

    u.uVel.value = read.texture;
    pass(velocity, write);
    [read, write] = [write, read];

    if (drawContent()) {
      // three.js는 텍스처를 처음 크기로 고정해 GPU에 잡아둔다(texStorage2D).
      // 창 폭이 바뀌어 그림 크기가 달라지면 버리고 새 크기로 다시 잡아야 늘어나거나 잘리지 않는다.
      if (content.width !== contentSize.w || content.height !== contentSize.h) {
        contentTexture.dispose();
        contentSize.w = content.width;
        contentSize.h = content.height;
      }
      contentTexture.needsUpdate = true;
    }
    display.uniforms.uVel.value = read.texture;
    pass(display, null);

    frame = requestAnimationFrame(tick);
  };

  const play = () => {
    if (frame || !visible || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const pause = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else pause();
  });
  io.observe(area);
  const onVisibility = () => (document.hidden ? pause() : play());
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    pause();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onLeave);
    window.removeEventListener("pointercancel", onLeave);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    read.dispose();
    write.dispose();
    blur.dispose();
    contentTexture.dispose();
    velocity.dispose();
    blurMat.dispose();
    display.dispose();
    renderer.dispose();
  };
}
