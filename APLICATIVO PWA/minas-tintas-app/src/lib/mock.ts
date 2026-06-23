import { bonusPoints } from "./rules";

export type Order = {
  id: string;
  painter: string;
  location: string;
  title: string;
  date: string;
  total: number;
  discount?: number;
  items?: { name: string; qty: number; unit: number }[];
  status:
    | "rascunho"
    | "pendente"
    | "aprovado"
    | "recusado"
    | "cancelado"
    | "estornado";
  bonusPts?: number; // bônus já decidido no servidor (creditado vs projetado)
  createdAtISO?: string; // 'YYYY-MM-DD' p/ os stats de "hoje"
  payment: string;
  notes?: string;
  estornoMotivo?: string;
};

export const ORDERS: Order[] = [
  /* ── Maio 2026 ── */
  {
    id: "0494",
    painter: "José Mariano",
    location: "Tiradentes",
    title: "Igreja São Francisco",
    date: "22 mai",
    total: 3480.0,
    status: "aprovado",
    payment: "Maquininha",
  },
  {
    id: "0493",
    painter: "Ricardo Lopes",
    location: "São João del-Rei",
    title: "Ed. Alvorada",
    date: "16 mai",
    total: 2650.0,
    status: "aprovado",
    payment: "Pix da loja",
  },
  {
    id: "0492",
    painter: "João Pereira",
    location: "São João del-Rei",
    title: "Residência Parque das Acácias",
    date: "19 mai",
    total: 3840.0,
    status: "pendente",
    payment: "Pix da loja",
    notes:
      "Cliente pediu nota fiscal. Entrega dos materiais direto na obra na quinta-feira.",
  },
  {
    id: "0491",
    painter: "Carlos H. Almeida",
    location: "São João del-Rei",
    title: "Loja Comercial Centro",
    date: "19 mai",
    total: 1664.0,
    status: "aprovado",
    payment: "Maquininha",
  },
  {
    id: "0490",
    painter: "Helena Mota",
    location: "Prados",
    title: "Clínica Odonto Centro",
    date: "17 mai",
    total: 2180.0,
    status: "recusado",
    payment: "Dinheiro",
  },
  {
    id: "0489",
    painter: "José Mariano",
    location: "Tiradentes",
    title: "Pousada das Pedras",
    date: "14 mai",
    total: 4520.0,
    status: "estornado",
    payment: "Maquininha",
    estornoMotivo:
      "Pagamento recusado pelo banco. Cliente solicitou cancelamento da compra.",
  },
  {
    id: "0488",
    painter: "José Mariano",
    location: "Tiradentes",
    title: "Pousada do Vale",
    date: "12 mai",
    total: 3200.0,
    status: "aprovado",
    payment: "Pix da loja",
  },
  {
    id: "0487",
    painter: "Ricardo Lopes",
    location: "São João del-Rei",
    title: "Ed. Commercial Center",
    date: "08 mai",
    total: 2840.0,
    status: "aprovado",
    payment: "Maquininha",
  },
  {
    id: "0486",
    painter: "Helena Mota",
    location: "Prados",
    title: "Clínica Veterinária Sul",
    date: "06 mai",
    total: 1920.0,
    status: "aprovado",
    payment: "Dinheiro",
  },
  {
    id: "0485",
    painter: "João Pereira",
    location: "São João del-Rei",
    title: "Ed. Glória",
    date: "03 mai",
    total: 4100.0,
    status: "aprovado",
    payment: "Pix da loja",
  },
  /* ── Abril 2026 ── */
  {
    id: "0484",
    painter: "José Mariano",
    location: "Tiradentes",
    title: "Pousada Recanto — reforma",
    date: "25 abr",
    total: 2750.0,
    status: "pendente",
    payment: "Maquininha",
  },
  {
    id: "0483",
    painter: "Ricardo Lopes",
    location: "São João del-Rei",
    title: "Supermercado Bom Preço",
    date: "21 abr",
    total: 3100.0,
    status: "aprovado",
    payment: "Pix da loja",
  },
  {
    id: "0482",
    painter: "Helena Mota",
    location: "Prados",
    title: "Salão Bela Vista",
    date: "15 abr",
    total: 1850.0,
    status: "aprovado",
    payment: "Dinheiro",
  },
  {
    id: "0481",
    painter: "Carlos H. Almeida",
    location: "São João del-Rei",
    title: "Escola Estadual Norte",
    date: "09 abr",
    total: 2100.0,
    status: "aprovado",
    payment: "Maquininha",
  },
  {
    id: "0480",
    painter: "João Pereira",
    location: "São João del-Rei",
    title: "Condomínio Parque das Flores",
    date: "04 abr",
    total: 4200.0,
    status: "aprovado",
    payment: "Pix da loja",
  },
  /* ── Março 2026 ── */
  {
    id: "0479",
    painter: "José Mariano",
    location: "Tiradentes",
    title: "Pousada das Pedras — reforma",
    date: "18 mar",
    total: 2950.0,
    status: "aprovado",
    payment: "Maquininha",
  },
  {
    id: "0478",
    painter: "João Pereira",
    location: "São João del-Rei",
    title: "Ed. Glória — bloco B",
    date: "08 mar",
    total: 3600.0,
    status: "aprovado",
    payment: "Pix da loja",
  },
  {
    id: "0477",
    painter: "Adílson Borges",
    location: "Barbacena",
    title: "Residência Jardim das Minas",
    date: "28 mar",
    total: 1680.0,
    status: "aprovado",
    payment: "Dinheiro",
  },
  /* ── Fevereiro 2026 ── */
  {
    id: "0476",
    painter: "Carlos H. Almeida",
    location: "São João del-Rei",
    title: "Loja Comercial Norte",
    date: "20 fev",
    total: 1760.0,
    status: "aprovado",
    payment: "Maquininha",
  },
  {
    id: "0475",
    painter: "Helena Mota",
    location: "Prados",
    title: "Clínica Odonto Norte",
    date: "14 fev",
    total: 2340.0,
    status: "aprovado",
    payment: "Pix da loja",
  },
  {
    id: "0474",
    painter: "Ricardo Lopes",
    location: "São João del-Rei",
    title: "Ed. Alvorada — hall entrada",
    date: "06 fev",
    total: 1980.0,
    status: "aprovado",
    payment: "Dinheiro",
  },
  /* ── Janeiro 2026 ── */
  {
    id: "0473",
    painter: "José Mariano",
    location: "Tiradentes",
    title: "Pousada do Vale — reforma",
    date: "22 jan",
    total: 2680.0,
    status: "aprovado",
    payment: "Maquininha",
  },
  {
    id: "0472",
    painter: "João Pereira",
    location: "São João del-Rei",
    title: "Condomínio Vila Verde — bl. A",
    date: "12 jan",
    total: 4350.0,
    status: "aprovado",
    payment: "Pix da loja",
  },
];

