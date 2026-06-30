# Sessão atual

**Atualizado:** 2026-06-30

---

## Projeto ativo — Minas Tintas PWA · Brinde de boas-vindas

Repositório: `https://github.com/V-Santtos/Minas-Tintas-PWA`
Apps Admin e Pintor já validados e publicados. Estamos adicionando a feature de
**brinde de boas-vindas** ao app do Pintor e mapeando tudo em **tarefas numeradas**.

### A feature (resumo)

- Cada **novo pintor** recebe **UM** brinde, **sorteado** entre dois:
  **Boné Minas Tintas** ou **Pincel Condor 2"** (é um ou outro, aleatório).
- No **primeiro login**, abre um **modal** celebratório anunciando o brinde.
- O brinde nasce como um **resgate pendente** na lojinha (mesma máquina de `resgates`):
  o admin valida a entrega quando o pintor retira na loja.
- Se o pintor fechar o modal sem ir à lojinha, aparece **bolinha vermelha** no ícone
  da Lojinha **e** uma notificação no sininho.

### Decisões travadas

- **Kit?** Não — dois itens distintos; cada pintor recebe **um** (aleatório).
- **Quando concede:** na **criação do pintor** pelo admin (resgate já nasce pendente);
  o 1º login só anuncia. *(confirmar na T5)*
- **Retroativo?** Só **novos** pintores; existentes não recebem.
- **Persistência do "já viu":** no banco, por pintor.
- **Visual:** modal centralizado (aprovado), reusando os tokens do app.

---

## 📋 TAREFAS

Legenda: ✅ feito · ⏳ pendente · 🗄️ precisa de banco (eu deixo instrução, não aplico)

### T1 — Modal de brinde no 1º login · ✅ FRONT

- `minas-tintas-pintor/src/components/BrindeModal.tsx` (novo) + `<Suspense>` na
  `(app)/home/page.tsx`. Sorteio boné/pincel, mostrar 1x, CTA "Ver na lojinha".

### T2 — Bolinha vermelha na Lojinha ao fechar o modal · ✅ FRONT

- `minas-tintas-pintor/src/components/BottomNav.tsx`. Acende ao fechar por
  "Agora não"/X; some ao entrar em `/loja`. Sincroniza sem reload (evento).

### T3 — Notificação do brinde no sininho · ✅ FRONT (stub)

- `minas-tintas-pintor/src/app/(app)/notificacoes/page.tsx`. Prepende um card
  "Brinde de boas-vindas" lendo `mt_brinde_sorteio`. **Obs.:** o feed do sininho é
  todo mock hoje (ver T6).

### T4 — Pincel na lojinha + imagens/descrições bonitas · 🗄️ BANCO

Pra simular: o boné já existe na lojinha; falta o pincel, e ambos sem imagem boa.
Rodar no **SQL editor do Supabase** (service_role é isento de RLS).

> ⚠️ A coluna é **`mult_delta`**, não `multiplicador` — o `seed.sql` está
> desatualizado (migration `lojinha_mult_delta` renomeou). `null` = herda o padrão (3.0).
> ⚠️ Imagem como **caminho local** `/assets/...` (Storage adiado); os arquivos já estão
> no `public/assets/` dos **dois** apps.

```sql
-- Boné (já existe, id b1): imagem + descrição
update loja_items set
  imagem = '/assets/brinde-bone.png',
  descricao = 'Boné Minas Tintas em sarja, bordado exclusivo da parceria. Tamanho único com ajuste traseiro.'
where id = '00000000-0000-0000-0000-0000000000b1';

-- Pincel: novo item (custo = round(50 × 3) = 150 pts; ajuste valor_base/stock à vontade)
insert into loja_items (id, name, valor_base, mult_delta, stock, categoria, imagem, descricao)
values (
  '00000000-0000-0000-0000-0000000000b6',
  'Pincel Condor 2"',
  50.00, null, 10, 'ferramentas',
  '/assets/brinde-pincel.png',
  'Pincel Condor RecorT 727, cerda macia 2". Acabamento liso — ideal para portas, janelas e recortes.'
);
```

### T5 — Regras reais do brinde (concessão) · 🗄️ BANCO

Quando ligar de verdade. O que já mapeamos:

