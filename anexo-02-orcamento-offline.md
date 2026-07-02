# Anexo 02 — Orçamento offline com sincronização posterior (Fase 2)

**Status:** instrução detalhada — nada daqui foi implementado ainda.
**Objetivo:** o pintor **nunca é bloqueado por falta de sinal**: monta o orçamento offline
com o catálogo em cache no aparelho e, quando a internet volta, o app envia. É a
**Fase 2** do roadmap (`CLAUDE.md`).

---

## 1. Onde o projeto já fala disso (investigação)

| Onde | O que diz |
| --- | --- |
| `briefing.md` §9 "Funcionamento offline" | **Especifica exatamente este comportamento:** cache local da tabela de produtos/preços; montar orçamento offline; sincronizar quando a internet voltar. Divergência de preço = "limitação conhecida e aceita — a loja está ciente". A **regra da divergência** ficou "a definir" (resolvida neste anexo, §3). |
| `CLAUDE.md` → Fases | "Fase 2 — Offline funcional: navegar/montar orçamento sem sinal e sincronizar depois (depende da camada de dados)" — a camada de dados (pré-requisito) está concluída. |
| `CLAUDE.md` → Arquitetura de leitura | Decisão tomada **de propósito** na Fase 1: "Offline plugável (pintor): o fetch fica concentrado no `layout.tsx`. Offline (Fase 2) troca esse fetch por cache nesse arquivo só, sem tocar nas telas. Hoje 100% online; offline é aditivo/desligável." |
| Fase 0 (concluída) | Casca-PWA já entregue: app instalável, shell offline via Serwist, fallback `~offline` pra documento sem cache. Falta o offline **de dados**, que é este anexo. |
| Onde **não** aparece | Nenhuma menção a Redis ou cache de servidor — correto: cache de servidor (Redis/Upstash/Runtime Cache) vive do lado de lá da internet e é inalcançável sem sinal. O espelho offline mora **no aparelho** (IndexedDB). |

## 2. Descoberta que simplifica tudo: o servidor já precifica no envio

A RPC `enviar_orcamento` recebe **só `{product_id, qty}`** por item
(`src/lib/orcamento-actions.ts`); quem busca o preço é o **servidor**, na tabela
`products`, no momento do envio — o preço que o pintor viu na tela nunca é enviado.

Consequência: um orçamento montado offline e sincronizado horas depois **já sai com os
preços vigentes no banco**, sem nenhuma mudança na RPC. A "regra de comparação" que
se imaginava (comparar cache × banco na volta) não precisa existir como código de
reconciliação — o envio **é** a reconciliação.

## 3. Decisão de negócio — TRAVADA: reprecificar no envio (Opção B)

> **Regra:** orçamento sincronizado usa o **preço atual do banco**, não o preço que o
> pintor viu offline. Decidido em 2026-07-02.

**Por quê (registrado):** protege a loja e o pintor. Se o preço subiu enquanto o pintor
estava offline, vender pelo preço velho seria prejuízo da loja — e o bônus do pintor
(1% do bruto) também sai maior sobre o valor real. O cliente final recebe o preço
vigente, como receberia no balcão. Alternativa descartada (Opção A — honrar o preço
cotado + flag pro admin decidir): mais "fiel à promessa de campo", porém transfere o
prejuízo pra loja; rejeitada conscientemente.

**Obrigação de UX que essa escolha cria:** o total mostrado offline é **estimativa**.
O app deve dizer isso com todas as letras (§7) — o pintor não pode descobrir depois
que prometeu um valor que mudou. Após o sync, se o total real divergiu do estimado,
mostrar aviso "preços atualizados no envio" no pedido.

## 4. Arquitetura

```
ONLINE (hoje, intacto)                    OFFLINE (aditivo)
layout.tsx busca payload ──────────────┐  UI lê o espelho do aparelho (IndexedDB)
        │                              │  Enviar → grava na FILA (outbox), não na rede
        └─> grava espelho no aparelho ─┘  Sinal voltou → fila é enviada pela MESMA
            (catálogo, clientes, ts)       server action / RPC de sempre (que reprecifica)
```

Duas estruturas no **IndexedDB** do aparelho (via lib `idb`, ~1KB):

1. **Espelho de leitura** — o payload que o `layout.tsx` já monta (catálogo
   `products_public`, clientes do pintor, saldo etc.) + `atualizado_em`. Regravado a
   cada carga online bem-sucedida. O pintor offline vê o mundo "de alguns minutos/horas
   atrás" — aceito no briefing.
2. **Outbox (fila de envio)** — orçamentos criados offline, no formato exato do
   `EnviarOrcamentoInput` (`{product_id, qty}` + cliente + desconto/pagamento/obs) +
   snapshot do total estimado (só pra UX de divergência) + `criado_em` + `status`
   (`na_fila` → `enviando` → sucesso remove / erro volta pra `na_fila` com motivo).

**Gatilhos de sincronização** (processam a fila em ordem, um a um):
- evento `online` do navegador (app aberto quando o sinal volta);
- abertura/retomada do app (`visibilitychange`) com fila não-vazia;
- retry manual: botão "enviar agora" no card do pedido na fila.

**Cliente novo offline:** o find-or-create por `documento` da própria RPC já torna o
envio idempotente pro cadastro — cliente criado offline entra na fila junto do pedido,
sem tabela extra.

