// ============================================================
// Minas Tintas — Pintor · Dados mock (Fase 3)
// Espelha o protótipo validado pintor-app.html
// ============================================================

import { bonusPoints } from "./rules";

export const CURRENT_PAINTER = { id: "p1", name: "Carlos" };

export const PAINTER_PROFILE = {
  name: "Carlos H. Almeida",
  firstName: "Carlos",
  phone: "(31) 9 8765-4321",
  cpf: "123.456.789-00",
  parceiroDesde: "2024",
};

export const SALDO_INICIAL = 12480;

// ── Catálogo de produtos (orçamento) ──────────────────────
export type CatalogItem = {
  id: string;
  code: string;
  name: string;
  brand: string;
  price: number;
  icon: string;
};

export const CATALOG: CatalogItem[] = [
  {
    id: "p1",
    code: "SUV-18-BN",
    name: "Tinta látex acrílica fosca 18L — Branco Neve",
    brand: "Suvinil",
    price: 320.0,
    icon: "paint-roller",
  },
  {
    id: "p2",
    code: "COR-18-AR",
    name: "Tinta látex 18L — Areia",
    brand: "Coral",
    price: 298.0,
    icon: "paint-roller",
  },
  {
    id: "p3",
    code: "SUV-MC-25",
    name: "Massa corrida 25kg",
    brand: "Suvinil",
    price: 84.9,
    icon: "package",
  },
  {
    id: "p4",
    code: "COR-SE-18",
    name: "Selador acrílico 18L",
    brand: "Coral",
    price: 162.0,
    icon: "package",
  },
  {
    id: "p5",
    code: "TIG-RO-23",
    name: "Rolo de lã 23 cm — anti-gota",
    brand: "Tigre",
    price: 28.5,
    icon: "paint-roller",
  },
  {
    id: "p6",
    code: "ATL-PC-02",
    name: 'Pincel chato 2"',
    brand: "Atlas",
    price: 14.9,
    icon: "paintbrush",
  },
  {
    id: "p7",
    code: "EUR-FC-50",
    name: "Fita crepe 50mm × 50m",
    brand: "Eurocel",
    price: 12.4,
    icon: "package",
  },
];

// ── Clientes vinculados ───────────────────────────────────
export type Client = {
  id: string;
  type: "pessoa" | "empresa";
  name: string;
  phone: string;
  document: string;
  city: string;
  pintores: { id: string; name: string }[];
};

export const CLIENTS: Client[] = [
  {
    id: "cl2",
    type: "pessoa",
    name: "Roberto Alves",
    phone: "(31) 9 8765-4321",
    document: "111.222.333-44",
    city: "Belo Horizonte",
    pintores: [{ id: "p2", name: "Marcos Oliveira" }],
  },
  {
    id: "cl3",
    type: "pessoa",
    name: "Fernanda Costa",
    phone: "(31) 9 7654-3210",
    document: "222.333.444-55",
    city: "Contagem",
    pintores: [{ id: "p1", name: "Carlos" }],
  },
  {
    id: "cl5",
    type: "pessoa",
    name: "Diego Santos",
    phone: "(31) 9 5432-1098",
    document: "333.444.555-66",
    city: "Betim",
    pintores: [
      { id: "p1", name: "Carlos" },
      { id: "p2", name: "Marcos Oliveira" },
    ],
  },
  {
    id: "cl7",
    type: "pessoa",
    name: "Ana Paula Souza",
    phone: "(31) 9 3210-9876",
    document: "444.555.666-77",
    city: "Nova Lima",
    pintores: [
      { id: "p3", name: "Paulo Henrique" },
      { id: "p2", name: "Marcos Oliveira" },
    ],
  },
  {
    id: "cl8",
    type: "empresa",
    name: "Casa & Cor Reformas",
    phone: "(31) 9 2222-1188",
    document: "12.345.678/0001-90",
    city: "Belo Horizonte",
    pintores: [{ id: "p1", name: "Carlos" }],
  },
];

// ── Pedidos ───────────────────────────────────────────────
export type OrderStatus =
  | "aprovado"
  | "pendente"
  | "rascunho"
  | "recusado"
  | "cancelado"
  | "estornado";

export type OrderItem = { name: string; qty: number; price: number };

export type Order = {
  id: string;
  name: string;
  date: string;
  status: OrderStatus;
  amount: number;
  pts?: number;
  items?: OrderItem[];
  payment?: string;
  paymentNote?: string;
};