export function brl(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}
export const bonus = bonusPoints;

export type Reward = {
  id: string;
  name: string;
  custo: number;
  venda: number;
  itemMod: number;
  stock: number;
  icon: string;
  img: string;
  desc: string;
  imgPos?: { x: number; y: number };
};

export type Resgate = {
  id: string;
  pintorName: string;
  itemId: string;
  pts: number;
  data: string;
  status: "pendente" | "entregue" | "recusado";
};

export type CatalogItem = {
  id: string;
  code: string;
  name: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
};

export const REWARDS: Reward[] = [
  {
    id: "fita",
    name: "Fita crepe 50 mm × 50 m",
    custo: 60,
    venda: 85,
    itemMod: 0,
    stock: 145,
    icon: "scissors",
    img: "Fita).png",
    desc: "Fita crepe 50 mm × 50 m para delimitação de áreas, proteção de rodapés e acabamentos em pintura.",
  },
  {
    id: "bone",
    name: "Boné Minas Tintas brim",
    custo: 90,
    venda: 120,
    itemMod: 0,
    stock: 80,
    icon: "hard-hat",
    img: "bone.png",
    desc: "Boné aba curva com bordado exclusivo da marca Minas Tintas. Fechamento traseiro com fivela ajustável.",
  },
  {
    id: "pinceis",
    name: "Kit pincéis Atlas (3 peças)",
    custo: 120,
    venda: 165,
    itemMod: 0,
    stock: 18,
    icon: "paintbrush",
    img: "Pincel Atlas.png",
    desc: 'Kit com 3 pincéis Atlas de cerdas naturais — 1", 2" e 3". Para cortes limpos e acabamento fino.',
  },
  {
    id: "epi",
    name: "Kit EPI — máscara + óculos + luvas",
    custo: 150,
    venda: 200,
    itemMod: 0,
    stock: 24,
    icon: "shield",
    img: "kit-epi.png",
    desc: "Kit completo com máscara de proteção, óculos anti-impacto e luvas de látex. Proteção essencial durante a pintura.",
  },
  {
    id: "camiseta",
    name: "Camiseta Minas Tintas algodão",
    custo: 150,
    venda: 180,
    itemMod: 0,
    stock: 56,
    icon: "shirt",
    img: "camiseta.png",
    desc: "Camiseta 100% algodão penteado com estampa exclusiva Minas Tintas. Disponível nos tamanhos P ao GG.",
  },
  {
    id: "rolo",
    name: "Rolo profissional anti-gota 23 cm",
    custo: 180,
    venda: 245,
    itemMod: -2,
    stock: 32,
    icon: "paint-roller",
    img: "rolo profissional anti gota 23cm .png",
    desc: "Rolo de lã 23 cm com tecnologia anti-gota para acabamento limpo e preciso em paredes e tetos.",
  },
  {
    id: "impertech",
    name: "Impertech 3em1 — Borracha Líquida",
    custo: 210,
    venda: 290,
    itemMod: -2,
    stock: 7,
    icon: "droplets",
    img: "descrição do produto na foto.png",
    desc: "Impermeabilizante em borracha líquida que sela, protege e impermeabiliza telhados, calhas e lajes em uma só demão.",
  },
  {
    id: "macacao",
    name: "Macacão de pintor — tamanho G",
    custo: 240,
    venda: 295,
    itemMod: 0,
    stock: 22,
    icon: "shirt",
    img: "macacao.png",
    desc: "Macacão descartável em TNT resistente, com capuz e elástico nos punhos. Proteção completa durante a pintura.",
  },
  {
    id: "caixa",
    name: 'Caixa de ferramentas 16"',
    custo: 300,
    venda: 420,
    itemMod: 0,
    stock: 9,
    icon: "briefcase",
    img: "caixa de ferramenta.png",
    desc: 'Caixa organizadora 16" em plástico reforçado com travas duplas e compartimentos internos removíveis.',
  },
  {
    id: "lixadeira",
    name: 'Lixadeira orbital 5" Bosch',
    custo: 900,
    venda: 1290,
    itemMod: 0,
    stock: 2,
    icon: "wrench",
    img: "maquina orbital.png",
    desc: 'Lixadeira orbital 5" com base de velcro e 12.000 RPM. Ideal para lixamento de paredes, madeira e massa corrida.',
  },
];

