# Bri - Tintas: Briefing Completo para Desenvolvimento de Aplicativo

## Contexto do Projeto

Este projeto tem como objetivo construir um **briefing completo e estruturado** para o negócio "Bri - Tintas", que servirá como base para o desenvolvimento de um aplicativo sob medida para esse negócio.

O processo funciona em etapas: recebemos um arquivo inicial com informações brutas sobre o negócio e, a partir dele, lapidamos cada parte — destrinchando a estrutura, os processos, as necessidades e os objetivos — até termos um retrato fiel e completo do negócio, pronto para guiar o desenvolvimento do aplicativo.

## Objetivo

Construir um briefing que responda com clareza:

- O que é o negócio e como ele funciona
- Quem são os clientes e quais são suas dores
- Quais processos precisam ser automatizados ou melhorados
- O que o aplicativo precisa fazer e como deve funcionar
- Quais são as prioridades e restrições do projeto

## Como Trabalhar Neste Projeto

### Uso das Skills (Superpowers)

As skills do Superpowers estão instaladas em `.claude/skills/superpowers/skills/` e **devem ser usadas ativamente** em todo o processo. Se houver 1% de chance de uma skill ser relevante, invoque-a.

Skills disponíveis e quando usá-las:

| Skill | Quando usar |
|---|---|
| `brainstorming` | Explorar estrutura do negócio, mapear funcionalidades do app |
| `writing-plans` | Antes de qualquer fase de análise ou desenvolvimento |
| `executing-plans` | Ao colocar em prática os planos definidos |
| `subagent-driven-development` | Tarefas complexas que se beneficiam de agentes paralelos |
| `dispatching-parallel-agents` | Analisar múltiplas seções do briefing simultaneamente |
| `systematic-debugging` | Identificar lacunas ou inconsistências no briefing |
| `verification-before-completion` | Antes de considerar qualquer seção do briefing concluída |
| `writing-skills` | Ao documentar descobertas e estruturar o briefing |

### Fluxo de Trabalho do Briefing

```
Arquivo inicial recebido
        ↓
Leitura e mapeamento geral (brainstorming skill)
        ↓
Divisão em seções temáticas (writing-plans skill)
        ↓
Lapidação seção por seção (executing-plans skill)
        ↓
Verificação de consistência (systematic-debugging skill)
        ↓
Validação final (verification-before-completion skill)
        ↓
Briefing completo → base para o desenvolvimento do app
```

### Seções do Briefing

O briefing será estruturado cobrindo:

1. **Identidade do Negócio** — nome, missão, posicionamento, diferenciais
2. **Modelo de Operação** — como funciona o dia a dia, processos internos
3. **Público-alvo** — perfil dos clientes, dores, comportamentos
4. **Produtos e Serviços** — catálogo, precificação, sazonalidade
5. **Dores e Gargalos** — o que trava o negócio hoje
6. **Requisitos do Aplicativo** — funcionalidades, integrações, fluxos
7. **Prioridades e Escopo** — o que vai para o MVP e o que fica para depois
8. **Restrições** — orçamento, prazo, tecnologia, equipe

## Contexto Obrigatório — Leia Sempre no Início de Cada Sessão

Antes de responder qualquer pergunta ou executar qualquer tarefa, leia obrigatoriamente estes arquivos:

| Arquivo | O que contém |
|---|---|
| `Minas Tintas/03 - Briefing/briefing.md` | **Fonte de verdade funcional completa** — toda a lógica do app: bônus, lojinha, fluxos, cadastros, admin, integração, offline |
| `Minas Tintas/03 - Briefing/plano-execucao-briefing-visual.md` | Plano de execução do briefing visual — decisões de design, assets, estrutura de seções |
| `Minas Tintas/01 - Identidade Visual/paleta/design-tokens.md` | Tokens de design do sistema visual (Warm Editorial) |
| `Minas Tintas/05 - App/CONTEXTO.md` | **Status atual da fase de telas** — onde paramos, o que foi validado, o que falta, decisões tomadas |

**Regra:** nunca diga que uma informação não existe sem antes ter lido esses arquivos. Eles são a memória operacional do projeto.

---

## Fases do Projeto

### ✅ Fase 1 — Briefing (concluída)
Briefing funcional completo em `Minas Tintas/03 - Briefing/briefing.md`.

### ✅ Fase 2 — Protótipos validados (concluída)
Protótipos HTML interativos validados pelo cliente:
- Pintor (mobile): `Minas Tintas/05 - App/ui_kits/pintor/pintor-app.html`
- Admin (desktop): `Minas Tintas/05 - App/ui_kits/admin/admin-app.html`

### ✅ Fase 3 — App real em Next.js (construção concluída)
- Admin (`minas-tintas-app/`): todas as telas construídas e validadas. Handoff em `Handoff ADM/`.
- Pintor (`minas-tintas-pintor/`): todas as telas construídas e validadas. Handoff em `Handoff Pintor/`.
- Esquema do banco mapeado em `APLICATIVO PWA/inventario-schema-supabase.md`.

