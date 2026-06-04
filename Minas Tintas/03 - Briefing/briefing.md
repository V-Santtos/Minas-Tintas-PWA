# Briefing — Sistema de Benefícios para Pintores (Minas Tintas)

**Cliente:** Minas Tintas
**Responsável:** Victor Santos
**Tipo de solução:** PWA (Progressive Web App) — aplicativo web instalável no celular, com ícone na tela inicial e dois perfis de acesso (pintor e administração)
**Foco:** Sistema de orçamentos, controle de bônus e lojinha de pontos para pintores parceiros

---

## 1. O que é o aplicativo

A Minas Tintas quer um sistema digital para gerenciar o relacionamento com seus pintores parceiros. Hoje, o controle de indicações, orçamentos e comissões é manual e informal. O aplicativo resolve isso organizando todo o fluxo: o pintor cria orçamentos no campo, a loja valida os pagamentos, e o sistema distribui automaticamente os bônus para o pintor responsável.

O app tem dois lados:
- **Pintor** — cria orçamentos no campo, acompanha os orçamentos feitos por ele, consulta seus pontos acumulados e resgata benefícios/produtos na lojinha de pontos.
- **Administração** — confirma pagamentos, libera bônus para pintores, cadastra pintores, gerencia a lojinha de resgates e seus produtos, e gerencia o estoque geral da loja (via integração com sistema externo).

---

## 2. Como funciona o bônus

A regra base é simples: **o pintor responsável recebe bônus equivalente a 1% do valor bruto do orçamento aprovado**. O cálculo incide sobre o valor total do orçamento — não é calculado por produto individual.

> **Nota:** o percentual de **1% é o valor acordado no momento**. Ele pode ser revisado futuramente se necessário. O sistema deve permitir que esse percentual seja configurável pelo admin (ver Configurações gerais).

| Valor aprovado | Bônus gerado (1%) |
|---|---|
| R$ 100 | R$ 1,00 |
| R$ 350 | R$ 3,50 |
| R$ 1.000 | R$ 10,00 |

**Regra essencial:** o orçamento criado pelo pintor não gera bônus. O bônus só é creditado quando a administração confirma o pagamento. Quem libera é sempre a loja — nunca o pintor sozinho.

**Meios de pagamento:** o app não processa pagamentos — essa responsabilidade é inteiramente da loja. O pagamento acontece fora do sistema, pelos meios que a loja já utiliza: Pix da loja, QR Code próprio, maquininha, dinheiro ou qualquer outro meio que a loja definir. O admin confirma manualmente no painel quando o pagamento for recebido.

**Gateway de pagamento:** o sistema **não terá gateway de pagamento integrado neste momento**. O app apenas registra e acompanha o status do pagamento. Caso seja necessário integrar um gateway no futuro, essa possibilidade será estudada em uma fase posterior — fora do escopo atual.

**Base de cálculo:** o bônus é sempre calculado sobre o **valor bruto do orçamento**. Descontos eventualmente concedidos pela loja ao cliente final não reduzem a base de cálculo. Se o orçamento é de R$ 1.000 e a loja concede R$ 100 de desconto, o bônus do pintor continua sendo 1% de R$ 1.000 = R$ 10.

---

## 3. Experiência do pintor

> **Nota:** a jornada descrita aqui é uma versão inicial — serve como primeira visualização do fluxo para estruturar a experiência. Ainda será detalhado: como cada etapa vai funcionar exatamente, a experiência final do pintor, a lógica completa do fluxo e quais telas, campos e ações existirão em cada etapa. Não tratar como versão final.

O pintor acessa o app pelo celular. O recurso principal é a criação de orçamentos. Tudo o mais é secundário.

### 3A. Criando um orçamento no campo

Cenário típico: o pintor está na casa do cliente, avalia o serviço e monta o orçamento diretamente pelo app.

**Busca do cliente:**
Antes ou durante a criação do orçamento, o pintor busca o cliente no sistema. A busca pode ser feita por:
- **Telefone**
- **Nome completo**

O sistema consulta o banco de dados para verificar se o cliente já existe.

- **Cliente encontrado:** o sistema carrega o cadastro e o pintor vincula o orçamento a esse cliente.
- **Cliente não encontrado:** o pintor cadastra um novo cliente. O **CPF é campo obrigatório** nesse cadastro — serve como chave única/identificador principal do cliente.

**Criação do orçamento:**
Com o cliente vinculado, o pintor preenche:
- Produtos necessários para o serviço, selecionados do catálogo real da loja.
- Quantidades de cada produto.
- Valor total estimado.
- Observação sobre o serviço, se necessário.

