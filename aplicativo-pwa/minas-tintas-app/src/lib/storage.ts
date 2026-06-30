import "server-only";
import sharp from "sharp";
import { createAdminClient } from "@/utils/supabase/admin";

const BUCKET = "imagens";
const MAX_INPUT_BYTES = 8 * 1024 * 1024; // guard do INPUT (antes do sharp)

export type Prefixo = "loja" | "admin";
const MAX_DIM: Record<Prefixo, number> = { loja: 1024, admin: 512 };

export async function subirImagemWebp(
  dataUrl: string,
  prefix: Prefixo,
): Promise<string> {
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl);
  if (!m) throw new Error("Imagem inválida.");
  const buf = Buffer.from(m[2], "base64");
  if (buf.byteLength > MAX_INPUT_BYTES)
    throw new Error("Imagem muito grande (máx. 8 MB).");

  const webp = await sharp(buf)
    .rotate() // auto-orienta pelo EXIF e descarta o metadado
    .resize(MAX_DIM[prefix], MAX_DIM[prefix], {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  const supabase = createAdminClient();
  const path = `${prefix}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, webp, { contentType: "image/webp", upsert: false });
  if (error) throw new Error(`upload: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
