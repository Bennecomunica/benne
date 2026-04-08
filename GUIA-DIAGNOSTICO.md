# Como Criar um Formulário de Diagnóstico Automatizado
## Guia interno Benne — Passo a passo para qualquer nicho

---

## O que é

Este guia ensina como criar um formulário web que gera diagnósticos automatizados usando Claude Code + Canva. O formulário coleta dados do cliente, analisa o perfil no Instagram e gera uma Carta de Diagnóstico personalizada no Canva.

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- **Node.js** → https://nodejs.org (versão LTS)
- **Git** → https://git-scm.com
- **Claude Code** → `npm install -g @anthropic-ai/claude-code`
- **Conta no Canva** com a integração MCP configurada

---

## Passo 1 — Definir o nicho e os dados do formulário

Antes de tudo, defina:

**1.1 — Qual é o nicho?**
Exemplos: escolas, clínicas, restaurantes, imobiliárias, academias, salões de beleza

**1.2 — Quais dados coletar no formulário?**
Adapte os campos ao nicho. Exemplos:

| Nicho | Campos do formulário |
|-------|---------------------|
| Escolas | Nome do Diretor, Nome da Escola, Link do Instagram |
| Clínicas | Nome do Médico, Nome da Clínica, Especialidade, Link do Instagram |
| Restaurantes | Nome do Proprietário, Nome do Restaurante, Tipo de Cozinha, Link do Instagram |
| Imobiliárias | Nome do Corretor, Nome da Imobiliária, Região de Atuação, Link do Instagram |
| Academias | Nome do Responsável, Nome da Academia, Modalidades, Link do Instagram |

**1.3 — Quais pontos analisar no diagnóstico?**
Defina os critérios de análise para o nicho:

| Nicho | O que analisar |
|-------|---------------|
| Escolas | Bio, destaques, frequência de posts, conteúdo sobre matrículas |
| Clínicas | Humanização do perfil, depoimentos, conteúdo educativo |
| Restaurantes | Fotos dos pratos, cardápio nos destaques, avaliações |
| Imobiliárias | Fotos dos imóveis, tours virtuais, depoimentos de clientes |
| Academias | Antes/depois, depoimentos, conteúdo motivacional |

---

## Passo 2 — Criar o template no Canva

**2.1 — Duplique o template base da Benne**
Abra o template de referência e duplique:
https://canva.link/qz66qvwr6l5nnzg

**2.2 — Adapte o template ao nicho**
- Troque "[Nome do Colégio]" pelo placeholder do nicho (ex: "[Nome da Clínica]")
- Adapte os textos de exemplo para o nicho
- Mantenha os textos dinâmicos (que serão substituídos) em **cor verde**
- Mantenha as mesmas áreas de foto se necessário

**2.3 — Anote o Design ID do novo template**
O Design ID está na URL do Canva:
`https://www.canva.com/design/SEU_DESIGN_ID/...`

**2.4 — Regra de ouro: contar os caracteres**
Para cada texto verde no template, conte os caracteres exatos. Os textos gerados pelo diagnóstico devem ter o mesmo tamanho (±5%) para não quebrar o layout.

---

## Passo 3 — Criar o projeto

### 3.1 — Crie uma pasta para o projeto

```
mkdir diagnostico-NICHO
cd diagnostico-NICHO
git init
```

### 3.2 — Crie o arquivo `package.json`

```json
{
  "name": "diagnostico-NICHO",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.0"
  }
}
```

### 3.3 — Instale as dependências

```
npm install
```

---

## Passo 4 — Criar o formulário (index.html)

Copie o formulário base e adapte os campos. Aqui está o prompt para pedir ao Claude criar o formulário:

### Prompt para gerar o index.html:

```
Crie um formulário HTML responsivo com o estilo visual da Benne (cor principal #e85d26, fundo #f4f4f4, fonte Inter).

O formulário deve coletar estes dados:
- [LISTE OS CAMPOS DO SEU NICHO]

Ao clicar em "Gerar Diagnóstico", o formulário deve:
1. Enviar os dados via POST para /api/diagnostico
2. Mostrar uma tela de processamento com etapas animadas
3. Receber o resultado via Server-Sent Events (SSE)
4. Mostrar a nota, resumo e link do Canva no resultado

Use este HTML como referência de estilo e estrutura:
[COLE O index.html DA BENNE AQUI]

Adapte os campos, textos e placeholders para o nicho: [SEU NICHO]
```

---

## Passo 5 — Criar o servidor (server.js)

O servidor recebe os dados do formulário e executa o Claude Code.

### Prompt para gerar o server.js:

