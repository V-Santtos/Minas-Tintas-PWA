# Sessão atual

**Atualizado:** 2026-08-01

---

## 🖥️ Migração de ambiente: Windows → Ubuntu 26.04 (2026-08-01)

Projeto copiado (não clonado) do Windows para o Ubuntu. Dois problemas, nenhum deles de código:

1. **230 arquivos "modificados" sem nenhuma mudança real** — os arquivos vieram com **CRLF**,
   os blobs no git são **LF**, e o repo **nunca teve `.gitattributes`**, então o tratamento de
   fim de linha dependia da config local de cada máquina. Diagnóstico que prova:
   `git diff --ignore-cr-at-eol --stat` volta **vazio** (o diff bruto era 64.642 inserções contra
   64.642 deleções — toda linha do repo). **Corrigido:** `.gitattributes` com `* text=auto eol=lf`
   \+ `core.autocrlf input` + re-checkout forçado (`git rm --cached -r . && git reset --hard`).
   **`git pull` não resolveria isto** — pull traz commits, não reescreve o working tree; o `\r`
   está nos arquivos em disco, não no repositório.
2. **`node_modules` inutilizável** — vieram só binários win32 (`swc-win32-x64-msvc`,
   `sharp-win32-x64`, `lightningcss-win32-x64-msvc`). **Corrigido:** apagar `node_modules` + `.next`
   dos 2 apps e reinstalar.

**Lição reaplicável:** com o `.gitattributes` versionado, um `git clone` novo (em qualquer SO)
já nasce em LF — isto foi consequência de **copiar a pasta** em vez de clonar. Num clone só
sobram os passos normais de setup: `npm install` e recriar os `.env.local` (nunca vão pro git).

**⚠️ Envs marcadas como "Sensitive" na Vercel não podem ser lidas de volta** (nem por
`vercel env pull`, nem no dashboard) — todas as deste projeto estão assim. Elas seguem servindo
produção normalmente, mas **não são recuperáveis** para uma máquina nova. Para desenvolvimento
local com push, gerar um par VAPID **próprio de dev** (`npx web-push generate-vapid-keys`) —
prod e dev não compartilham subscriptions, então divergir é inofensivo. O par de produção só
existe hoje dentro da Vercel: se precisar dele fora de lá, não há como extrair.

---

## ✅ SUBIDA DE 2026-07-02 — CONCLUÍDA (histórico)

Os 7 commits abaixo **já subiram** (`2037a2c`..`12781b7`, todos em 2026-07-02), e o trabalho
posterior (até `f566cca`, 2026-07-20) foi construído em cima deles. Mantido como registro do
que cada commit carregava.

### O que subiu (7 commits, nesta ordem)

Arquivos que misturam dois temas (layout raiz, LoginForm) vão no commit onde está o
grosso, com o "caroneiro" citado no corpo — evita `git add -p`.

1. **`feat(notificacoes): som sutil de notificação in-app (pintor + admin)`**
   `src/lib/som.ts` novo nos 2 apps + filtro `onEvento` nos 2 `RealtimeRefresh.tsx`.
   Corpo: WebAudio sintetizado sem MP3; primeSom() no 1º gesto; throttle 3s; pintor toca em
   orders UPDATE / point_transactions INSERT / resgates UPDATE; admin em orders/resgates INSERT;
   loja_items e ações do próprio usuário não tocam.
2. **`feat(notificacoes): push real no celular com o app fechado (T6c)`**
   Migration `20260702150000_push_subscriptions.sql` + pintor (`sw.ts` handlers,
   `push-client.ts`, `push-actions.ts`, card "NO CELULAR" em Configurações) + admin
   (`web-push` no package.json+lock, `lib/push.ts`, ganchos em lojinha/pedidos actions).
3. **`feat(pintor): adiantamento seguro do offline — espelho IndexedDB + pílula sem conexão`**
   `lib/espelho.ts` + `pintor-store.tsx` (write-through no PintorProvider) +
   `components/OfflinePill.tsx` (o mount no (app)/layout vai no commit 5, mesmo arquivo).
4. **`feat(pintor): splash iOS no launch frio + start_url direto no /home`**
   11 imagens em `public/splash/` + `manifest.start_url: "/home"`. Corpo: sem startup image,
   o `black-translucent` deixava o launch frio PRETO por 1–3s; a splash cobre a espera com a
   marca. As tags `appleWebApp.startupImage` do layout raiz entram no commit 5 (mesmo arquivo).