export const RESGATES: Resgate[] = [
  {
    id: "re1",
    pintorName: "Carlos Eduardo",
    itemId: "bone",
    pts: 900,
    data: "2026-05-19",
    status: "pendente",
  },
  {
    id: "re2",
    pintorName: "José Antônio",
    itemId: "fita",
    pts: 600,
    data: "2026-05-18",
    status: "pendente",
  },
  {
    id: "re3",
    pintorName: "Marcos Lima",
    itemId: "pinceis",
    pts: 1200,
    data: "2026-05-14",
    status: "entregue",
  },
  {
    id: "re4",
    pintorName: "Roberto Fonseca",
    itemId: "camiseta",
    pts: 1500,
    data: "2026-05-10",
    status: "entregue",
  },
  {
    id: "re5",
    pintorName: "André Souza",
    itemId: "epi",
    pts: 1500,
    data: "2026-05-07",
    status: "recusado",
  },
];

export const CATALOG: CatalogItem[] = [
  {
    id: "p1",
    code: "SUV-18-BN",
    name: "Tinta látex acrílica fosca 18L — Branco Neve",
    brand: "Suvinil",
    price: 320.0,
    cost: 196.0,
    stock: 47,
  },
  {
    id: "p2",
    code: "COR-18-AR",
    name: "Tinta látex 18L — Areia",
    brand: "Coral",
    price: 298.0,
    cost: 188.0,
    stock: 31,
  },
  {
    id: "p3",
    code: "SUV-MC-25",
    name: "Massa corrida 25kg",
    brand: "Suvinil",
    price: 84.9,
    cost: 58.0,
    stock: 84,
  },
  {
    id: "p4",
    code: "COR-SE-18",
    name: "Selador acrílico 18L",
    brand: "Coral",
    price: 162.0,
    cost: 108.0,
    stock: 12,
  },
  {
    id: "p5",
    code: "TIG-RO-23",
    name: "Rolo de lã 23 cm — anti-gota",
    brand: "Tigre",
    price: 28.5,
    cost: 16.8,
    stock: 6,
  },
  {
    id: "p6",
    code: "ATL-PC-02",
    name: 'Pincel chato 2"',
    brand: "Atlas",
    price: 14.9,
    cost: 7.4,
    stock: 93,
  },
  {
    id: "p7",
    code: "EUR-FC-50",
    name: "Fita crepe 50mm × 50m",
    brand: "Eurocel",
    price: 12.4,
    cost: 6.9,
    stock: 210,
  },
  {
    id: "p8",
    code: "SUV-TN-18",
    name: "Tinta acrílica semibrilho 18L — Branco Gelo",
    brand: "Suvinil",
    price: 340.0,
    cost: 214.0,
    stock: 18,
  },
  {
    id: "p9",
    code: "COR-PR-36",
    name: "Primer multiuso 3,6L",
    brand: "Coral",
    price: 58.9,
    cost: 38.5,
    stock: 4,
  },
];

