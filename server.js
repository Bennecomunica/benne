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

## Dados do formulário
- **Diretor(a):** ${diretor}
- **Escola:** ${escola}
- **Instagram:** ${instagram}

## Instruções

Execute as etapas abaixo e retorne o resultado APENAS como um JSON válido, sem texto adicional antes ou depois.

### Etapa 1 — Visitar o perfil no Instagram
- Acesse ${instagram}
- Colete: nome do perfil, bio, número de seguidores, número de publicações

### Etapa 2 — Analisar o perfil
- Analise os últimos posts do perfil
- Identifique: tipo de conteúdo predominante, engajamento estimado

### Etapa 3 — Montar análise e recomendações
Com base nos dados coletados, monte a Carta de Diagnóstico com:
1. Resumo do Perfil
2. Pontos Fortes (mínimo 3)
3. Pontos de Melhoria (mínimo 3)
4. Recomendações Práticas (mínimo 5)
5. Nota Geral de 0 a 10

### Etapa 4 — Criar documento no Canva
Use a integração MCP do Canva para criar o documento:
1. Gere um design no Canva com o conteúdo da Carta de Diagnóstico
2. Use o estilo visual da Benne: cor principal #e85d26 (laranja), fundo escuro #111
3. Inclua o nome da escola "${escola}" e do diretor(a) "${diretor}"
4. Obtenha o link de edição do design

### Resposta Final
Retorne SOMENTE um JSON neste formato (sem markdown, sem crases, apenas o JSON puro):
{
  "escola": "${escola}",
  "diretor": "${diretor}",
  "canva_url": "URL do design no Canva",
  "edit_url": "URL de edição do design no Canva",
  "nota": 7.5,
  "resumo": "Breve resumo do diagnóstico em 2-3 frases"
}
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
    // Write prompt to temp file to avoid shell escaping issues on Windows
    const tmpFile = path.join(__dirname, '_tmp_prompt.txt');
    fs.writeFileSync(tmpFile, prompt, 'utf-8');

    const claude = spawn('claude', ['--print', '--dangerously-skip-permissions'], {
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Pipe the prompt via stdin
    const promptStream = fs.createReadStream(tmpFile);
    promptStream.pipe(claude.stdin);

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
      // Clean up temp file
      try { fs.unlinkSync(tmpFile); } catch(e) {}
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