1. **Itens-brinde são SEPARADOS do catálogo da lojinha.** O "boné brinde" **não** é o
   "boné da loja" (resgate por pontos) — são coisas distintas. Os itens-brinde são
   `loja_items` marcados como **fora do catálogo** (flag novo, ex. `is_brinde` /
   `catalogo = false`): o pintor **não** os vê na grade da lojinha, mas o **resgate do
   brinde os referencia** (pra ter nome/imagem) e aparece no card "Resgates pendentes".
   ⚠️ Hoje o catálogo do pintor **não filtra `active`** (busca de `loja_items_admin` sem
   `where active`) — então marcar inativo **não** esconde. Precisa do flag + filtrar na
   query/view do catálogo.

   > **🤔 Decisão de modelagem (em aberto — pensar antes de implementar):** itens-brinde
   > como `loja_items` + flag `is_brinde` (**recomendado p/ começar** — reusa CRUD, imagem,
   > estoque e o FK do resgate; porém carrega `valor_base`/custo em pontos que não fazem
   > sentido num brinde grátis) **vs.** uma **tabela `brindes` própria** = "programa de
   > brindes" que o admin **cadastra/gerencia** (nome, imagem, estoque/limite, peso do
   > sorteio, ativo), com tela no admin e os brindes aparecendo ao pintor. A tabela é mais
   > limpa conceitualmente, mas exige novo FK no resgate + tela nova. Migrar pra tabela
   > própria **se** o brinde virar feature recorrente/gerenciável.
2. **Estoque dos brindes:** boné = **10 fixos**; pincel = **ilimitado** (sem número ainda).
   Como `loja_items.stock` é `not null >= 0`: ou `stock` nulável = ilimitado (pincel), ou
   sentinela. A concessão **baixa** o estoque do boné; o pincel **não** baixa.
3. **Sorteio com trava de estoque (aleatório por pintor):** cada pintor recebe **um**.
   Enquanto houver boné (estoque > 0), sorteia boné/pincel; quando o boné esgota (10),
   **todos** passam a receber pincel. Ex.: pintor 1 → boné, pintor 2 → pincel, etc.
4. **Resgate grátis:** afrouxar `resgates.pontos_congelados > 0` → `>= 0`.
5. **Ledger:** o resgate grátis **não** lança linha em `point_transactions` (proíbe
   `valor = 0`); **guardar** `cancelar_resgate`/`cancelar_resgate_admin` pra **não**
   lançar `devolucao` quando `pontos_congelados = 0`.
6. **RPC `conceder_brinde_boas_vindas()`** (SECURITY DEFINER, idempotente): faz o sorteio
   travado (item 3), cria o resgate `pendente_retirada` grátis e baixa o estoque do boné;
   identidade pelo JWT, `FOR UPDATE` no item de boné pra nunca passar de 10.
7. **Quando chamar:** na criação do pintor (`POST /api/pintores`) — idempotência cobre 1º login também.
8. **Flag "já viu":** coluna por pintor (`painters` ou `painter_settings`) + RPC pra
   marcar visto (padrão do `salvar_notif_prefs`).
9. **Trocar os stubs de localStorage** pelos dados reais do payload do `(app)/layout.tsx`.

### T6 — Sistema de notificação · ⏳ FRONT + 🗄️ BANCO

Hoje o sininho é **100% mock**. Dividido em:

- **T6a — Feed real (FRONT, sem banco):** trocar o mock por feed **derivado** do payload
  que o layout já busca — `orders` aprovados, `resgates` pendentes, `loja_items` em
  promoção (`mult_delta < 0`), e o resgate do brinde (entra de graça quando T5 existir).
  Casa com "guardar o fato, derivar o rótulo".
- **T6b — "Lido / não lido" (🗄️ BANCO):** não é derivável. Mais leve: **uma coluna
  timestamp** por pintor (`notif_visto_em` → não-lido = eventos depois de T) + RPC pra
  carimbar. Controla a bolinha do sininho (hoje fixa no código). Pode começar como stub
  de localStorage e migrar.
- **T6c — Push real (🗄️ BANCO/INFRA):** notificação no celular fora do app — service
  worker + Web Push + tabela de `subscriptions`. Bloco pesado, independente do feed.
- **T6d — Avisos livres da loja (🗄️ BANCO):** comunicados escritos à mão que **não**
  derivam de evento do domínio precisam de **tabela própria** de notificações.

---

## Stubs de front (localStorage) — trocar nas tarefas de banco

| Chave | Significado | Vira (banco) |
|---|---|---|
| `mt_brinde_visto` | já viu o modal | flag "visto" por pintor (T5) |
| `mt_brinde_sorteio` | qual brinde saiu (`bone`/`pincel`) | o resgate concedido (T5) |
| `mt_brinde_loja_badge` | bolinha pendente na Lojinha | "tem resgate pendente não visto" (T5) |

**Preview no localhost** (atalhos de demonstração; ignoram o "já viu"):

- **Modal do brinde (home):** `/home?brinde=bone` · `/home?brinde=pincel`
- **Notificação no sininho:** `/notificacoes?brinde=bone` · `/notificacoes?brinde=pincel`
- **Resetar / fluxo real (sorteio aleatório, abre 1x sozinho):** `/home?brinde=reset` e
  depois entrar na `/home` normal.

## Outros ajustes desta sessão

- Hidratação: `suppressHydrationWarning` no `<body>` do `layout.tsx` do pintor
  (extensão ColorZilla injeta `cz-shortcut-listen` no body; aviso benigno, silenciado).
- Imagens `brinde-bone.png`/`brinde-pincel.png` copiadas pro `public/assets/` dos dois apps.