Ao finalizar, o app gera um resumo do pedido (a "notinha") e o envia automaticamente para o painel da administração como um pedido pendente. O cliente pode pagar na hora, depois na loja ou de outra forma definida pela administração — o orçamento fica registrado e rastreável até a confirmação.

### 3B. Acompanhando os pedidos

O pintor consegue ver todos os seus pedidos com dois status: **Pendente** (aguardando confirmação de pagamento) e **Aprovado** (pagamento confirmado pelo admin). O detalhamento completo de status (recusado, cancelado etc.) é visível apenas para o admin. Quando um pedido é aprovado, o bônus entra no saldo do pintor automaticamente.

### 3C. Saldo e lojinha

O pintor consulta seu saldo de pontos acumulados e pode trocar esses pontos por produtos ou benefícios disponíveis na lojinha.

Fluxo de resgate:
1. Pintor seleciona o produto na lojinha e confirma o pedido.
2. Os pontos são descontados automaticamente do saldo.
3. O estoque do item na lojinha é reduzido automaticamente.
4. O resgate fica com status **pendente de retirada** até o pintor ir à loja.
5. O admin confirma a entrega quando o pintor retira presencialmente.
6. Cancelamento disponível: se o pintor solicitou por engano, pode cancelar — pontos e estoque são devolvidos automaticamente.

### Navegação do pintor

```
Início → saldo atual + botão de novo orçamento em destaque
Meus Pedidos → pendentes, aprovados, histórico
Lojinha → produtos disponíveis para resgate
Perfil → dados pessoais e senha
```

---

## 4. Cenários de compra e vínculo com o pintor

### Cenário A — Orçamento externo (pintor na casa do cliente)

1. Pintor cria o orçamento no app com cliente e produtos — status "pendente".
2. App envia o pedido para o admin.
3. Cliente vai até a loja comprar os materiais indicados.
4. Loja localiza o pedido pelo telefone do cliente ou número do orçamento.
5. Admin confirma o pagamento — status muda para "aprovado".
6. Sistema calcula 1% e credita ao pintor responsável pelo pedido.

### Cenário B — Compra direta na loja física

O cliente chega à loja sem orçamento prévio pelo app. O admin cria o orçamento diretamente pelo painel administrativo, seguindo a mesma lógica do pintor (produtos do catálogo e valor estimado).

**Regra:** todo orçamento criado no sistema precisa ter um pintor responsável. Se o cliente não tiver nenhum pintor vinculado, a compra acontece fora do sistema, sem registro no app.

Fluxo:
1. Admin pergunta ao cliente se ele tem um pintor vinculado.
2. Se não tiver pintor, a compra acontece normalmente na loja — fora do sistema de bônus.
3. Se tiver pintor, o admin pesquisa o cliente no sistema por **nome**, **telefone** ou **CPF**.
4. O sistema exibe os dados do cliente e lista todos os pintores vinculados, **ordenados pelo mais recente** (último que realizou um serviço para aquele cliente aparece primeiro).
5. Admin seleciona o pintor responsável por aquele pedido.
6. Admin monta o orçamento com os produtos do catálogo.
7. O pedido é associado ao pintor selecionado.
8. Quando o pagamento é confirmado, o bônus vai para o pintor responsável.

### Regra de múltiplos pintores por cliente

Um cliente pode estar vinculado a mais de um pintor ao longo do tempo. O bônus não é distribuído para todos — vai exclusivamente para o pintor responsável pela compra ou pedido específico.

Se o Pintor A criou o orçamento, é o Pintor A que recebe o bônus. Se em outra ocasião o Pintor B for o responsável, é o Pintor B que recebe.

### Troca de pintor responsável

Pode acontecer de o pintor vinculado a um serviço não estar disponível. Nesse caso, a administração pode repassar o serviço para outro pintor. O novo pintor fica vinculado àquele pedido específico e é ele quem recebe o bônus quando o pagamento for aprovado.

---

## 5. Produtos: dois módulos separados

**Regra: estoque da loja e lojinha de pontos são módulos distintos e não devem ser confundidos.**

### 5A. Estoque da loja (para orçamentos)

Representa os produtos vendidos normalmente pela loja. É o catálogo que o pintor usa quando cria um orçamento.

O estoque é sincronizado via API com o sistema de gestão que a loja já utiliza. Quando o pintor busca um produto no app, o sistema consulta esse catálogo e exibe:
- Nome do produto.
- Preço de venda praticado pela loja.
- Disponibilidade em estoque (se a API fornecer).

Isso garante que os orçamentos usem preços reais, sem digitação manual.

### 5B. Lojinha de pontos (para resgates)

Representa os itens que o pintor pode trocar pelos pontos acumulados. É gerenciada exclusivamente pela administração e não tem relação direta com o estoque de vendas da loja.

Pode incluir produtos, brindes, benefícios ou descontos definidos pela administração.