5. **`fix(pintor): viewport do iOS standalone estável desde o 1º frame (launch frio)`**
   `globals.css` + `SplashWelcome.tsx` + `app/layout.tsx` (raiz) + `(app)/layout.tsx` +
   `ViewportDebug.tsx` + `next.config.ts`. Corpo, 4 fixes medidos no aparelho (painel):
   (a) login/splash sem `minHeight/height: 100dvh` inline — o inline ganhava da regra
   `--app-vh` e prendia as telas no dvh defasado (793/852);
   (b) `.pintor-app--nav` com **height fechado** (não min): min-height não é altura definida
   pro flex → o basis 0% da `.pintor-scroll` caía no fallback de conteúdo, a moldura crescia
   (medido 970 numa tela de 852) e a nav afundava 118px; vale Android também;
   (c) script inline síncrono pré-paint no layout raiz: `--app-vh` + classe `ios-standalone`
   + `--safe-top-boot` (= screen.height − innerHeight no boot, a status bar que o
   `env(safe-area-inset-top)` só entrega depois) — mata o flick da nav e o pulo do conteúdo;
   CSS usa `max(env, var)`;
   (d) bottom-nav centralizada com left/right 0 + margin auto (o `translateX(-50%)`
   ancorava em meio-pixel → "tremidinha" lateral dos ícones a cada repintura).
   Caroneiros: `startupImage` (splash, commit 4) no layout raiz; mounts de OfflinePill/
   ViewportDebug no (app)/layout; `allowedDevOrigins` (dev na LAN) no next.config;
   painel `?debug=1` estendido (login/splash + linhas screen/--app-vh/filhos/scroll).
6. **`feat(pintor): botão de instalar o PWA na tela de login`**
   `components/InstalarPwa.tsx` + `login/LoginForm.tsx`. Só aparece quando a instalação
   nativa de 1 toque existe (Android/Chrome, beforeinstallprompt capturado no boot pelo
   script inline, mini-infobar suprimida). iPhone não vê nada (decisão: instrução via PDF
   da loja; sem guia na tela). Some no app instalado e no preview desktop. Botão fixo no
   login, não pop-up: não compete com o modal de brinde do 1º login. Caroneiro: o fix (a)
   do commit 5 no LoginForm (mesmo arquivo).
7. **`chore(repo): favicon do M, anexos de instrução e ajustes soltos`**
   `src/app/icon.png` nos 2 apps (admin = M quadrado 256²; pintor = icon-192;
   `favicon.ico` padrão removido do admin) + `anexo-01`/`anexo-02` + `.vercelignore` (2) +
   `suppressHydrationWarning` no layout do admin + deleção intencional de
   `Minas Tintas/05 - App/assets/bone.png` + este `sessao-atual.md`.

### Ordem de subida (importante)

