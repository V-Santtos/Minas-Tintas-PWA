# Anexo 01 — Push real: notificação no celular com o app fechado (T6c)

**Status:** instrução detalhada — nada daqui foi implementado ainda.
**Objetivo:** o pintor recebe **notificação nativa no celular** (banner + som do sistema)
quando a loja age sobre algo dele — mesmo com o PWA **fechado ou em segundo plano**.
É o bloco registrado como **T6c** no `CLAUDE.md` e no `sessao-atual.md` ("adiado consciente").

---

## 1. Onde o projeto já fala disso (investigação)

| Onde | O que diz |
| --- | --- |
| `CLAUDE.md` (bloco Notificações) | T6c = push real com app fechado (SW + Web Push + tabela de subscriptions), "bloco de infra, independente" |
| `sessao-atual.md` → "Próximo bloco (T6c/T6d)" | Mesma definição; T6c é o que falta pra "receber com o app fechado" |
| `sessao-atual.md` → "Som de notificação in-app" | Som com app **aberto** já entregue; app fechado remete a este anexo |
| Briefing (`Minas Tintas/03 - Briefing/briefing.md`) | **Não** menciona push nem som — recurso nasceu na evolução, não no escopo original |
| Projeto `C:\Users\victo\Desktop\relogio` (Flux Time) | **Blueprint pronto e funcionando**: é a base deste anexo (arquivos citados abaixo) |

## 2. Blueprint de referência (projeto relógio)

Peças já batalhadas lá — copiar a estrutura, adaptar o conteúdo:

- `src/lib/pushSubscription.js` — assinatura VAPID no `PushManager` + upsert por endpoint.
- `supabase/migrations/20260616_push_subscriptions.sql` — tabela de subscriptions.
- `supabase/functions/send-push-alarms/index.ts` — envio com `web-push`, limpeza de
  subscription expirada (HTTP 410), anti-duplicata.
- `src/sw.js` — handlers `push` (→ `showNotification`) e `notificationclick` (foca/abre o app).
- `src/hooks/useNotificationGuide.js` — pedido de permissão via **botão explícito**.

**Diferença central:** o relógio dispara por **horário** (pg_cron varre alarmes a cada
minuto). O Minas Tintas dispara por **evento** — o push sai no momento em que a server
action do admin conclui a escrita. Sem cron, sem Edge Function obrigatória: o envio pode
viver no próprio app admin (Node), que já tem o client `service_role` server-only.

## 3. Arquitetura proposta

```
[Admin: server action conclui RPC com sucesso]
        └─> enviarPushPintor(painterId, msg)   ← best-effort, nunca bloqueia a action
              ├─ lê push_subscriptions do pintor (service_role)
              ├─ lê painter_settings (respeita toggle, quando o evento tem toggle)
              └─ web-push → endpoint do navegador → SW do pintor → showNotification
                                                     (som/vibração = padrão do SO)
```

- **Emissor = app admin** porque **todos** os eventos que notificam o pintor nascem de
  server actions do admin (`pedidos/actions.ts`, `lojinha/actions.ts`). O app pintor não
  precisa de chave privada.
- **Receptor = app pintor**: assinatura + service worker + UX de permissão.
- Alternativa descartada por ora: Database Webhook do Supabase → Edge Function. Desacopla,
  mas adiciona uma peça de infra sem necessidade — os gatilhos já passam todos pelo admin.
  Migrar depois é aditivo (a tabela e o SW não mudam).

## 4. Limitações que precisam estar combinadas antes (iOS principalmente)

- **iOS 16.4+** e o PWA **instalado na tela inicial** (standalone). Safari "solto" não recebe.
- Permissão **só via gesto do usuário** (botão) — pedir automático falha silenciosamente.
- Som/vibração são **do sistema** (`silent: false` implícito); som customizado não existe
  em PWA iOS. O "não agressivo" aqui é escolher bem **texto e frequência**, não o áudio.
- Usuário pode revogar permissão a qualquer momento → envio falha com 410 → limpar a linha.
- Android/Chrome: sem essas restrições (funciona até com o navegador fechado).

## 5. Passo a passo

### 5.1 Chaves VAPID + envs

```bash
npx web-push generate-vapid-keys
```

| Env | Onde (local `.env.local` + Vercel) | Conteúdo |
| --- | --- | --- |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | **pintor** | chave pública (vai pro browser, pode ser pública) |
| `VAPID_PUBLIC_KEY` | **admin** | a mesma chave pública |
| `VAPID_PRIVATE_KEY` | **admin** (server-only, nunca `NEXT_PUBLIC_`) | chave privada |
| `VAPID_SUBJECT` | **admin** | `mailto:` de contato (exigência do protocolo) |

### 5.2 Migration — `push_subscriptions` (aditiva, segura em banco populado)

`aplicativo-pwa/supabase/migrations/<ts>_push_subscriptions.sql`:

```sql
create table push_subscriptions (
  endpoint    text primary key,          -- 1 linha por dispositivo/navegador
  painter_id  uuid not null references painters(id) on delete cascade,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

-- Pintor gerencia só as próprias subscriptions (mesmo padrão self do resto do schema).
create policy "self manage" on push_subscriptions
  for all
  using (painter_id = (select id from painters where auth_user_id = auth.uid()))
  with check (painter_id = (select id from painters where auth_user_id = auth.uid()));
-- Envio é pelo service_role do admin (fura RLS); admin não precisa de policy de select.
```

Por quê `endpoint` como PK: o upsert de re-assinatura fica idempotente e o mesmo pintor
pode ter N aparelhos. `on delete cascade`: pintor apagado não deixa endpoint órfão.

