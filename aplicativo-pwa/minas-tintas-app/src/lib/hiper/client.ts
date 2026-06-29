import "server-only";

const HIPER_BASE =
  process.env.HIPER_BASE ?? "https://ms-ecommerce.hiper.com.br/api/v1";

function getChave(): string {
  const chave = process.env.HIPER_CHAVE_SEGURANCA;
  if (!chave) throw new Error("HIPER_CHAVE_SEGURANCA ausente no ambiente");
  return chave;
}

type TokenDto = {
  chaveDeSeguranca: string | null;
  token: string | null;
  errors: string[] | null;
  message: string | null;
};

// Subconjunto do ProdutoDto que de fato consumimos (Fork B: catalogo minimo).
export type ProdutoDto = {
  id: string;
  codigo: number;
  nome: string | null;
  marca: string | null;
  preco: number;
  ativo: boolean;
  removido: boolean;
  quantidadeEmEstoque: number;
};

type ListaDeProdutosDto = {
  pontoDeSincronizacao: number;
  produtos: ProdutoDto[] | null;
  errors: string[] | null;
  message: string | null;
};

async function gerarToken(chave: string): Promise<string> {
  const res = await fetch(
    `${HIPER_BASE}/auth/gerar-token/${encodeURIComponent(chave)}`,
  );
  if (!res.ok)
    throw new Error(`gerar-token ${res.status}: ${await res.text()}`);
  const data: TokenDto = await res.json();
  if (!data.token)
    throw new Error(
      `Falha ao gerar token: ${data.message ?? data.errors?.join(", ")}`,
    );
  return data.token;
}

// Cache de token vivo dentro de UMA execucao (na serverless some entre
// invocacoes; regenerar e barato e o token dura ~6h).
let tokenCache: { token: string; obtidoEm: number } | null = null;
const TOKEN_TTL_MS = 5.5 * 60 * 60 * 1000; // folga sobre as ~6h

async function getTokenValido(): Promise<string> {
  if (tokenCache && Date.now() - tokenCache.obtidoEm < TOKEN_TTL_MS)
    return tokenCache.token;
  const token = await gerarToken(getChave());
  tokenCache = { token, obtidoEm: Date.now() };
  return token;
}

// O Hiper sinaliza "nada novo" com produtos: null e errors contendo
// "Nenhum produto encontrado". Na pratica veio com HTTP 400 (nao 200 como o
// swagger sugeria), entao detectamos pelo corpo, nao pelo status.
function ehNadaNovo(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Partial<ListaDeProdutosDto>;
  return (
    !b.produtos &&
    Array.isArray(b.errors) &&
    b.errors.some((e) => /nenhum produto encontrado/i.test(e))
  );
}

// Le uma pagina do delta a partir do cursor. Retry unico em 401 (token expirado).
export async function getProdutosDelta(
  ponto: number,
): Promise<ListaDeProdutosDto> {
  const url = `${HIPER_BASE}/produtos/pontoDeSincronizacao?pontoDeSincronizacao=${ponto}`;
  let token = await getTokenValido();
  let res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    tokenCache = null;
    token = await getTokenValido();
    res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  }

  // Le o corpo uma vez (texto) para poder inspecionar mesmo em status de erro.
  const texto = await res.text();
  let body: unknown = null;
  try {
    body = texto ? JSON.parse(texto) : null;
  } catch {
    body = null;
  }

  // "Nada novo" (fim da sync) pode vir como 200 OU 400 -> produtos: null,
  // preservando o cursor consultado (a resposta vazia traz pontoDeSincronizacao 0).
  if (ehNadaNovo(body)) {
    return {
      pontoDeSincronizacao: ponto,
      produtos: null,
      errors: null,
      message: null,
    };
  }

  if (!res.ok) throw new Error(`produtos ${res.status}: ${texto}`);

  return body as ListaDeProdutosDto;
}
