import "server-only";
import { createAdminClient } from "@/utils/supabase/admin";
import { getProdutosDelta, type ProdutoDto } from "./client";

const RECURSO = "produtos";
const MAX_PAGINAS = 200; // trava contra loop infinito

type ProductRow = {
  source_id: string;
  code: string;
  name: string;
  brand: string | null;
  price: number;
  stock: number;
  active: boolean;
};

function normalizar(p: ProdutoDto): ProductRow {
  const marca = p.marca?.trim();
  return {
    source_id: p.id,
    code: String(p.codigo),
    // products.name e NOT NULL; nome pode vir null -> fallback pelo codigo.
    name: p.nome?.trim() || `Produto ${p.codigo}`,
    brand: marca ? marca : null, // "" / so-espacos -> null
    price: p.preco,
    stock: Math.max(0, Math.round(p.quantidadeEmEstoque)),
    // soft-delete: removido/inativo entra como active=false (nao deletamos).
    active: p.ativo && !p.removido,
  };
}

export type SyncResult = {
  paginas: number;
  upserts: number;
  inativos: number;
  cursorFinal: number;
};

export async function sincronizarCatalogo(): Promise<SyncResult> {
  const supabase = createAdminClient();

  // cursor salvo (0 se nunca rodou)
  const { data: ctrl } = await supabase
    .from("sync_control")
    .select("ponto_de_sincronizacao")
    .eq("recurso", RECURSO)
    .maybeSingle();
  let ponto = ctrl?.ponto_de_sincronizacao ?? 0;

  let paginas = 0;
  let upserts = 0;
  let inativos = 0;

  for (let i = 0; i < MAX_PAGINAS; i++) {
    const lote = await getProdutosDelta(ponto);

    // 200 + produtos null/vazio = "nada novo" (NAO e erro) -> fim.
    if (!lote.produtos?.length) break;

    const rows = lote.produtos.map(normalizar);
    inativos += rows.filter((r) => !r.active).length;

    const { error } = await supabase
      .from("products")
      .upsert(rows, { onConflict: "source_id" });
    if (error) throw new Error(`upsert products: ${error.message}`);

    upserts += rows.length;
    paginas++;
    ponto = lote.pontoDeSincronizacao;

    // persiste o cursor A CADA pagina: timeout no meio retoma daqui.
    const { error: ctrlErr } = await supabase.from("sync_control").upsert(
      {
        recurso: RECURSO,
        ponto_de_sincronizacao: ponto,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "recurso" },
    );
    if (ctrlErr) throw new Error(`upsert sync_control: ${ctrlErr.message}`);
  }

  return { paginas, upserts, inativos, cursorFinal: ponto };
}