export const ORDERS: Order[] = [
  {
    id: "0481",
    name: "Carlos Mendonça",
    date: "12 mar 2026",
    status: "aprovado",
    amount: 1840.0,
    pts: 18,
  },
  {
    id: "0480",
    name: "Roberto Alves",
    date: "10 mar 2026",
    status: "pendente",
    amount: 642.0,
  },
  {
    id: "0479",
    name: "Fernanda Costa",
    date: "06 mar 2026",
    status: "aprovado",
    amount: 2310.5,
    pts: 23,
  },
  {
    id: "0478",
    name: "Marcelo Teixeira",
    date: "02 mar 2026",
    status: "aprovado",
    amount: 458.0,
    pts: 5,
  },
  {
    id: "0477",
    name: "Patrícia Lima",
    date: "28 fev 2026",
    status: "rascunho",
    amount: 184.0,
  },
  {
    id: "0476",
    name: "Diego Santos",
    date: "24 fev 2026",
    status: "pendente",
    amount: 890.0,
  },
  {
    id: "0475",
    name: "Rafael Moura",
    date: "22 fev 2026",
    status: "aprovado",
    amount: 780.0,
    pts: 8,
  },
  {
    id: "0474",
    name: "Ana Paula Souza",
    date: "18 fev 2026",
    status: "aprovado",
    amount: 920.0,
    pts: 9,
  },
  {
    id: "0473",
    name: "Claudia Ferreira",
    date: "15 fev 2026",
    status: "pendente",
    amount: 1560.0,
  },
  {
    id: "0472",
    name: "Silvana Ramos",
    date: "12 fev 2026",
    status: "aprovado",
    amount: 3100.0,
    pts: 31,
  },
  {
    id: "0471",
    name: "João Batista",
    date: "10 fev 2026",
    status: "aprovado",
    amount: 1275.0,
    pts: 13,
  },
  {
    id: "0470",
    name: "Lucas Andrade",
    date: "05 fev 2026",
    status: "rascunho",
    amount: 340.0,
  },
  {
    id: "0469",
    name: "Beatriz Campos",
    date: "01 fev 2026",
    status: "rascunho",
    amount: 620.0,
  },
];

export const ORDERS_BY_ID: Record<string, Order> = Object.fromEntries(
  ORDERS.map((o) => [o.id, o]),
);

export const DEFAULT_DETAIL_ITEMS: OrderItem[] = [
  { name: "Tinta látex acrílica 18L — Branco Neve", qty: 4, price: 320.0 },
  { name: "Massa corrida 25kg", qty: 3, price: 84.9 },
  { name: "Rolo lã 23 cm", qty: 2, price: 28.5 },
];

export type StatusConfig = {
  label: string;
  bg: string;
  color: string;
  bonusLabel: string;
  bonusText: string;
  bonusColor: string;
};

export const STATUS_CFG: Record<OrderStatus, StatusConfig> = {
  aprovado: {
    label: "aprovado",
    bg: "var(--success-tint)",
    color: "var(--success)",
    bonusLabel: "BÔNUS CREDITADO ✓",
    bonusText: "Pontos já creditados no seu saldo.",
    bonusColor: "var(--success)",
  },
  pendente: {
    label: "pendente",
    bg: "var(--warning-tint)",
    color: "var(--warning)",
    bonusLabel: "BÔNUS PREVISTO",
    bonusText: "Será creditado automaticamente quando o pedido for aprovado.",
    bonusColor: "#6B46C1",
  },
  rascunho: {
    label: "rascunho",
    bg: "var(--info-tint)",
    color: "var(--info)",
    bonusLabel: "BÔNUS ESTIMADO",
    bonusText:
      "Bônus calculado sobre o valor do orçamento. Válido após envio e aprovação.",
    bonusColor: "var(--muted)",
  },
  recusado: {
    label: "recusado",
    bg: "#FCEAEA",
    color: "#CC0000",
    bonusLabel: "BÔNUS NÃO CREDITADO",
    bonusText: "Pedido recusado — nenhum bônus foi gerado.",
    bonusColor: "var(--muted)",
  },
  cancelado: {
    label: "cancelado",
    bg: "#F2EDE4",
    color: "#8A817A",
    bonusLabel: "BÔNUS NÃO CREDITADO",
    bonusText: "Pedido cancelado.",
    bonusColor: "var(--muted)",
  },
  estornado: {
    label: "estornado",
    bg: "#F2EDE4",
    color: "#8A817A",
    bonusLabel: "BÔNUS REVERTIDO",
    bonusText: "Bônus creditado e revertido no estorno.",
    bonusColor: "var(--muted)",
  },
};

// ── Lojinha ───────────────────────────────────────────────
export type LojaCategory =
  | "tudo"
  | "ferramentas"
  | "epi"
  | "brindes"
  | "camisetas";

export type LojaProduct = {
  id: string;
  cat: Exclude<LojaCategory, "tudo">;
  pts: number;
  originalPts: number | null;
  promo: boolean;
  locked: boolean;
  stock: number;
  unico: boolean;
  jaResgatado: boolean;
  icon: string;
  img: string;
  name: string;
  desc: string;
};

