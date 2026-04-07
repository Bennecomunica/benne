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

### Etapa 1 — Visitar o perfil no Instagram
- Acesse ${instagram}
- Colete: nome do perfil, bio, número de seguidores, número de publicações

### Etapa 2 — Analisar o perfil
- Analise os últimos posts do perfil
- Identifique: tipo de conteúdo predominante, engajamento estimado

### Etapa 3 — Montar análise e recomendações (COM LIMITES DE CARACTERES)
IMPORTANTE: Cada texto gerado DEVE respeitar o limite exato de caracteres indicado abaixo. Isso é fundamental para não quebrar o layout do Canva. Conte os caracteres antes de inserir. Se necessário, resuma ou expanda para caber exatamente.

Monte a Carta de Diagnóstico com:

**Campo 1 — "O que a escola faz bem:" (4 itens, cada um com no máximo 80 caracteres)**
Exemplo de formato:
- "Conta verificada no Instagram (✓ blue check);" (47 chars)
- "Bio clara com 35 anos de história e diferenciais bem descritos;" (64 chars)
- "7 destaques organizados — incluindo Tour Virtual, diferencial competitivo;" (75 chars)
- "390 posts com consistência de conteúdo." (40 chars)

**Campo 2 — "4 ajustes práticos para melhorar hoje o perfil da escola:" (4 itens)**
Cada ajuste deve ter:
- Título curto (máximo 60 caracteres)
- Sugestão/detalhe (máximo 150 caracteres)
Formato: "1: [Título]\\nSugestão: [detalhe]"

**Campo 3 — "Resumo das Prioridades" (máximo 380 caracteres)**
Um parágrafo único resumindo os pontos principais e as ações prioritárias.

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