**Controle de estoque:** cada item da lojinha tem uma quantidade disponível definida pelo admin. Quando o estoque de um item zera, ele não pode mais ser resgatado. Todos os resgates são realizados presencialmente na loja.

**Fluxo de resgate:**
1. Pintor seleciona o produto e confirma — pontos e estoque são deduzidos automaticamente.
2. Resgate fica com status **pendente de retirada** no painel admin.
3. Pintor vai à loja e retira o produto presencialmente.
4. Admin marca o resgate como **entregue**.
5. Cancelamento: pintor pode cancelar antes da retirada — pontos e estoque são devolvidos automaticamente.

**Regra de conversão:** o custo de um item na lojinha é calculado pelo valor do produto multiplicado por um fator (multiplicador) definido pela administração.

> **Nota:** o multiplicador padrão inicial é **3x** — esse é o valor de referência acordado no momento para estruturar e testar a lógica da lojinha. Ele **não é uma regra final definitiva** e será revisado antes do lançamento. O multiplicador final pode ser 3x, 2x, maior ou outra lógica, conforme decisão da loja.

Exemplo com multiplicador de referência 3x:
- Item vale R$ 100 → custa 300 pontos na lojinha.
- Item vale R$ 50 → custa 150 pontos na lojinha.

**Promoções:** a administração pode reduzir o multiplicador de um item individualmente para criar uma promoção temporária.

Exemplo:
- Multiplicador padrão: 3x → item custa 300 pontos.
- Multiplicador promocional: 2,5x → item passa a custar 250 pontos e aparece como promoção na lojinha.

---

## 6. Cadastros do sistema

### Pintor
- Nome completo
- Telefone
- CPF/CNPJ (opcional)
- Login e senha
- Status (ativo/inativo)
- Saldo de bônus atual
- Histórico de pedidos, bônus e resgates

### Cliente
- Nome
- Telefone (identificador principal — chave de busca)
- Lista de pintores vinculados
- Histórico de pedidos e compras
- Observações internas

### Orçamento/Pedido
- Cliente
- Pintor responsável por esse pedido (**obrigatório** — todo orçamento no sistema tem um pintor vinculado)
- Produtos selecionados e quantidades
- Valor estimado
- Status (pendente / pendente de pagamento / aprovado / recusado / cancelado)
- Data de criação

### Compra confirmada
- Pedido de origem (se houver)
- Cliente
- Pintor responsável (**sempre presente** — compras sem pintor não são registradas no sistema)
- Valor real confirmado
- Data
- Status do pagamento
- Bônus calculado (1% do valor bruto do orçamento de origem)
- Referência de nota fiscal (se necessário)

### Item da lojinha
- Nome do produto/benefício
- Valor base (em reais)
- Multiplicador de pontos
- Custo em pontos (calculado)
- Quantidade disponível em estoque
- Imagem (opcional)
- Categoria
- Status (ativo/inativo/promoção)

---

## 7. Área administrativa

A administração tem três blocos funcionais principais.

### Bloco 1 — Orçamentos e pedidos

A administração acompanha todos os orçamentos por um **painel de controle centralizado**. Quando um pintor cria um orçamento pelo app, esse orçamento aparece automaticamente no painel com todos os dados fornecidos. O admin não precisa buscar pedidos por telefone — o painel centraliza tudo.

**Status do pedido:**
- Pendente
- Pendente de pagamento
- Em análise / Aguardando confirmação
- Aprovado / Pago
- Recusado
- Cancelado

**Fluxo de confirmação de pagamento:**
O sistema não processa pagamento diretamente. O admin verifica, por meios externos à plataforma, se o pagamento foi confirmado. Se não confirmado, o orçamento permanece pendente. Se confirmado, o admin aprova o orçamento no painel — o pedido passa para status **Aprovado** e os pontos são liberados automaticamente para o pintor responsável.

**O que o admin faz:**
- Acompanhar todos os orçamentos no painel por status, pintor, cliente e data.
- Criar orçamentos diretamente na loja quando o cliente chega presencialmente.
- Pesquisar clientes por nome, telefone ou CPF para identificar vínculo com pintor.
- Revisar os detalhes de cada pedido (cliente, pintor, produtos, valor).
- Atualizar o status do pedido.
- Aprovar pagamento → libera o bônus automaticamente para o pintor.
- Recusar ou cancelar → nenhum bônus gerado.
- Reatribuir o pedido a outro pintor quando necessário.
- Cadastrar, editar e gerenciar pintores (área dedicada no painel admin).
- Pesquisar e vincular clientes a pintores.

**Gestão de pintores (exclusiva do admin):**
O cadastro de pintores é responsabilidade exclusiva da administração. Pintores não se auto-cadastram. O painel admin deve ter uma área dedicada com as funções de criar, editar, ativar e inativar pintores. Auto-cadastro pelo próprio pintor não será implementado nesta versão.