export const LOJA_PRODUCTS: LojaProduct[] = [
  {
    id: "bone",
    cat: "brindes",
    pts: 800,
    originalPts: null,
    promo: false,
    locked: false,
    stock: 3,
    unico: false,
    jaResgatado: false,
    icon: "tag",
    img: "/assets/bone.png",
    name: "Boné Minas Tintas",
    desc: "Boné aba curva com bordado exclusivo da marca Minas Tintas. Fechamento traseiro com fivela ajustável.",
  },
  {
    id: "rolo",
    cat: "ferramentas",
    pts: 900,
    originalPts: 1200,
    promo: true,
    locked: false,
    stock: 5,
    unico: false,
    jaResgatado: false,
    icon: "paint-roller",
    img: "/assets/rolo-profissional-anti-gota-23cm.png",
    name: "Rolo profissional anti-gota 23 cm",
    desc: "Rolo de lã 23 cm com tecnologia anti-gota para acabamento limpo e preciso em paredes e tetos.",
  },
  {
    id: "fita",
    cat: "ferramentas",
    pts: 600,
    originalPts: null,
    promo: false,
    locked: false,
    stock: 8,
    unico: false,
    jaResgatado: false,
    icon: "package",
    img: "/assets/Fita-crepe-50mm-50m.png",
    name: "Fita crepe 50 mm × 50 m",
    desc: "Fita crepe 50 mm × 50 m para delimitação de áreas, proteção de rodapés e acabamentos em pintura.",
  },
  {
    id: "pinceis",
    cat: "ferramentas",
    pts: 1800,
    originalPts: null,
    promo: false,
    locked: false,
    stock: 2,
    unico: false,
    jaResgatado: false,
    icon: "paintbrush",
    img: "/assets/Pincel-Atlas.png",
    name: "Kit pincéis (3 peças) Atlas",
    desc: 'Kit com 3 pincéis Atlas de cerdas naturais — 1", 2" e 3". Para cortes limpos e acabamento fino.',
  },
  {
    id: "impertech",
    cat: "ferramentas",
    pts: 2200,
    originalPts: null,
    promo: false,
    locked: false,
    stock: 4,
    unico: false,
    jaResgatado: false,
    icon: "package",
    img: "/assets/descricao-do-produto-na-foto.png",
    name: "Impertech 3em1 — Borracha Líquida",
    desc: "Impermeabilizante em borracha líquida que sela, protege e impermeabiliza telhados, calhas e lajes em uma só demão.",
  },
  {
    id: "camiseta",
    cat: "camisetas",
    pts: 2400,
    originalPts: null,
    promo: false,
    locked: false,
    stock: 6,
    unico: false,
    jaResgatado: false,
    icon: "shirt",
    img: "/assets/camiseta.png",
    name: "Camiseta Minas Tintas — algodão",
    desc: "Camiseta 100% algodão penteado com estampa exclusiva Minas Tintas. Disponível nos tamanhos P ao GG.",
  },
  {
    id: "macacao",
    cat: "epi",
    pts: 3600,
    originalPts: null,
    promo: false,
    locked: false,
    stock: 2,
    unico: false,
    jaResgatado: false,
    icon: "shirt",
    img: "/assets/macacao.png",
    name: "Macacão de pintor — tamanho G",
    desc: "Macacão descartável em TNT resistente, com capuz e elástico nos punhos. Proteção completa durante a pintura.",
  },
  {
    id: "caixa",
    cat: "ferramentas",
    pts: 4200,
    originalPts: null,
    promo: false,
    locked: false,
    stock: 1,
    unico: false,
    jaResgatado: false,
    icon: "briefcase",
    img: "/assets/caixa-de-ferramenta.png",
    name: 'Caixa de ferramentas 16"',
    desc: 'Caixa organizadora 16" em plástico reforçado com travas duplas e compartimentos internos removíveis.',
  },
  {
    id: "lixadeira",
    cat: "ferramentas",
    pts: 18000,
    originalPts: null,
    promo: false,
    locked: true,
    stock: 1,
    unico: false,
    jaResgatado: false,
    icon: "wrench",
    img: "/assets/maquina-orbital.png",
    name: 'Lixadeira orbital 5"',
    desc: 'Lixadeira orbital 5" com base de velcro e 12.000 RPM. Ideal para lixamento de paredes, madeira e massa corrida.',
  },
];

export const LOJA_PRODUCTS_BY_ID: Record<string, LojaProduct> =
  Object.fromEntries(LOJA_PRODUCTS.map((p) => [p.id, p]));

// ── Resgates rápidos (home carrossel) ─────────────────────
export type QuickReward = {
  icon: string;
  img?: string;
  name: string;
  pts: number;
  promo: boolean;
  near: boolean;
};

