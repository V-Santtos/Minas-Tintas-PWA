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
  if (!res.ok) throw new Error(`produtos ${res.status}: ${await res.text()}`);
  return res.json();
}