1. **ANTES do push: envs VAPID na Vercel** — `NEXT_PUBLIC_VAPID_PUBLIC_KEY` é embutida no
   bundle **no build**; se a env não existir na Vercel quando o deploy buildar, o botão de
   ativar push falha com "Chave de notificação ausente" até um redeploy. Projeto **pintor**:
   `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Projeto **admin**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
   `VAPID_SUBJECT` (runtime, mas configurar junto). Valores nos `.env.local` locais.
2. **Commits + push** (mensagens acima; Claude gera o texto final quando ordenado).
3. **Provar o build servido** (lição do Instant Rollback): `GET /sw.js` do domínio do pintor
   deve listar o build novo; `?dpl=` do HTML; não confiar no ✓ do GitHub nem no navegador
   com SW.
4. **`supabase db push`** — aplica as 2 migrations pendentes (bloco ⚠️ abaixo). Pode ser
   antes ou depois do deploy (aditivas); sem elas o push de notificação é no-op.
5. **Testes de aceite:** favicon (aba com o M); som (2 perfis: admin aprova → pintor toca);
   pílula (modo avião → "Sem conexão" aparece); push (iPhone: PWA instalado → Configurações →
   Ativar avisos → conceder permissão → matar o app → admin aprova pedido → banner nativo com
   som do SO → tocar abre o pedido). Android cobre o mesmo fluxo sem restrições.
   **Splash iOS: APAGAR e REINSTALAR o PWA** (iOS cacheia splash + start_url na instalação) —
   abertura fria deve mostrar creme+M no lugar do preto. **Botão "Instalar o aplicativo":**
   abrir o domínio num Android/Chrome (navegador) → botão aparece no login → toque abre a
   folha nativa; iPhone e app instalado não mostram nada.

### Proposta registrada (NÃO fazer agora) — launch instantâneo do cache

A eliminação estrutural da espera do launch (abrir a última tela direto do cache e atualizar
por trás, tipo app nativo) é **exatamente o bloco offline da Fase 2** (runtime caching de
navegação no sw.ts + re-hidratação pelo espelho IndexedDB — que já está sendo populado pelo
adiantamento). **Decisão (2026-07-02): não antecipar** — depende do spike (Etapa 0 do
`anexo-02-orcamento-offline.md`); improvisar fora do plano reintroduz o risco que o anexo
cercou. Quando o bloco offline entrar, a splash vira um flash breve e o launch fica
quase-instantâneo de graça.

### Segurança da subida (verificado, não presumido)

- Nenhuma mudança no caminho de render das telas existentes (únicas UIs novas: card
  "NO CELULAR" e pílula offline, ambas condicionais e hydration-safe).
- Cada peça degrada pra no-op: som (guards + try/catch), espelho (falha silenciosa),
  push admin (try/catch total; sem migration/envs → retorna), botão push sem migration →
  mensagem de erro tratada.
- SW: handlers `push`/`notificationclick` são passivos; precache e fallback offline intactos
  (não é a classe de mudança dos incidentes passados).

---

## ⚠️ INSTRUÇÕES DE BANCO — rodar no Supabase (Claude não aplica direto)

Claude versiona a migration no repo; **o dev roda no banco hospedado** (`supabase db push` ou o SQL
pelo dashboard).

**As duas migrations que estavam pendentes em 2026-07-02** (`20260701150000_resgate_cancelado_por`
e `20260702150000_push_subscriptions`) **saíram da fila**: o trabalho posterior dependeu delas
(o commit `71d8e99`, de 07-05, já ajusta o seed para limpar `push_subscriptions`) e o push está
em produção. Migrations posteriores no repo, na mesma situação — `20260703102233_brinde_sorteio`,
`20260705152953_realtime_settings`, `20260705161322_promo_desde` e `20260720_rpc_get_all_products`.

**Não verificado contra o banco** (a máquina nova ainda não tinha o Supabase CLI quando isto foi
escrito): confirmar com `supabase migration list` assim que o CLI estiver logado, e aplicar o que
faltar. A lista é a fonte da verdade, não este parágrafo.

> Regra geral: migrations aditivas (coluna com default, `create or replace`, RPC nova) são seguras
> num banco populado; rename/drop são breaking → expand/contract (subir código compatível antes do
> `db push`).

---

## Estado consolidado

Repositório: `https://github.com/V-Santtos/Minas-Tintas-PWA`
Apps Admin e Pintor validados e **em produção** (`minas-tintas-pintor.vercel.app` e
`minas-tintas-app.vercel.app`). Último commit: `f566cca` (2026-07-20), local e remoto em dia.

> **Provar o build servido, não o ✓ do GitHub** (lição do Instant Rollback, abaixo): que os dois
> domínios respondam não prova qual commit cada deployment serve. Amarrar o SHA exige `vercel ls`.

**Sessão de 2026-07-02 (publicada):**

- **Som de notificação in-app** (pintor + admin) — ✅ implementado.
- **T6c — Push real com app fechado** — ✅ implementado (valida no aparelho pós-deploy).
- **Offline (Fase 2): adiantamento seguro** (espelho IndexedDB + pílula) — ✅; resto do
  bloco especificado no `anexo-02` (decisão de reprecificar no envio TRAVADA).
- **Favicon**: M no admin, icon-192 no pintor.
- **Anexos de instrução criados na raiz:** `anexo-01-push-app-fechado.md` (executado) e
  `anexo-02-orcamento-offline.md` (a executar; Etapa 0 = spike RSC offline).

**Sessão de 2026-07-02 (tarde) — saga do viewport parte 2 + instalar PWA (✅ VALIDADO no aparelho):**

- **4 fixes de viewport** (detalhe no commit 5 do bloco 🚀): login/splash sem dvh inline;
  moldura interna com altura FECHADA (`.pintor-app--nav`); script síncrono pré-paint
  (`--app-vh` + `--safe-top-boot`); nav sem âncora de meio-pixel. Cadeia de causas achada
  com o painel `?debug=1` no aparelho (medições: 970/852, 793/852, innerW 462).
  **Validado: launch frio nasce estável, sem flick, sem pulo, nav sentada.**
