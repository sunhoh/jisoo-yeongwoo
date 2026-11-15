import fs from "node:fs/promises";
import path from "node:path";
import { getPlaiceholder } from "plaiceholder";

export type GalleryImage = {
  src: string;
  width: number;
  height: number;
  /** plaiceholder로 만든 흐린 미리보기 (data URL) */
  blurDataURL: string;
};

const GALLERY_DIR = path.join(process.cwd(), "public", "gallery");
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

async function toImage(src: string): Promise<GalleryImage> {
  const buffer = await fs.readFile(path.join(process.cwd(), "public", src));
  const { base64, metadata } = await getPlaiceholder(buffer, { size: 12 });
  return {
    src,
    width: metadata.width,
    height: metadata.height,
    blurDataURL: base64,
  };
}

/** public 아래 사진들의 크기와 블러 미리보기 (예: ["/images/1.png", "/images/2.png"]) */
export async function getImages(srcs: string[]): Promise<GalleryImage[]> {
  "use cache";
  return Promise.all(srcs.map(toImage));
}

/**
 * public/gallery 의 사진을 파일명 순으로 읽어 크기와 블러 미리보기를 만든다.
 * 빌드 때 한 번 계산되고 결과는 캐시된다.
 */
export async function getGalleryImages(): Promise<GalleryImage[]> {
  "use cache";

  const files = (await fs.readdir(GALLERY_DIR).catch(() => []))
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return Promise.all(files.map((file) => toImage(`/gallery/${file}`)));
}
