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

### Etapa 3 — Montar análise e recomendações
Monte a Carta de Diagnóstico com:
1. O que a escola faz bem (mínimo 3 pontos)
2. Ajustes práticos para melhorar o perfil (mínimo 4 pontos com sugestões concretas)
3. Resumo das Prioridades (parágrafo resumindo as ações mais importantes)

### Etapa 4 — Editar o template no Canva
IMPORTANTE: Você DEVE usar o template existente, NÃO crie um design do zero.

1. Use start-editing-transaction no design ID: DAHDltnE2KY
2. Substitua APENAS os textos em verde (os campos dinâmicos) com os dados do diagnóstico:
   - Substitua "[Nome do Colégio]" pelo nome da escola: "${escola}"
   - Substitua o bloco "O que a escola faz bem:" pelos pontos fortes encontrados
   - Substitua os "4 ajustes práticos" pelas recomendações geradas
   - Substitua o "Resumo das Prioridades" pelo resumo gerado
3. As 3 áreas de foto no template devem receber as imagens enviadas pelo formulário (se disponíveis):
   - Foto 1: Bio (print da bio do Instagram)
   - Foto 2: Destaques (print dos destaques)
   - Foto 3: Alunos (print do número de alunos)
4. Faça commit-editing-transaction para salvar
5. Obtenha o link de edição do design

IMPORTANTE: NÃO use generate-design, generate-design-structured ou request-outline-review. Use APENAS start-editing-transaction + perform-editing-operations + commit-editing-transaction no design DAHDltnE2KY.

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