- **Botão "Instalar o aplicativo"** no login (commit 6) — Android/Chrome só; iPhone sem UI
  (PDF da loja). Valida pós-deploy num Android.
- **Lições novas (dev na LAN):** Next 16 exige `allowedDevOrigins` pra IP de rede (senão
  celular recebe HTML sem CSS/JS); **Zoom da Página do Safari** é por domínio, herda pro
  PWA instalado e distorce tudo (innerW ≠ screen.width no painel denuncia); PWA instalado
  durante servidor quebrado fica envenenado → apagar e reinstalar.
- **Pendência de limpeza ampliada:** ViewportDebug agora montado TAMBÉM no layout raiz
  (inerte sem `?debug=1`) — remover os 2 mounts + IosVh continua só pro orientationchange.

**Sessões anteriores (já publicadas):**

- **Brinde de boas-vindas** (banco + concessão + front real) — **CONCLUÍDO**.
- **Notificações do pintor: feed real + não-lido (T6a/T6b)** — **CONCLUÍDO**.

O que falta do sistema de notificações (T6d avisos da loja) segue como bloco futuro.

---

## Bottom-nav no iPhone (launch frio) — ✅ RESOLVIDO (+ incidente de deploy)

**Sintoma (4 dias de caça):** na abertura FRIA do PWA standalone a bottom-nav nascia
"empurrada" pra cima com faixa creme embaixo; arrastar (rubber-band) ou abrir/fechar o
teclado assentava em definitivo; minimizar não quebrava; só matar+reabrir reproduzia.

**Causa raiz (medida no aparelho, painel ?debug=1):** no launch frio o iOS entrega o
viewport e o `100dvh` **defasados** — `innerHeight 793` numa tela de `852` (some a
altura da status bar). A moldura `.pintor-app` (min-height:100dvh) nascia curta e a
nav, ancorada nela pelo `transform`, nascia junto. Gesto real reconcilia o viewport;
**scroll programático NÃO reconcilia** (testado: kick com overflow de 1px + scrollTo,
ignorado pelo WebKit). Dentro do palco falso tudo é consistente (`BURACO 0px`) — só a
comparação com `screen.height` expõe.

**Fix (commit `93f2766`, único delta sobre o baseline):** `IosVh.tsx` (layout raiz)
marca `html.ios-standalone` e publica `--app-vh = screen.height` (px físico, correto
desde o 1º frame; orientation-aware); CSS: `html.ios-standalone .pintor-app
{ min-height: var(--app-vh, 100dvh) }`. Nav/paddings/visual do baseline intocados;
Android/Safari/desktop sem mudança. **Confirmado funcionando no aparelho.**

**Decisões travadas:**
- Moldura continua com `transform: translateZ(0)` (containing block dos fixed) — mas a
  altura no iOS standalone vem de `--app-vh` (px medido), **nunca** de dvh puro.
  transform + dvh = bug; transform + px medido = fix.
- **Visual da nav é o do baseline `c8095bb`** (78px, ícones a 8px do fundo, SEM
  `env(safe-area-inset-bottom)` somado) — os calc(env) do `06e5270` foram rejeitados
  visualmente e revertidos. Não reintroduzir sem aprovação visual.

**Histórico da saga (pra não reabrir):** `1f21385` scroll-lock do modal → `91a1e44`
transform no mobile → `c8095bb` painel de debug → `06e5270` removeu transform +
calc(env) → `c949f42` painel sempre-on → `4073370` kick (falhou) → `3767a87` plano B
(rejeitado no visual por herdar os calc(env)) → `ad1be46` **revert ao c8095bb** →
`93f2766` **fix final** (baseline + --app-vh).

**INCIDENTE que custou os dias: produção congelada por Instant Rollback.** Um rollback
no Vercel (projeto minas-tintas-pintor) prendeu o domínio no deployment do `91a1e44`
por horas: commits novos buildavam (✓ verde no GitHub) mas **não eram promovidos** —
todos os fixes foram "testados" contra a versão quebrada. Lições:
- ✓ do GitHub prova build, **não** prova o que o domínio serve.
- Verificar o build servido sem depender do device: `GET /sw.js` (lista o precache do
  build atual) + grep de string-assinatura nos chunks; CSS público; `?dpl=` do HTML.
