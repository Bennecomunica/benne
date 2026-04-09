const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// API endpoint that receives form data and runs Claude Code
app.post('/api/diagnostico', async (req, res) => {
  const { diretor, escola, instagram, images } = req.body;

  if (!diretor || !escola || !instagram) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  // Build the prompt
  const prompt = `
# Diagnóstico Instagram — Carta de Diagnóstico Benne

Você é um analista de marketing digital especializado em Instagram para escolas.
Você está rodando em modo automatizado (não-interativo). NÃO peça confirmação, aprovação ou revisão em nenhum momento. Execute tudo automaticamente até o fim.

## Dados do formulário
- **Diretor(a):** ${diretor}
- **Escola:** ${escola}
- **Instagram:** ${instagram}

## Instruções

### Etapa 1 — Visitar e coletar dados reais do perfil
- Acesse ${instagram}
- Colete TODOS os dados visíveis: nome do perfil, bio completa, número de seguidores, seguindo, publicações
- Leia o texto da bio palavra por palavra
- Conte quantos destaques existem e quais são os nomes
- Veja os últimos 9-12 posts: tipos (reels, carrossel, imagem única), data aproximada, curtidas, comentários

### Etapa 2 — Análise estratégica REAL de marketing (NÃO REPLIQUE, ANALISE)
ATENÇÃO: Você NÃO está resumindo o que viu. Você está AVALIANDO como um consultor de marketing escolar.

Para cada item abaixo, dê um PARECER ESTRATÉGICO baseado nos dados reais coletados:

**PONTOS POSITIVOS — Analise de verdade o que a escola faz bem:**
- A bio comunica claramente a proposta de valor? Tem CTA? Tem link funcional?
- Os destaques estão organizados e fazem sentido para captação de alunos?
- A frequência de postagem é consistente?
- O tipo de conteúdo gera engajamento real (curtidas + comentários vs seguidores)?
- Há diversidade de formatos (reels, carrossel, stories)?
- O visual é profissional e coerente?
- Há conteúdo que gera prova social (depoimentos, eventos, conquistas)?

Só liste como "ponto positivo" o que REALMENTE for bom. Se a escola tem poucos seguidores mas posta com consistência, o ponto positivo é a consistência, não os seguidores.

**PONTOS DE MELHORIA — Seja específico e prático:**
Para cada problema encontrado, dê:
1. O que está errado (com dados concretos)
2. Por que isso prejudica a escola
3. O que fazer para corrigir (ação prática)

Exemplos de problemas reais para avaliar:
- @username longo ou difícil de encontrar → sugerir alternativa
- Bio sem CTA ou sem link → sugerir texto novo
- Link da bio quebrado ou sem agregador → sugerir Linktree
- Destaques desorganizados, com capas inconsistentes ou duplicados → sugerir reorganização
- Posts com baixo engajamento → analisar por quê (horário? formato? legenda?)
- Falta de reels (formato que mais alcança no Instagram) → sugerir frequência
- Sem conteúdo de bastidores/humanização → explicar importância
- Sem conteúdo focado em conversão (matrículas, visitas) → sugerir tipos de posts

NÃO invente problemas que não existem. NÃO elogie o que não merece elogio. Seja honesto e útil.

### Etapa 3 — Montar os textos da Carta (COM LIMITES DE CARACTERES)
IMPORTANTE: Agora transforme a análise estratégica da Etapa 2 em textos que cabem no layout do Canva. Cada texto DEVE respeitar o limite de caracteres indicado. Conte os caracteres antes de inserir.

**Campo 1 — "O que a escola faz bem:" (4 itens, cada um com no máximo 80 caracteres)**
Baseie-se APENAS nos pontos positivos REAIS que você identificou na Etapa 2.
Cada item deve ser um fato concreto observado, não um elogio genérico.
Exemplo de formato e tamanho:
- "Conta verificada no Instagram (✓ blue check);" (47 chars)
- "Bio clara com 35 anos de história e diferenciais bem descritos;" (64 chars)
- "7 destaques organizados — incluindo Tour Virtual, diferencial competitivo;" (75 chars)
- "390 posts com consistência de conteúdo." (40 chars)

**Campo 2 — "4 ajustes práticos para melhorar hoje o perfil da escola:" (4 itens)**
Baseie-se APENAS nos problemas REAIS que você identificou na Etapa 2.
Cada ajuste deve ser uma recomendação específica e acionável, com dados reais.
NÃO use recomendações genéricas como "melhore o engajamento". Diga EXATAMENTE o que mudar.
Cada ajuste deve ter:
- Título curto descrevendo o problema (máximo 60 caracteres)
- Sugestão concreta de como resolver (máximo 150 caracteres)
Formato: "1: [Título]\\nSugestão: [detalhe]"

**Campo 3 — "Resumo das Prioridades" (máximo 380 caracteres)**
Um parágrafo que resume os achados mais importantes e as 3 ações prioritárias.
Comece com o nome da escola e dados reais (seguidores, posts). Termine com as ações.
NÃO seja genérico. Use números e fatos da análise.

### Etapa 4 — Duplicar e editar o template no Canva
IMPORTANTE: Siga estes passos EXATAMENTE nesta ordem:

**Passo 4.1 — DUPLICAR o template original**
O template original tem o design ID: DAHDltnE2KY
Você DEVE criar uma cópia antes de editar. NÃO edite o original.
Para duplicar, use a ferramenta de criação de design a partir do template, ou copie o design.

**Passo 4.2 — Abrir a cópia para edição**
Use start-editing-transaction no design DUPLICADO (não no original DAHDltnE2KY).

**Passo 4.3 — Ler o conteúdo atual**
Antes de substituir qualquer texto, LEIA o conteúdo atual de cada elemento do design para identificar os campos verdes (textos dinâmicos) e contar seus caracteres exatos.

**Passo 4.4 — Substituir os textos verdes**
Use perform-editing-operations para substituir APENAS os textos dinâmicos (verdes):
- Substitua "[Nome do Colégio]" ou "Ol [Nome do Colégio]" por "Olá ${escola}"
- Substitua os itens de "O que a escola faz bem:" pelos pontos fortes gerados
- Substitua os "4 ajustes práticos" pelas recomendações geradas
- Na página 2, substitua o parágrafo após "Resumo das Prioridades" pelo resumo gerado
- Substitua "O Primeiro Mundo - Sorocaba" por "${escola}" no resumo

REGRA DE OURO: O texto substituto deve ter o MESMO número de caracteres (±5%) do texto original. Ajuste a redação para caber.

**Passo 4.5 — Inserir as imagens (se disponíveis)**
Se imagens foram enviadas no formulário, faça upload e insira nas 3 áreas de foto:
- Foto 1: Bio
- Foto 2: Destaques
- Foto 3: Alunos

**Passo 4.6 — Salvar**
Use commit-editing-transaction para salvar as alterações.

IMPORTANTE: NÃO use generate-design, generate-design-structured ou request-outline-review. Use APENAS start-editing-transaction + perform-editing-operations + commit-editing-transaction.

### RESPOSTA FINAL OBRIGATÓRIA
Depois de editar o design no Canva, sua ÚLTIMA mensagem deve ser SOMENTE este JSON (sem markdown, sem crases, sem texto extra):
{"escola":"${escola}","diretor":"${diretor}","canva_url":"URL_DO_DESIGN","edit_url":"URL_DE_EDICAO","nota":0,"resumo":"resumo aqui"}
`;

  console.log(`\n📥 Novo diagnóstico: ${escola} (${diretor})`);
  console.log(`   Instagram: ${instagram}`);
  console.log(`🚀 Executando Claude Code...`);

  // Send initial SSE headers for streaming progress
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  sendEvent('status', { message: 'Iniciando análise...' });

  try {
    const claude = spawn('claude', ['--print', '--dangerously-skip-permissions'], {
      shell: true,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Write prompt directly to stdin and close it
    claude.stdin.write(prompt);
    claude.stdin.end();

    let output = '';

    claude.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      console.log(`   ${text.trim()}`);

      // Update status based on output
      const lower = text.toLowerCase();
      if (lower.includes('instagram') || lower.includes('perfil'))
        sendEvent('status', { message: 'Visitando perfil no Instagram...' });
      if (lower.includes('colet') || lower.includes('seguidor'))
        sendEvent('status', { message: 'Coletando dados e seguidores...' });
      if (lower.includes('anali') || lower.includes('print'))
        sendEvent('status', { message: 'Analisando perfil...' });
      if (lower.includes('mont') || lower.includes('recomend'))
        sendEvent('status', { message: 'Montando análise e recomendações...' });
      if (lower.includes('canva') || lower.includes('design'))
        sendEvent('status', { message: 'Criando documento no Canva...' });
    });

    claude.stderr.on('data', (chunk) => {
      console.error(`   ERRO: ${chunk.toString().trim()}`);
    });

    claude.on('close', (code) => {
      console.log(`\n   Claude finalizado (código: ${code})`);

      // Try to extract JSON from output
      try {
        // Find JSON in the output
        const jsonMatch = output.match(/\{[\s\S]*"escola"[\s\S]*"canva_url"[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log(`✅ Diagnóstico de ${result.escola} concluído!`);
          sendEvent('done', { result });
        } else {
          console.log(`⚠️ JSON não encontrado na saída. Retornando análise como texto.`);
          sendEvent('done', {
            result: {
              escola,
              diretor,
              canva_url: null,
              edit_url: null,
              nota: null,
              resumo: output.substring(0, 500)
            }
          });
        }
      } catch (e) {
        console.error(`❌ Erro ao processar resultado: ${e.message}`);
        sendEvent('error', { message: 'Erro ao processar resultado do Claude.' });
      }

      res.end();
    });

    claude.on('error', (err) => {
      console.error(`❌ Erro ao executar Claude: ${err.message}`);
      sendEvent('error', { message: `Erro ao executar Claude: ${err.message}` });
      res.end();
    });

  } catch (err) {
    console.error(`❌ Erro: ${err.message}`);
    sendEvent('error', { message: err.message });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║   🟠  Benne — Diagnóstico Instagram      ║');
  console.log('  ║                                           ║');
  console.log(`  ║   Abra no navegador:                      ║`);
  console.log(`  ║   👉 http://localhost:${PORT}                 ║`);
  console.log('  ║                                           ║');
  console.log('  ║   Ctrl+C para encerrar                    ║');
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log('');
});