export type Painter = {
  name: string;
  cpf: string;
  city: string;
  since: string;
  orders: number;
  approved: number;
  points: number;
  volume: number;
  active: boolean;
  phone: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
};

export type Client = {
  id?: string;
  name: string;
  type: "pessoa" | "empresa";
  phone: string;
  painter: string | null;
  cpf?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
};

export const PAINTERS: Painter[] = [
  {
    name: "João Pereira",
    cpf: "048.***.***-99",
    city: "São João del-Rei",
    since: "set 2024",
    orders: 5,
    approved: 4,
    points: 1625,
    volume: 16250,
    active: true,
    phone: "(32) 99001-7788",
  },
  {
    name: "José Mariano",
    cpf: "208.***.***-71",
    city: "Tiradentes",
    since: "mar 2024",
    orders: 6,
    approved: 4,
    points: 1231,
    volume: 12310,
    active: true,
    phone: "(32) 98821-4455",
  },
  {
    name: "Ricardo Lopes",
    cpf: "094.***.***-32",
    city: "São João del-Rei",
    since: "mai 2024",
    orders: 4,
    approved: 4,
    points: 1057,
    volume: 10570,
    active: true,
    phone: "(32) 99734-5566",
  },
  {
    name: "Helena Mota",
    cpf: "311.***.***-18",
    city: "Prados",
    since: "jul 2024",
    orders: 4,
    approved: 3,
    points: 611,
    volume: 6110,
    active: true,
    phone: "(32) 98743-6677",
  },
  {
    name: "Carlos H. Almeida",
    cpf: "127.***.***-04",
    city: "São João del-Rei",
    since: "jan 2024",
    orders: 3,
    approved: 3,
    points: 552,
    volume: 5524,
    active: true,
    phone: "(32) 99812-3344",
  },
  {
    name: "Adílson Borges",
    cpf: "162.***.***-44",
    city: "Barbacena",
    since: "nov 2024",
    orders: 1,
    approved: 1,
    points: 168,
    volume: 1680,
    active: false,
    phone: "(32) 98456-2233",
  },
];