```
Crie um servidor Express (server.js) que:

1. Serve o index.html na raiz
2. Tem um endpoint POST /api/diagnostico que:
   a. Recebe os dados do formulário: [LISTE OS CAMPOS]
   b. Monta um prompt para o Claude Code analisar o perfil do Instagram
   c. Executa: claude --print --dangerously-skip-permissions
   d. Envia o prompt via stdin
   e. Retorna o progresso via Server-Sent Events (SSE)
   f. Ao finalizar, extrai o JSON da saída e envia como evento "done"

Use esta estrutura de prompt para o Claude:
[VEJA O PASSO 6 ABAIXO]

Use este server.js como referência:
[COLE O server.js DA BENNE AQUI]
```

---

## Passo 6 — Montar o prompt do diagnóstico

Este é o coração do sistema. O prompt define o que o Claude vai fazer. Adapte ao seu nicho:

### Modelo de prompt (substitua os campos entre colchetes):

```
# Diagnóstico Instagram — [NOME DO SEU PRODUTO]

Você é um analista de marketing digital especializado em [NICHO].
Você está rodando em modo automatizado. NÃO peça confirmação em nenhum momento.

## Dados do formulário
- **[Campo 1]:** [valor]
- **[Campo 2]:** [valor]
- **Instagram:** [link]

## Instruções

### Etapa 1 — Visitar o perfil no Instagram
- Acesse o link do Instagram informado
- Colete: nome do perfil, bio, número de seguidores, número de publicações

### Etapa 2 — Analisar o perfil
- Analise os últimos posts
- Para [NICHO], observe especificamente:
  - [CRITÉRIO 1 DO NICHO]
  - [CRITÉRIO 2 DO NICHO]
  - [CRITÉRIO 3 DO NICHO]

### Etapa 3 — Montar análise (COM LIMITES DE CARACTERES)
IMPORTANTE: Respeitar os limites de caracteres para não quebrar o layout do Canva.

**Campo 1 — "O que o [TIPO DE NEGÓCIO] faz bem:" (4 itens, máx 80 chars cada)**
**Campo 2 — "4 ajustes práticos:" (4 itens, título 60 chars + detalhe 150 chars)**
**Campo 3 — "Resumo das Prioridades" (máx 380 chars)**

### Etapa 4 — Duplicar e editar o template no Canva
Template original: [SEU_DESIGN_ID]

1. DUPLICAR o template (nunca editar o original)
2. Abrir a cópia com start-editing-transaction
3. Ler o conteúdo atual para contar caracteres
4. Substituir APENAS os textos verdes com os dados gerados
5. Texto substituto deve ter o MESMO número de caracteres (±5%)
6. Salvar com commit-editing-transaction

### RESPOSTA FINAL
Retornar SOMENTE JSON:
{"empresa":"[nome]","responsavel":"[nome]","canva_url":"URL","edit_url":"URL","nota":0,"resumo":"resumo"}
```

---

## Passo 7 — Testar

```
npm start
```

Abra http://localhost:3000, preencha e teste.

---

## Passo 8 — Checklist antes de entregar

- [ ] Template do Canva duplicado e adaptado ao nicho
- [ ] Design ID anotado e inserido no prompt
- [ ] Campos do formulário correspondem aos dados necessários
- [ ] Limites de caracteres conferidos com o template
- [ ] Textos verdes no template marcados corretamente
- [ ] Teste completo: formulário → diagnóstico → Canva com layout correto
- [ ] Claude Code logado (`claude` → `/login`)

---

## Exemplos prontos por nicho

### Exemplo: Clínica Médica

**Campos:** Nome do Médico, Nome da Clínica, Especialidade, Instagram
**Critérios:** Humanização, conteúdo educativo, agendamento online, depoimentos
**Template Canva:** Duplicar o base e trocar "escola" por "clínica"

### Exemplo: Restaurante

**Campos:** Nome do Proprietário, Nome do Restaurante, Tipo de Cozinha, Instagram
**Critérios:** Qualidade das fotos, cardápio nos destaques, interação com clientes, delivery
**Template Canva:** Duplicar o base e trocar "escola" por "restaurante"

### Exemplo: Imobiliária

**Campos:** Nome do Corretor, Nome da Imobiliária, Região, Instagram
**Critérios:** Qualidade das fotos, tours virtuais, depoimentos, informações de contato
**Template Canva:** Duplicar o base e trocar "escola" por "imobiliária"

---

## Dúvidas frequentes

**P: Posso usar sem o Canva?**
R: Sim. O diagnóstico funciona e mostra nota + resumo no navegador. O Canva é opcional.

**P: Preciso deixar o computador ligado?**
R: Sim. O servidor roda localmente e precisa do Claude Code instalado.

**P: Como mudar a cor do tema?**
R: No index.html, troque todas as ocorrências de `#e85d26` pela cor desejada.

**P: Como adicionar mais campos?**
R: Adicione o input no index.html, inclua no body do fetch, e atualize o prompt no server.js.