## 5. O desafio técnico real: App Router offline (ler antes de codar)

O `(app)/layout.tsx` é **Server Component** — offline, não há servidor pra renderizar.
O shell do Serwist cobre asset estático, mas a **navegação** (documento/RSC payload)
falha sem rede. Estratégia em duas peças:

1. **Runtime caching de navegação** no `sw.ts`: estratégia `NetworkFirst` pros
   documentos das rotas do app — o SW guarda o último HTML servido e o entrega
   offline (em vez de cair no fallback `~offline`, que vira último recurso).
2. **Hidratação do provider pelo espelho**: o `PintorProvider` (client) passa a
   (a) persistir no IndexedDB o payload que recebe do layout a cada carga online e
   (b) detectar que o HTML veio do cache do SW (payload embutido velho) e re-hidratar
   do espelho, marcando o estado como offline.

⚠️ **Etapa 0 obrigatória — spike de 1 dia:** antes de qualquer feature, validar no
aparelho real que (matar o app → modo avião → abrir) renderiza Home e Orçamento com
dados do espelho. RSC + offline é a parte com risco de engenharia deste bloco; se o
spike travar, o plano B é a rota `/orcamento` virar client-only (página estática
precacheada que lê tudo do IndexedDB) — menos elegante, risco menor.

As telas **não mudam**: já leem tudo do contexto (decisão da Fase 1 pagando dividendo).

## 6. Comportamento por plataforma — Android × iOS

| | **Android (Chrome/Blink)** | **iOS (Safari/WebKit, PWA instalado)** |
| --- | --- | --- |
| Montar orçamento offline | ✅ | ✅ |
| Fila enviada com app **aberto** quando o sinal volta (evento `online`) | ✅ | ✅ |
| Fila enviada em **segundo plano / app fechado** (Background Sync API) | ✅ suportado — dá pra registrar `sync` no SW e o Chrome envia sozinho quando a rede volta | ❌ **não existe** no WebKit. A fila só processa com o app aberto (ou reaberto) com sinal |
| Persistência do IndexedDB | Estável; `navigator.storage.persist()` costuma ser concedido | PWA instalado é **isento** da limpeza de 7 dias do Safari, mas o iOS pode despejar storage sob pressão de espaço; pedir `persist()` best-effort |
| Texto de UX correto | "Será enviado automaticamente quando houver internet" | **"Será enviado quando você abrir o app com internet"** — nunca prometer envio em segundo plano no iOS |

**Regra de projeto:** o denominador comum (envio com app aberto/reaberto) é o
comportamento garantido nos dois mundos e cobre o caso real (pintor termina o orçamento,
guarda o celular, reabre depois). Background Sync no Android entra como **melhoria
progressiva** — se disponível, registra; se não, os gatilhos do §4 resolvem. A UI nunca
depende dele.

## 7. UX (estados novos)

- **Indicador offline** global discreto (ex.: pílula "sem conexão" no topo) + carimbo
  "catálogo de {hora}" na busca do orçamento.
- **Total offline = estimativa:** rótulo "valores sujeitos a atualização no envio"
  no carrinho e na revisão (consequência direta da Opção B).
- **Enviar offline:** botão vira "Salvar pra enviar depois" → tela de confirmação
  adaptada ("na fila; enviamos quando houver internet" / iOS: "...quando você abrir o
  app com internet").
- **Pedidos na fila** aparecem na lista de pedidos com badge "aguardando envio"
  (fonte: outbox local, não o banco) + botão de retry manual.
- **Pós-sync:** pedido some da fila e entra na lista real (refresh). Se o total real ≠
  estimado, aviso "preços atualizados no envio" no card/detalhe.
- **Erro definitivo no envio** (ex.: produto saiu do catálogo): pedido fica na fila com
  o motivo, pintor edita ou descarta — nunca some silenciosamente.

## 8. Ordem de implementação sugerida

1. **Etapa 0 — spike RSC offline** (§5). Gate: sem ela aprovada, nada avança.
2. Espelho de leitura: persistir payload no IndexedDB + hidratação offline do provider.
3. Runtime caching de navegação no `sw.ts` (NetworkFirst + fallback).
4. Outbox + botão "salvar pra depois" + gatilhos de sync (§4) + telas do §7.
5. Melhoria progressiva Android: Background Sync.
6. Teste de aceite nos dois mundos: modo avião de ponta a ponta (montar → fila →
   voltar sinal → sync → conferir reprecificação e aviso de divergência).

## 9. Decisões em aberto

- **Validade do espelho:** catálogo com mais de N dias ainda vale pra montar orçamento?
  Sugestão: sim, sempre (regra do briefing: nunca bloquear), só reforçar o carimbo de
  idade na UI quando passar de 24h.
- **Escopo do offline de leitura:** este anexo cobre montar orçamento. Home/Pedidos/Loja
  offline mostram o espelho (leitura velha) de graça — mas ações deles (resgatar etc.)
  continuam exigindo rede na v1. Confirmar que resgate offline fica fora (recomendado:
  fora — mexe em saldo/estoque, risco alto).
- **Limite da fila:** N orçamentos pendentes? Sugestão: sem limite técnico, alerta visual
  se > 10 (sinal de que algo não sincroniza há muito tempo).
