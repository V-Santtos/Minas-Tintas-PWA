import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "public/logo.png";
const OUT = "public/icons";
mkdirSync(OUT, { recursive: true });

const PAPER = { r: 250, g: 247, b: 242, alpha: 1 }; // #FAF7F2

async function make(size, innerRatio, name) {
  const inner = Math.round(size * innerRatio);
  // 1) redimensiona o logo p/ caber numa caixa interna, mantendo proporção e fundo transparente
  const logo = await sharp(SRC)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
  // 2) cria um quadrado com fundo paper e cola o logo centralizado
  await sharp({
    create: { width: size, height: size, channels: 4, background: PAPER },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(`${OUT}/${name}`);
  console.log("escrito:", name);
}

await make(512, 0.78, "icon-512.png");
await make(192, 0.78, "icon-192.png");
await make(512, 0.6, "icon-512-maskable.png"); // menor = mais margem p/ a zona segura
