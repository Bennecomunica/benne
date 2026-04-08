# Prompt para Criar Formulário de Diagnóstico Instagram

Cole este prompt inteiro no Claude Code para gerar automaticamente um formulário de diagnóstico para o seu nicho.

---

## Como usar

1. Abra o Claude Code
2. Cole o prompt abaixo
3. Responda as perguntas que o Claude fizer sobre o seu nicho
4. Ele vai criar todos os arquivos automaticamente

---

## Prompt

```
Preciso que você crie um sistema completo de Diagnóstico de Instagram automatizado para o meu negócio. O sistema consiste em um formulário web que coleta dados, analisa o perfil no Instagram usando Claude Code, e gera uma Carta de Diagnóstico no Canva.

Antes de criar, me faça estas perguntas (uma de cada vez):

1. Qual é o nicho/segmento? (ex: escolas, clínicas, restaurantes, academias, salões)
2. Quais dados quer coletar no formulário? (ex: nome do responsável, nome da empresa, Instagram)
3. Quais critérios específicos quer analisar no Instagram desse nicho?
4. Qual o Design ID do template no Canva? (formato: DAHxxxxxxxx) — se não tiver, pule
5. Qual a cor principal da marca? (ex: #e85d26)

Depois de eu responder, crie TODOS os arquivos abaixo automaticamente:

### 1. package.json
Com Express como dependência e script "start": "node server.js"

### 2. index.html
Formulário responsivo com:
- Fonte Inter do Google Fonts
- Header escuro com logo
- Card com os campos definidos
- Botão "Gerar Diagnóstico" que envia para /api/diagnostico via POST
- Tela de processamento com etapas animadas (SSE)
- Tela de resultado com nota, resumo e link do Canva
- Sem seleção de pasta, sem upload de imagens
- Cor principal: a que eu informar

### 3. server.js
Servidor Express que:
- Serve o index.html
- Endpoint POST /api/diagnostico que:
  a. Recebe os campos do formulário
  b. Monta o prompt de diagnóstico adaptado ao nicho
  c. Executa: claude --print --dangerously-skip-permissions via spawn com shell:true
  d. Envia o prompt via stdin (claude.stdin.write + claude.stdin.end)
  e. Retorna progresso via Server-Sent Events
  f. Extrai JSON da saída do Claude e envia como evento "done"
  g. Se não encontrar JSON, retorna o texto como resumo

O prompt interno do diagnóstico deve:
- Instruir o Claude a visitar o Instagram e coletar dados
- Analisar com critérios específicos do nicho
- Montar: pontos fortes (4 itens, máx 80 chars cada), ajustes práticos (4 itens), resumo (máx 380 chars)
- Se tiver Design ID do Canva: duplicar o template, editar com start-editing-transaction, respeitar limite de caracteres ±5%, fazer commit
- Se não tiver Design ID: pular a etapa do Canva
- Retornar JSON final com: empresa, responsavel, canva_url, edit_url, nota, resumo
- NUNCA pedir confirmação ou aprovação (modo automatizado)

### Regras importantes:
- O formulário deve funcionar abrindo http://localhost:3000
- O usuário só precisa rodar: npm install && npm start
- Sem watcher, sem seleção de pasta, sem arquivo intermediário
- Tudo acontece via API no navegador
```

---

## Depois de criar

1. Rode `npm install` para instalar dependências
2. Rode `npm start` para iniciar
3. Abra http://localhost:3000
4. Preencha e teste

## Requisitos

- Node.js instalado (https://nodejs.org)
- Claude Code instalado (`npm install -g @anthropic-ai/claude-code`)
- Claude Code logado (rode `claude` e depois `/login`)
