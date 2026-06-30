import "server-only";
import sharp from "sharp";
import { createAdminClient } from "@/utils/supabase/admin";

const BUCKET = "imagens";
const MAX_INPUT_BYTES = 8 * 1024 * 1024; // guard do INPUT (antes do sharp)
const PUBLIC_MARKER = "/object/public/imagens/";

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

// Best-effort: apaga o arquivo do bucket a partir da URL pública. Só age em URLs
// do nosso bucket (o marker protege valores legados tipo /assets/...). Nunca
// derruba a operação principal — órfão é tolerável, falha de delete não.
export async function apagarImagemPorUrl(
  url: string | null | undefined,
): Promise<void> {
  if (!url) return;
  const i = url.indexOf(PUBLIC_MARKER);
  if (i === -1) return; // não é do bucket 'imagens' → ignora
  const path = url.slice(i + PUBLIC_MARKER.length);
  if (!path) return;
  try {
    const supabase = createAdminClient();
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // silencioso de propósito
  }
}