export const RESGATE_PRODUCTS: Record<"low" | "high", QuickReward[]> = {
  low: [
    {
      icon: "tag",
      img: "/assets/pincel.png",
      name: 'Trincha 2,5" Atlas',
      pts: 180,
      promo: true,
      near: false,
    },
    {
      icon: "paintbrush",
      img: "/assets/fita.png",
      name: "Fita crepe 50 m Adelbras",
      pts: 220,
      promo: false,
      near: true,
    },
    {
      icon: "layers",
      name: 'Espátula de aço 3"',
      pts: 350,
      promo: false,
      near: true,
    },
    {
      icon: "box",
      name: "Lixa massa grão 150 (5x)",
      pts: 400,
      promo: false,
      near: false,
    },
  ],
  high: [
    {
      icon: "tag",
      img: "/assets/5pc.png",
      name: "Kit pincéis Premium 5 pç",
      pts: 2200,
      promo: true,
      near: false,
    },
    {
      icon: "paint-roller",
      img: "/assets/rolo-profissional-anti-gota-23cm.png",
      name: "Rolo anti-gota 23 cm",
      pts: 1200,
      promo: false,
      near: false,
    },
    {
      icon: "box",
      name: "Kit lixamento completo",
      pts: 2800,
      promo: false,
      near: false,
    },
    {
      icon: "shield",
      name: "Luva nitrílica 100 un",
      pts: 3500,
      promo: false,
      near: false,
    },
  ],
};

// ── Dashboard / Atividade ─────────────────────────────────
export type PeriodSeries = {
  label: string;
  delta: { text: string; up: boolean };
  labels: string[];
  pedidos: number[];
  pontos: number[];
  stats: { pedidos: number; pontosGanhos: number; resgatados: number };
};

export const PERIOD_DATA: Record<"semana" | "mes", PeriodSeries> = {
  semana: {
    label: "ESTA SEMANA",
    delta: { text: "+2 vs semana ant.", up: true },
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    pedidos: [1, 0, 2, 1, 0, 1, 0],
    pontos: [180, 0, 320, 150, 0, 200, 0],
    stats: { pedidos: 5, pontosGanhos: 850, resgatados: 0 },
  },
  mes: {
    label: "ESTE MÊS",
    delta: { text: "+4 vs mês ant.", up: true },
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    pedidos: [3, 4, 4, 2],
    pontos: [980, 1200, 1350, 670],
    stats: { pedidos: 13, pontosGanhos: 4200, resgatados: 1200 },
  },
};

export type YearSeries = Omit<PeriodSeries, "label">;

export const ANOS_INICIO = 2026;

export const YEAR_DATA: Record<number, YearSeries> = {
  2024: {
    delta: { text: "primeiro ano", up: true },
    labels: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    pedidos: [2, 3, 4, 3, 4, 3, 3, 2, 3, 2, 1, 1],
    pontos: [600, 900, 1200, 900, 1200, 900, 900, 600, 900, 600, 300, 300],
    stats: { pedidos: 31, pontosGanhos: 9300, resgatados: 2400 },
  },
  2025: {
    delta: { text: "+16 vs 2024", up: true },
    labels: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    pedidos: [3, 5, 7, 4, 6, 4, 5, 3, 4, 3, 2, 1],
    pontos: [890, 1450, 2100, 1200, 1800, 1200, 1500, 900, 1200, 900, 640, 300],
    stats: { pedidos: 47, pontosGanhos: 14620, resgatados: 5800 },
  },
};

export const CLIENTES_VINCULADOS = 23;

// ── Opções de pagamento ───────────────────────────────────
export const PAYMENT_OPTIONS = [
  { value: "Vai pagar na loja", icon: "store" },
  { value: "Pix da loja", icon: "qr-code" },
  { value: "Cartão", icon: "credit-card" },
  { value: "Dinheiro", icon: "banknote" },
  { value: "Notinha", icon: "receipt" },
];

export const ADDRESS_TYPES = [
  "Rua ",
  "Avenida ",
  "Travessa ",
  "Alameda ",
  "Estrada ",
  "Rodovia ",
  "Praça ",
  "Largo ",
  "Beco ",
  "Viela ",
  "Córrego ",
  "Sítio ",
  "Fazenda ",
  "Comunidade ",
];

// ── Helpers ───────────────────────────────────────────────
export function brl(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export function ptsFmt(value: number): string {
  return value.toLocaleString("pt-BR");
}

// Bônus = 1% do valor bruto (10 pts por R$ × 1% → 10% em pontos via regra,
// no protótipo: Math.round(valor * 0.01) pts exibidos no carrinho/detalhe)
export const bonusPts = bonusPoints;