**Estoque geral da loja (via integração):**
O gerenciamento do estoque geral dos produtos da loja — usado nos orçamentos — é sincronizado automaticamente via API com o sistema de gestão externo já utilizado pela loja. O painel admin consome/espelha esses dados. O admin não cadastra produtos do estoque da loja manualmente. Estoque da loja e lojinha de pontos continuam sendo módulos completamente distintos.

### Bloco 2 — Gestão de pontos

A administração tem controle total sobre os pontos de cada pintor.

**O que o admin controla:**
- Saldo atual de cada pintor.
- Histórico completo de bônus gerados, aprovados e estornados.
- Adição manual de bônus com justificativa.
- Estorno de bônus com motivo registrado.
- Exportação de relatórios.

A dedução de pontos por resgate é automática no momento da solicitação — o admin não precisa fazer baixa manual de pontos. O admin registra apenas a entrega física do produto (marcar resgate como entregue).

Toda alteração de saldo registra: quem fez, quando fez, valor alterado e motivo.

### Bloco 3 — Lojinha de pontos

A administração gerencia os itens disponíveis para resgate.

**O que o admin controla:**
- Cadastrar produtos, brindes ou benefícios na lojinha.
- Definir valor base e multiplicador de pontos de cada item.
- Ajustar multiplicador individualmente para criar promoções.
- Marcar itens como promocionais.
- Ativar ou inativar itens.
- Gerenciar resgates: visualizar lista de resgates pendentes de retirada e confirmar a entrega quando o pintor comparece à loja.

### Configurações gerais
- Percentual padrão de bônus (**atualmente 1%** — valor acordado no momento, revisável).
- Multiplicador padrão da lojinha (**valor de referência inicial: 3x** — não é regra final, será confirmado antes do lançamento).
- Pontos **não expiram** — nenhuma lógica de validade será implementada nesta versão.
- Usuários e permissões de acesso ao admin.
- Auditoria de alterações.

---

## 8. Integração com o sistema externo

O catálogo de produtos usado nos orçamentos virá do sistema de gestão que a loja já utiliza, via integração de API.

**O que a integração precisa fornecer:**
- Catálogo de produtos com nome, código e preço de venda.
- Disponibilidade em estoque (se disponível na API).
- Atualizações de preço e estoque — a sincronização tende a ser em tempo real, espelhando o sistema externo no app.

O sistema externo da loja ainda precisa ser identificado para definir o formato e os limites dessa integração.

---

## 9. Funcionamento offline

O app é uma PWA e suporta funcionamento offline nativamente via Service Workers e Cache API.

**Regra:** o pintor não pode ser bloqueado por falta de sinal. O app sempre permitirá montar orçamentos offline, com sincronização posterior.

**O que está definido:**
- O app mantém cache local da tabela de produtos e preços.
- O pintor consegue montar orçamentos offline usando os dados em cache.
- Quando a internet voltar, o orçamento é sincronizado com o sistema.

**Limitação conhecida e aceita:**
Se a loja atualizar um preço no mesmo dia, o cache pode estar desatualizado. Essa divergência é inevitável e não tem como ser controlada — é uma consequência natural do funcionamento offline. A loja está ciente disso.

**Detalhe a definir na fase de integração:**
O comportamento exato (se preços individuais ficam pendentes de validação ou se o orçamento inteiro fica pendente como bloco) depende do que a API do sistema externo da loja permitir. Será decidido durante a implementação da integração.

---

## 10. QR Code

O QR Code funciona apenas como atalho de acesso ao sistema — não gera pontos e não é usado como prova de compra.

**Uso recomendado:**
- QR Code fixo na parede ou balcão da loja.
- QR Code em materiais impressos.
- Link direto para o login do pintor.

---

## 11. Resumo estrutural

```
PINTOR (campo)
  ↓ cria orçamento com produtos reais do catálogo da loja
  ↓ app envia pedido para o admin como "pendente"

ADMIN (loja)
  ↓ cria orçamento presencialmente quando cliente chega na loja
  ↓ monitora todos os pedidos por status
  ↓ confirma pagamento → libera bônus automaticamente

SISTEMA
  ↓ credita 1% do valor bruto do orçamento ao pintor responsável
  ↓ pintor consulta saldo e resgata itens da lojinha

LOJINHA (resgate)
  ↓ pintor seleciona produto → pontos e estoque deduzidos automaticamente
  ↓ resgate fica pendente de retirada → admin confirma entrega na loja

INTEGRAÇÃO
  ↓ catálogo do sistema externo da loja → usado nos orçamentos (pintor e admin)
```