---

## Fase Atual — Fase 3: Refinamento e Handoff

Construção de telas concluída. O foco agora é:

### Stack confirmada (não reabrir sem motivo)

| Decisão | Valor |
|---|---|
| Framework | Next.js 16 (App Router) |
| React | 19 |
| CSS | Tailwind v4 com tokens Warm Editorial em `@theme {}` |
| Fontes | `next/font/google` — Inter, Playfair Display, Plus Jakarta Sans |
| Login | Email + senha simples (sem OAuth) |
| Dados | Mock na Fase 3 — banco real em fase posterior |
| Hosting | Vercel |
| Tipo de app | PWA (Progressive Web App) |
| Perfil Pintor | Mobile-first |
| Perfil Admin | Desktop-first |

### Localização do projeto real

| Arquivo/Pasta | O que é |
|---|---|
| `APLICATIVO PWA/minas-tintas-app/` | App Admin — Next.js (desktop-first) |
| `APLICATIVO PWA/minas-tintas-app/src/app/` | App Router Admin — rotas e layouts |
| `APLICATIVO PWA/minas-tintas-app/src/app/globals.css` | Design tokens Admin em `@theme {}` |
| `APLICATIVO PWA/minas-tintas-app/Handoff ADM/` | Handoff Admin — HTML + integracao-e-regras.md |
| `APLICATIVO PWA/minas-tintas-pintor/` | App Pintor — Next.js (mobile-first, PWA) |
| `APLICATIVO PWA/minas-tintas-pintor/src/app/` | App Router Pintor — rotas e layouts |
| `APLICATIVO PWA/minas-tintas-pintor/src/lib/pintor-store.tsx` | PintorProvider — estado mock |
| `APLICATIVO PWA/minas-tintas-pintor/Handoff Pintor/` | Handoff Pintor — integracao-e-regras.md |
| `APLICATIVO PWA/inventario-schema-supabase.md` | Tabelas do banco mapeadas para o Supabase |
| `APLICATIVO PWA/minas-tintas-app/public/logo.png` | Logo da marca |

### Referências de design (não alterar)

| Arquivo | O que é |
|---|---|
| `Minas Tintas/05 - App/ui_kits/admin/admin-app.html` | Protótipo Admin validado — fonte de verdade visual |
| `Minas Tintas/05 - App/ui_kits/pintor/pintor-app.html` | Protótipo Pintor validado — fonte de verdade visual |
| `Minas Tintas/05 - App/colors_and_type.css` | Tokens CSS canônicos |
| `Minas Tintas/03 - Briefing/briefing.md` | Regras de negócio (bônus, lojinha, fluxos) |

### Regras durante o refinamento e handoff

- **Consulte sempre o protótipo** HTML como referência visual antes de qualquer ajuste visual.
- **Consulte o `briefing.md`** para regras de negócio, fluxos e lógica de bônus.
- **Escopo:** só front-end nesta fase — backend, autenticação e notificações push vão para o handoff markdown.
- **Sessão atual**: ver `sessao-atual.md` para saber exatamente onde parou.

## Repositório GitHub

Projeto publicado em: `https://github.com/V-Santtos/Minas-Tintas-PWA`

### O que está no repositório
Todo o conteúdo da pasta raiz sobe, exceto o que está no `.gitignore` raiz:

| Excluído | Motivo |
|---|---|
| `hawkstreet-site/` | Projeto pessoal não relacionado |
| `.claude/` | Configurações locais do Claude Code (memória, settings) |
| `sessao-atual.md` | Notas internas de sessão de trabalho |
| `**/node_modules/` | Dependências — recriadas com `npm install` |
| `**/.next/` | Build gerado automaticamente |
| `**/.env*` | Variáveis de ambiente (não havia nenhum no projeto) |

### Observação técnica
O `minas-tintas-app` tinha um `.git` interno (repo aninhado). Esse `.git` foi apagado para que o código do app Admin apareça normalmente no repositório principal — não havia histórico relevante nele (só o commit inicial do `create-next-app`).

### Para o dev clonar e rodar
```bash
git clone https://github.com/V-Santtos/Minas-Tintas-PWA.git
cd "APLICATIVO PWA/minas-tintas-app" && npm install
cd "../minas-tintas-pintor" && npm install
```

---

## Princípios de Trabalho

- **Não avance sem entender.** Cada seção do briefing deve estar clara antes de partir para a próxima.
- **Documente decisões.** Qualquer escolha de escopo ou direção deve ser registrada com o motivo.
- **Use as skills.** Elas existem para garantir qualidade e estrutura — não são opcionais.
- **Pergunte antes de assumir.** Se uma informação do negócio estiver ambígua, levante a dúvida.
- **Pense no app desde o início.** Cada descoberta do briefing deve ser lida com a pergunta: "como isso impacta o que o aplicativo precisa fazer?"