- Navegador do dev (desktop e iPhone) é servido pelo service worker → nunca é teste
  limpo de deploy; nem aba anônima garante.
- Desfazer: dashboard → Undo Rollback → promover o deployment mais novo.

**Pendência de limpeza:** `ViewportDebug.tsx` (painel `?debug=1`, inerte em prod)
ainda existe — apagar quando não houver mais investigação de viewport pendente.

## Brinde de boas-vindas — ✅

- Cada pintor novo ganha **um** brinde (boné **ou** pincel), sorteado **no banco** na
  criação do pintor (RPC `conceder_brinde_boas_vindas`, service_role, idempotente, trava
  de estoque no boné: 10 fixos, esgotou todos pegam pincel). Nasce como **resgate grátis**
  pendente (`pontos_congelados = 0`, sem ledger).
- Modelagem **A**: itens-brinde são `loja_items` com `is_brinde = true` (IDs fixos
  `…c1` boné / `…c2` pincel), fora da grade da lojinha do pintor **e** do admin (ambas as
  queries filtram `is_brinde = false`). O card de **resgates** do brinde continua no admin.
- `stock` virou nulável (`null` = ilimitado, caso do pincel). `resgates.pontos_congelados`
  aceita `>= 0`. Cancelamentos (pintor/admin) não lançam `devolucao` quando é grátis.
- "Já viu o modal" = `painter_settings.brinde_visto_em` (RPC `marcar_brinde_visto`).
- Front do pintor lê o objeto `brinde` do contexto (derivado no layout): `BrindeModal`
  (mostra se `brinde && !visto`, fecha chamando a RPC), `BottomNav` (bolinha = pendente e
  não visto), `notificacoes` (card enquanto pendente). Preview `?brinde=bone|pincel` na home.

## Notificações — feed real + não-lido (T6a/T6b) — ✅

- **Feed derivado** dos fatos que o `layout` já busca (sem tabela de notificações):
  pedidos aprovados (pts reais do ledger) e recusados, resgates pendentes, promoções
  (`mult_delta < 0`) e o brinde. Cada tipo respeita `notifPrefs` (enfim com consumidor).
- Tela `/notificacoes` renderiza o feed agrupado por **Hoje/Ontem/Anteriores** com tempo
  relativo e estado vazio. Mock (HOJE/ONTEM hardcoded) removido.
- **Não-lido:** `painter_settings.notif_visto_em` + RPC `marcar_notif_visto` (padrão do
  brinde). Não-lido = evento com `created_at` > último visto. Bolinha do sininho na home
  (antes fixa) passou a depender de `data.notifNaoLidas`; abrir a tela carimba o visto.
- Casa com o Realtime: app aberto → evento novo → `router.refresh()` → bolinha acende só.
- **Escopo:** funciona **com o app aberto**. App fechado = vê na próxima abertura (T6c cobre).

**Decisões travadas (notificações):** feed é projeção derivada, não tabela; não-lido é um
**marco temporal único** por pintor (não "lido por item" — o feed não tem id persistente).

---

## Próximo bloco — restante das notificações (T6c/T6d) e offline

T6c saiu de "adiado" pra **implementado e publicado** (subiu em 2026-07-02); T6d segue adiado
consciente; offline tem anexo pronto + adiantamento feito. Nada aqui bloqueia o resto.