export const CLIENTS: Client[] = [
  {
    name: "Sr. Antônio Ferreira",
    type: "pessoa",
    phone: "(32) 99812-4433",
    painter: "Carlos H. Almeida",
  },
  {
    name: "Sra. Beatriz Almeida",
    type: "pessoa",
    phone: "(32) 98821-5500",
    painter: "Ricardo Lopes",
  },
  {
    name: "Dr. Rodrigo Mendes",
    type: "pessoa",
    phone: "(32) 99734-0011",
    painter: null,
  },
  {
    name: "Sra. Carla Ribeiro",
    type: "pessoa",
    phone: "(32) 98743-2218",
    painter: null,
  },
  {
    name: "Sr. Paulo Henrique Costa",
    type: "pessoa",
    phone: "(32) 99001-8872",
    painter: "João Pereira",
  },
  {
    name: "Sra. Fernanda Duarte",
    type: "pessoa",
    phone: "(32) 98456-3390",
    painter: null,
  },
  {
    name: "Sr. Marcos Vinícius",
    type: "pessoa",
    phone: "(32) 99223-7741",
    painter: null,
  },
  {
    name: "Família Souza",
    type: "pessoa",
    phone: "(32) 98564-1102",
    painter: "Helena Mota",
  },
  {
    name: "Condomínio Vila Verde",
    type: "empresa",
    phone: "(32) 3371-5500",
    painter: "João Pereira",
  },
  {
    name: "Condomínio Parque das Flores",
    type: "empresa",
    phone: "(32) 3371-8823",
    painter: "João Pereira",
  },
  {
    name: "Condomínio Parque das Acácias",
    type: "empresa",
    phone: "(32) 3378-4400",
    painter: "João Pereira",
  },
  {
    name: "Escola Municipal Centro",
    type: "empresa",
    phone: "(32) 3371-2200",
    painter: "Carlos H. Almeida",
  },
  {
    name: "Escola Estadual Norte",
    type: "empresa",
    phone: "(32) 3374-9900",
    painter: "Carlos H. Almeida",
  },
  {
    name: "Escola Estadual Sul",
    type: "empresa",
    phone: "(32) 3374-1100",
    painter: null,
  },
  {
    name: "Pousada Recanto",
    type: "empresa",
    phone: "(32) 3355-8812",
    painter: "José Mariano",
  },
  {
    name: "Pousada das Pedras",
    type: "empresa",
    phone: "(32) 3355-2244",
    painter: "José Mariano",
  },
  {
    name: "Pousada do Vale",
    type: "empresa",
    phone: "(32) 3355-6631",
    painter: "José Mariano",
  },
  {
    name: "Supermercado Bom Preço",
    type: "empresa",
    phone: "(32) 3372-4400",
    painter: "Ricardo Lopes",
  },
  {
    name: "Igreja São Francisco",
    type: "empresa",
    phone: "(32) 3371-0033",
    painter: "José Mariano",
  },
  {
    name: "Clínica Veterinária Sul",
    type: "empresa",
    phone: "(32) 3370-7700",
    painter: "Helena Mota",
  },
  {
    name: "Salão Bela Vista",
    type: "empresa",
    phone: "(32) 98890-3312",
    painter: "Helena Mota",
  },
  {
    name: "Ed. Glória",
    type: "empresa",
    phone: "(32) 3371-6688",
    painter: "João Pereira",
  },
  {
    name: "Ed. Alvorada",
    type: "empresa",
    phone: "(32) 3374-5522",
    painter: "Ricardo Lopes",
  },
  {
    name: "Ed. Commercial Center",
    type: "empresa",
    phone: "(32) 3372-1100",
    painter: "Ricardo Lopes",
  },
  {
    name: "Loja Comercial Centro",
    type: "empresa",
    phone: "(32) 3371-3300",
    painter: "Carlos H. Almeida",
  },
  {
    name: "Galpão Bairro Industrial",
    type: "empresa",
    phone: "(32) 98712-0055",
    painter: "Helena Mota",
  },
];
