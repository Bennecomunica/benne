#!/usr/bin/env bash
# ─── Benne Diagnóstico — Watcher ─────────────────────────────────────────────
# Monitora a pasta de outputs aguardando pending.json
# Uso: ./watcher.sh /caminho/para/pasta/outputs
# ──────────────────────────────────────────────────────────────────────────────

WATCH_DIR="${1:-.}"
INTERVAL=3
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPT_FILE="$SCRIPT_DIR/diagnostico-prompt.md"

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Erro: diagnostico-prompt.md não encontrado em $SCRIPT_DIR"
  exit 1
fi

echo "🔍 Monitorando pasta: $WATCH_DIR"
echo "   Intervalo: ${INTERVAL}s"
echo "   Prompt: $PROMPT_FILE"
echo "   Aguardando pending.json..."
echo ""

write_status() {
  local state="$1"
  local message="$2"
  cat > "$WATCH_DIR/status.json" <<STATUSEOF
{"state": "$state", "message": "$message"}
STATUSEOF
}

while true; do
  if [ -f "$WATCH_DIR/pending.json" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📥 pending.json detectado — $(date '+%H:%M:%S')"

    # Limpa resultados anteriores
    rm -f "$WATCH_DIR/result.json"

    # Atualiza status: visitando Instagram
    write_status "running" "Visitando perfil no Instagram..."

    # Monta o prompt em arquivo temporário
    TEMP_PROMPT="$WATCH_DIR/_prompt_tmp.md"
    {
      cat "$PROMPT_FILE"
      echo ""
      echo "## Dados do formulário (pending.json)"
      echo '```json'
      cat "$WATCH_DIR/pending.json"
      echo '```'
      echo ""
      echo "## Pasta de saída: $WATCH_DIR"
    } > "$TEMP_PROMPT"

    echo "🚀 Executando Claude Code..."

    # Executa o Claude Code passando o prompt via stdin
    cat "$TEMP_PROMPT" | claude --print 2>&1 | while IFS= read -r line; do
      echo "   $line"

      # Atualiza status baseado na saída do Claude
      case "$line" in
        *[Ii]nstagram*|*perfil*)
          write_status "running" "Visitando perfil no Instagram..." ;;
        *colet*|*seguidor*|*[Ff]ollower*)
          write_status "running" "Coletando dados e seguidores..." ;;
        *analis*|*print*|*imag*)
          write_status "running" "Analisando prints enviados..." ;;
        *mont*|*anál*|*texto*|*recomend*)
          write_status "running" "Montando análise e recomendações..." ;;
        *[Cc]anva*|*document*|*design*)
          write_status "running" "Criando documento no Canva..." ;;
      esac
    done

    # Verifica se o result.json foi criado pelo Claude
    if [ -f "$WATCH_DIR/result.json" ]; then
      write_status "done" "Diagnóstico concluído!"
      echo "✅ Diagnóstico finalizado com sucesso!"
    else
      write_status "error" "Claude não gerou o result.json. Verifique os logs."
      echo "❌ Erro: result.json não foi gerado"
    fi

    # Remove arquivos temporários
    rm -f "$WATCH_DIR/pending.json" "$WATCH_DIR/_prompt_tmp.md"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔍 Aguardando próximo pending.json..."
  fi

  sleep "$INTERVAL"
done
