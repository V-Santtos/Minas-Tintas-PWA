// Downscale + re-encode da imagem no browser, pra não estourar o limite de 1 MB
// do body de server action. Roda só no cliente (usa canvas/createImageBitmap).
export async function prepararImagemWebp(
  blob: Blob,
  maxDim = 1024,
  quality = 0.85,
): Promise<string> {
  // imageOrientation "from-image" aplica o EXIF (senão foto de celular vira deitada).
  const bmp = await createImageBitmap(blob, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close();

  const out = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("encode falhou"))),
      "image/webp",
      quality,
    ),
  );

  return await new Promise<string>((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => resolve(rd.result as string);
    rd.onerror = () => reject(new Error("read falhou"));
    rd.readAsDataURL(out);
  });
}