- **T6c — Push real: ✅ IMPLEMENTADO localmente (2026-07-02), pendente de validação.**
  Instrução em `anexo-01-push-app-fechado.md`; arquitetura por evento (server action do
  admin emite; sem cron/Edge Function), blueprint do projeto `Desktop\relogio`. Entregue:
  - **Banco:** migration `20260702150000_push_subscriptions.sql` (ver bloco no topo).
  - **Pintor:** `sw.ts` ganhou handlers `push`/`notificationclick` (abre `/notificacoes`
    ou o pedido); `lib/push-client.ts` (assinatura VAPID no navegador; estados
    unsupported/denied/ativo/inativo); `lib/push-actions.ts` (upsert/delete da
    subscription, painter pelo JWT); card "NO CELULAR" em Configurações com botão
    Ativar/Desativar (gesto obrigatório no iOS) — sem toggle novo por tipo.
  - **Admin:** dep `web-push`; `lib/push.ts` (`enviarPushPintor`, service_role,
    respeita `notif_pedidos`/`notif_resgates`, críticos sem toggle, limpa 404/410,
    best-effort — nunca quebra a action); ganchos em aprovar/recusar/estornar/criar
    pedido + entregar/cancelar resgate.
  - **Envs:** par VAPID gerado e nos `.env.local` dos dois apps.
    Pintor: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Admin: `VAPID_PUBLIC_KEY`,
    `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. **Falta espelhar na Vercel** (2 projetos).
  - Typecheck ok nos dois; build de produção do pintor ok (SW bundlado).
  - **Falta:** `db push` da migration; envs na Vercel; teste no aparelho (iPhone:
    PWA instalado, ativar em Configurações, matar o app, aprovar pedido → banner);
    commit (aguardando ordem).
- **Fase 2 — Orçamento offline:** instrução detalhada pronta em
  **`anexo-02-orcamento-offline.md`** (raiz do repo). **Adiantamento seguro FEITO
  (2026-07-02, local):** (1) `lib/espelho.ts` — write-through do payload pro IndexedDB
  (`mt-pintor-offline`/`espelho`) a cada carga, via `useEffect` no `PintorProvider`;
  best-effort, invisível, `lerEspelho()` já exportado pro bloco futuro (aparelhos vão
  estrear com espelho populado). (2) `components/OfflinePill.tsx` — pílula "Sem conexão"
  (eventos online/offline), fixa na moldura `.pintor-app` (NUNCA no `.pintor-scroll`,
  lição dos overlays iOS). Typecheck + build ok. **Não adiantado de propósito:** runtime
  caching de navegação no sw.ts (só nasce junto da re-hidratação, pós-spike) e outbox
  (formato pode mudar com o spike). Decisão de negócio TRAVADA
  (2026-07-02): **reprecificar no envio** com o preço atual do banco (Opção B — protege
  loja e bônus do pintor; total offline vira "estimativa" na UX). A RPC `enviar_orcamento`
  já implementa isso (servidor precifica por `{product_id, qty}`, ignora o preço visto).
  Espelho + fila no IndexedDB do aparelho (Redis/cache de servidor não serve pra offline);
  iOS sem Background Sync → fila processa com o app aberto/reaberto; Android ganha
  Background Sync como melhoria progressiva. Etapa 0 obrigatória: spike do RSC offline.
- **T6d — Avisos livres da loja (BANCO):** comunicados escritos à mão pelo admin
  ("Fechado dia 25") que **não** derivam de evento do domínio → exigem **tabela própria**
  de notificações + tela no admin pra escrever. (O único caso que quebra o "derivar do fato".)

---

## Interações de toque (mobile / pintor) — em andamento

Objetivo: todo elemento tocável reconhecer o toque na hora (feedback `:active`),
pra matar a sensação de "não clicou" + o multi-clique durante o round-trip da ação.
Descoberto no botão **Cancelar** do resgate pendente (loja) — não tinha feedback nenhum.

- **Categoria A — ✅** classes que só tinham estado *selecionado*, sem press: `.back-btn`
  (opacity), `.qty-btn`/`.period-btn`/`.nav-item` (scale). Fix único no `globals.css`.
- **Categoria B — ✅** 21 botões estilizados por `style` inline (não herdavam `:active`
  de classe): criada a utilitária `.tap` (`scale(0.96)` + reset de tap-highlight) e
  aplicada em Cancelar, filtros, steppers, segmentos Pessoa/Empresa, Sair, toggles,
  fechar modal, etc. Card de cliente inerte (sem `onClick`) deixado de fora.
- **Categoria C — decisão: adiada, não é fix necessário agora.** São tocáveis
  **não-`<button>`** (`<div onClick>`: pickClient, openNewClientForm; `.pill` de filtro;
  `.dd-option` de menu; opção de pagamento). O *resultado* do toque já dá feedback
  visual (item destaca, menu fecha, form abre) → não sofrem do problema "botão morto".
  Dois resíduos separados, se um dia quisermos: (1) `:active` sutil em `.pill`/`.dd-option`
  por consistência (trivial); (2) **a11y** — os `<div onClick>` não são botões reais
  (sem foco/teclado/`role`); bloco próprio, mais delicado que feedback visual.

**PENDÊNCIA (ADM, fora de foco agora):** auditar o **admin** pelo mesmo padrão
(botões inline sem `:active`). Admin é desktop/hover → menos crítico, mas a mesma
inconsistência inline provavelmente existe. Lapidar quando voltarmos ao admin.

## Overlays acima da bottom-nav (mobile) — em andamento

Overlays (`fixed`) renderizados dentro do `.pintor-scroll` ficam **atrás da bottom-nav**
(no mobile o `-webkit-overflow-scrolling: touch` do scroll prende o `fixed`; a nav é irmã
do scroll com `z-index: 40`). Sintoma: o saldo do sheet de resgate saía cortado pela barra.

- **Sheet de sucesso do resgate (`loja/[id]`) — ✅** via `createPortal` para **`.pintor-app`**
  (a "moldura"), não pro `body`. `.pintor-app` é "a tela do app" nos dois contextos: no
  desktop é o frame (com `transform` que contém os `fixed`); no mobile é a tela cheia. Assim
  o mesmo código serve preview desktop **e** PWA real, sem `if desktop`. **Lição travada:**
  portal de overlay vai pro `.pintor-app`, nunca pro `document.body` (senão vaza da moldura
  no preview desktop). Bônus: **barrinha vira swipe-to-dismiss** (arrastar a folha pra baixo
  fecha; `closeSheet` reusado pelo timer e pelo arrasto).
- **`BrindeModal` — ✅** mesma correção aplicada: `createPortal` pro `.pintor-app`. Sintoma era
  só no **iPhone** (WebKit): ao abrir o pop-up a bottom-nav subia e "reassentava" ao arrastar —
  assinatura do `fixed` preso no `-webkit-overflow-scrolling: touch` do scroll; Android/Blink
  ignora a propriedade e não sofre. Era um fix que já existira (commit `a1088c1`) e fora
  revertido sem querer na sequência de "teste de fix" até o `1a8c039`.
- **Resíduo latente (mapeado, não corrigido):** o **orçamento** tem o mesmo padrão solto —
  `.cart-bar` e o toast de `submitError` são `fixed` dentro do `.pintor-scroll` sem portal. Não
  incomodou ainda; se aparecer o mesmo tranco lá no iPhone, a cura é idêntica (portal pro
  `.pintor-app`). Dropdowns de filtro não alcançam a barra.

## Ajustes pontuais desta sessão (pintor) — ✅

- **Pop-up de brinde reaparecendo no `/home` — ✅** `marcarVisto` carimbava `brinde_visto_em` no
  banco mas **não** fazia `router.refresh()`. Como o `(app)/layout.tsx` é o ponto único de fetch
  e **não re-executa em navegação interna** (layout preservado pelo App Router), `brinde.visto`
  ficava congelado em `false` na sessão → o `BrindeModal` reabria a cada remontagem do `/home`
  (ex.: voltar da Loja), até um reload frio. Add `router.refresh()` após o RPC — mesmo padrão de
  `marcar_notif_visto`. Agora o pop-up aparece **uma vez** no 1º login e não volta mais (fechar
  ou "Ver na lojinha" encerram de vez), independente de o admin já ter liberado o brinde.
- **Spin loader no botão Entrar (login) — ✅** ao enviar, "Entrar" vira um `Loader2` girando
  (centralizado no mesmo botão, `.btn` já é flex-center), botão `disabled` durante o request
  (anti duplo-envio), volta a "Entrar" em erro e segue girando no redirect de sucesso. Add
  `@keyframes spin` no `globals.css` do pintor (o admin já tinha; mesma convenção `animation`
  inline no ícone).

## Notificações in-app do pintor — clareza + tipos faltando — ✅ (código) / ⏳ (1 migration)

Feed derivado (sem tabela; `layout.tsx` monta, `notificacoes/page.tsx` renderiza via `LOOK[kind]`,
`pintor-store.tsx` tem o tipo `NotifItem.kind`). Trabalho desta sessão:

**Clareza (existentes):**
- "Resgate **disponível**" → "Resgate **pendente**" (alinha com "RESGATES PENDENTES" da Loja).
- Novo `kind: "resgate_entregue"` (`PackageCheck` **verde**), distinto do pendente (`Store` âmbar).

**Tipos que faltavam:**
- **"Pedido estornado"** (`RotateCcw` vermelho) — aprovação revertida, pontos removidos. Deriva de
  `point_transactions` tipo `estorno`. **Sem toggle** (evento crítico). **Sem DB.**
- **"Resgate cancelado pela loja"** (`PackageX` vermelho) — só quando o **admin** cancela
  (auto-cancelamento do pintor é silencioso). **Sem toggle. EXIGE migration** (abaixo).

**Decisões travadas:**
- **Orçamento cancelado NÃO notifica:** a loja nunca cancela orçamento (ela recusa/estorna, já
  cobertos); `cancelar_orcamento` é só do próprio pintor → silêncio.
- **Não multiplicar toggles** ([[feedback-notificacoes-sem-toggle]]): eventos críticos são só o
  evento. Toggle "Pontos creditados" (`notif_pontos`) **voltou a ser ghost** (a "Pontos
  devolvidos"/"creditados" foi criada e **removida** — devolução = cancelamento de resgate, já
  coberto por "Resgate cancelado"; ajuste manual não existe). **Pendência:** decidir se remove o
  toggle da tela de Configurações.
- Brinde: **Modelo A** travado (só "reservado", some ao entregar; sem "Brinde entregue").

**Preview:** `/notificacoes?preview` mostra UMA de cada (8 tipos) — ferramenta de design, inócua em
prod (só liga com o param). `buildSampleFeed()` em `notificacoes/page.tsx`.

**⏳ MIGRATION A RODAR (bloqueia o "Resgate cancelado"):**
`20260701150000_resgate_cancelado_por.sql` — `resgates.cancelado_por` (enum `resgate_origin`), os 2
RPCs `cancelar_resgate`/`cancelar_resgate_admin` gravam quem cancelou, view `resgates_admin` expõe.
Aditiva. **Rodar antes** de o código valer (é coluna que o código lê; sem ela a query degrada pra
vazio, não quebra).

## Som de notificação in-app (pintor + admin) — ✅

Sinal sonoro **sutil** ("din-din" senoidal curto, ~0,3s, volume baixo) quando chega evento
Realtime com o app aberto. Implementação:

- **`src/lib/som.ts` nos dois apps** (duplicado de propósito, convenção do `rules.ts`):
  WebAudio **sintetizado, sem MP3** (zero asset → nada no precache do Serwist; envelope
  controlado = não agressivo). `primeSom()` destrava o AudioContext no 1º `pointerdown`/
  `keydown` da sessão (autoplay policy/iOS); sem gesto ainda → sai mudo sem erro.
  Throttle interno de 3s (aprovação = order UPDATE + ledger INSERT → **um** toque).
  `setMutedSom` exportado sem UI (sem toggle novo, decisão de não multiplicar toggles).
- **Filtro no `RealtimeRefresh`** (som só pra novidade vinda do outro lado):
  **pintor** = `orders` UPDATE, `point_transactions` INSERT, `resgates` UPDATE;
  **admin** = `orders` INSERT, `resgates` INSERT. `loja_items` e INSERTs do próprio
  usuário não tocam. O callback `onEvento` lê `payload.table`/`eventType` (o `refresh`
  antigo ignorava o payload).

**Resíduos conhecidos (aceitos, refinar se incomodar):** (1) pintor cancelando o próprio
orçamento/resgate gera UPDATE → self-ding 1x; distinguir exigiria olhar `new.status`
(orçamento) e `cancelado_por` (resgate; depende da migration pendente). (2) admin criando
pedido manual gera `orders` INSERT → self-ding. Todos suaves e raros.

**Push com app fechado continua sendo o T6c** (blueprint pronto no projeto `Desktop\relogio`:
VAPID + Edge Function + SW; adaptar gatilho de cron → evento).

## Pendências gerais registradas (ver CLAUDE.md p/ detalhe)

- **Auditar o `seed.sql` ponta a ponta antes do go-live** — aplicar todas as migrations num
  PG16 limpo + rodar o seed inteiro, pra pegar colunas defasadas que só aparecem num reset.
  Baixa urgência; fazer antes do passo de seed do go-live.
- Admin não distingue visualmente os brindes na lista da lojinha (agora escondidos de vez;
  ponto resolvido). Restante: badge/UX é melhoria futura se algum dia forem reexpostos.
- SMTP p/ recuperação de senha (fim do projeto); troca de telefone do pintor (troca de
  credencial dupla); real-time de estoque via webhook Hiper (pós-produção, informativo).
- Infra multi-cliente (Vercel Pro + Supabase cloud vs. multi-tenant vs. hybrid/VPS) —
  interesse no hybrid/VPS; constraint = zero perda de dados (snapshots + pg_dump + WAL).