### 5.3 Service worker do pintor — handlers no `sw.ts`

Em `aplicativo-pwa/minas-tintas-pintor/src/app/sw.ts`, **depois** do
`serwist.addEventListeners()` (coexistem; são eventos que o Serwist não usa):

```ts
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Minas Tintas", {
      body: data.body ?? "",
      icon: "/assets/icone-192.png",     // conferir o nome real em public/assets
      badge: "/assets/icone-192.png",
      tag: data.tag ?? "minas-tintas",   // mesmo tag = substitui, não empilha
      data: { url: data.url ?? "/notificacoes" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/notificacoes";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
```

Lembrete travado do projeto: nomes de asset **sem espaço/acento** (precache do Serwist).

### 5.4 Assinatura no cliente (pintor) — `src/lib/push-subscription.ts`

Porte direto do `pushSubscription.js` do relógio, com duas trocas:
TypeScript e a coluna `painter_id` (o id vem do contexto `PintorProvider`, que o layout
já semeia). Funções: `assinarPush(painterId)` (subscribe + upsert por `endpoint`) e
`cancelarPush()` (unsubscribe + delete). A RLS self da 5.2 permite escrever direto pelo
browser client — sem RPC nova.

### 5.5 UX de permissão (pintor)

- **Botão explícito** em Perfil → Configurações: "Ativar notificações no celular"
  (gesto obrigatório no iOS). Fluxo: `Notification.requestPermission()` → se `granted`,
  `assinarPush(painterId)`.
- Estado do botão derivado, sem coluna nova: `Notification.permission` +
  existência de subscription (`pushManager.getSubscription()`).
- **Não** criar toggle novo por tipo — os 4 toggles existentes já filtram o conteúdo
  (decisão travada de não multiplicar toggles).
- Opcional (fase 2 da UX): card-convite no feed de notificações quando
  `permission === "default"`, no padrão do guia do relógio.

### 5.6 Envio (admin) — `src/lib/push.ts` (server-only) + ganchos nas actions

Dependência: `npm i web-push` (+ `@types/web-push`) **no app admin**. É JS puro
(sem binário — não precisa de `serverExternalPackages`).

`enviarPushPintor(painterId, { title, body, url, tag }, { respeitaToggle })`:

1. `service_role`: lê `push_subscriptions` do pintor; se vazio, retorna.
2. Se o evento tem toggle, lê `painter_settings` e sai calado se desligado.
3. `webpush.sendNotification(...)` por endpoint; **410/404 → deleta a linha** (expirada).
4. Tudo em `try/catch` — **best-effort**: falha de push jamais quebra a action
   (mesmo contrato do brinde de boas-vindas no `POST /api/pintores`).

Ganchos — chamar **após o sucesso** da RPC, antes do `revalidate`/retorno:

| Action (arquivo) | Evento | Toggle | Texto sugerido |
| --- | --- | --- | --- |
| `aprovarPedido` (`pedidos/actions.ts`) | pedido aprovado | `notif_pedidos` | "Pedido aprovado — +{pts} pts" |
| `recusarPedido` (idem) | pedido recusado | `notif_pedidos` | "Pedido recusado — fale com a loja" |
| `estornarPedido` (idem) | estorno | **sem toggle** (crítico) | "Pedido estornado — pontos removidos" |
| `criarPedido` (idem) | pedido criado já aprovado | `notif_pedidos` | igual ao aprovado |
| `entregarResgate` (`lojinha/actions.ts`) | resgate entregue | `notif_resgates` | "Resgate entregue — {item}" |
| `recusarResgate` (idem) | cancelado pela loja | **sem toggle** (crítico) | "Resgate cancelado pela loja" |

Espelha as regras do feed in-app (T6a): mesmos tipos, mesmos toggles, críticos sem
silenciador. **Fora do escopo:** brinde (concedido no cadastro — o pintor ainda nem
instalou o app) e promoções (`saveLojaItem` viraria broadcast pra todos os pintores;
decidir depois se vale — custo/ruído).

### 5.7 Ordem de deploy (tudo aditivo — sem expand/contract)

1. Migration 5.2 (`db push`) — inócua sem código.
2. Envs na Vercel (dois projetos) + local.
3. Deploy pintor (SW novo + assinatura + botão). SW atualiza no padrão Serwist.
4. Deploy admin (envio). Sem subscription no banco, os envios são no-op.
5. Teste no aparelho (abaixo).

### 5.8 Teste de aceite

1. iPhone: instalar o PWA (tela inicial), abrir, Configurações → ativar notificações →
   permissão concedida → conferir linha em `push_subscriptions`.
2. **Fechar o app** (swipe up, matar mesmo).
3. Admin aprova um pedido do pintor → banner nativo com som do sistema no aparelho.
4. Tocar no banner → app abre em `/notificacoes`.
5. Revogar a permissão no iOS → aprovar outro pedido → conferir que a linha 410 sumiu
   do banco e a action não deu erro.
6. Repetir 1–4 num Android pra cobrir os dois mundos.

## 6. Decisões em aberto (levantar antes de codar)

- **Promoções via push:** broadcast pra todos os pintores a cada promo? Sugestão: não na
  v1 (ruído); o feed in-app já cobre.
- **Texto exato** das mensagens (tabela 5.6 é sugestão; validar com o cliente).
- **Aparelhos múltiplos:** modelado (N endpoints por pintor); nenhum limite imposto — ok?
- **Admin também recebe push?** (pedido novo com o desktop fechado). Fora deste anexo:
  exigiria emissor no app pintor + subscriptions de admin. O som in-app já cobre a loja
  com o app aberto, que é o cenário real da máquina fixa.
