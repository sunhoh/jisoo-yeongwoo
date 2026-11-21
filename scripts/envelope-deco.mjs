// public/envelope/*.png 장식 그림을 그 자리에서 손본다  (실행: npm run deco)
// - 검은 바탕 그림(투명 채널 없음)은 검정을 투명으로 바꾸고, 가장자리는 반투명으로 풀어 검은 테두리가 안 남게 한다
// - 그림 둘레의 빈 여백을 잘라낸다
// 크기 조절·포맷 변환은 next/image 가 요청 때 하므로 여기선 하지 않는다. 여러 번 돌려도 결과가 같다.
// 끝나면 src/components/envelope/deco.tsx 의 DECO 에 붙여 넣을 크기를 출력한다
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.join(process.cwd(), "public/envelope");
const LO = 14; // 가장 밝은 채널이 이 이하면 완전 투명
const HI = 70; // 이 이상이면 그대로

const lines = [];

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".png")).sort()) {
  const input = path.join(DIR, file);
  const source = fs.readFileSync(input); // 덮어쓰기 전에 메모리로 읽어 둔다
  let img = sharp(source).ensureAlpha();

  if (!(await sharp(source).metadata()).hasAlpha) {
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      const m = Math.max(data[i], data[i + 1], data[i + 2]);
      let a = m <= LO ? 0 : m >= HI ? 1 : (m - LO) / (HI - LO);
      a = a * a * (3 - 2 * a);
      if (a > 0 && a < 1)
        for (let c = 0; c < 3; c++)
          data[i + c] = Math.min(255, data[i + c] / Math.max(a, m / 255));
      data[i + 3] = Math.round(a * 255);
    }
    img = sharp(data, { raw: info });
  }

  const { width, height } = await sharp(await img.png().toBuffer())
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toFile(input);
  lines.push(`  ${path.basename(file, ".png")}: [${width}, ${height}],`);
}

console.log("const DECO = {\n" + lines.join("\n") + "\n} as const;");
