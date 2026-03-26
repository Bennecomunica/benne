import { useState, useRef } from "react";

const LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAA6YAAAFvCAYAAABZ+ta+AAEAAElEQVR4nOz9Z5hl13mYib5rrR1OqtDVuRuNnDMRCIAgQASCRCSYBIkWKSomUYqSSWWUkpJlWZZlWbJkWZZl2bIs27JkS7IsS5ZkWZYl27Is27Js27Js27Js27Is27Js27Jsy7Is27Jsy7Js27Js27Jsy7Js27Jsy7Js27Js27Js27Jsy7Ls27Ls27Js27Js27Ls27Js27Ls27Js27Js27Ls27Ls27Js27Ls27Ls27Js27Js27Js27Js27Js27Js";

const sessionTypes = [
  { value: "tecnologia", label: "💻 Tecnologia & Inovação", desc: "Projetos digitais e tecnológicos" },
  { value: "criatividade", label: "✨ Criatividade & Inovação", desc: "Design thinking e novidades" },
  { value: "artes", label: "🎨 Projetos Artísticos", desc: "Expressão cultural e artística" },
  { value: "familias", label: "👨‍👩‍👧 Interação com Famílias", desc: "Engajamento e pertencimento" },
  { value: "sustentabilidade", label: "🌱 Sustentabilidade", desc: "Meio ambiente e consciência" },
  { value: "socioemocional", label: "💙 Socioemocional", desc: "Inteligência emocional e SEL" },
  { value: "protagonismo", label: "🏆 Protagonismo do Aluno", desc: "Autonomia e liderança" },
  { value: "comunidade", label: "🤝 Impacto Comunitário", desc: "Transformação social" },
];

const segments = [
  "Educação Infantil",
  "Ensino Fundamental I (1º–5º ano)",
  "Ensino Fundamental II (6º–9º ano)",
  "Ensino Médio",
  "Fundamental I + II",
  "Educação Básica Completa",
];

const pedagogies = [
  "Montessori","Waldorf","Construtivista","Tradicional","Bilíngue",
  "STEM / STEAM","Socioconstrutivismo","Híbrido / Inovador","Outro",
];

const profiles = [
  "Particular – Acessível","Particular – Média","Particular – Premium","Internacional",
];

const priorityColors = {
  "Alta":  { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  "Média": { bg: "#E0F2FE", text: "#0369A1", border: "#BAE6FD" },
  "Baixa": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
};

const effortMap = { "Baixo": 1, "Médio": 2, "Alto": 3 };

export default function EduGenius() {
  const [form, setForm] = useState({
    schoolName: "", annualTheme: "", segment: "", pedagogy: "", pedagogyOther: "",
    profile: "", annualGoal: "", differential: "", sessionType: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep]     = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");
  const resultsRef = useRef(null);

  const stepLabels = [
    "Lendo a identidade e diferenciais da escola",
    "Compreendendo metas e contexto pedagógico",
    "Consultando tendências educacionais",
    "Aplicando psicologia do desenvolvimento",
    "Gerando projetos contextualizados",
  ];

  const getSessionLabel = (v) =>
    sessionTypes.find(s => s.value === v)?.label?.replace(/^[^\s]+\s/, "") || v;

  const buildPrompt = () => {
    const ped = form.pedagogy === "Outro" ? form.pedagogyOther || "Outra proposta" : form.pedagogy;
    return `Você é especialista em gestão escolar, pedagogia inovadora, psicologia do desenvolvimento, branding educacional e experiência do cliente (CX).
CONTEXTO DA ESCOLA:
- Nome: ${form.schoolName}
- Tema/Lema Anual: ${form.annualTheme}
- Segmento: ${form.segment}
- Proposta Pedagógica: ${ped}
- Perfil: ${form.profile}
- Meta Anual: ${form.annualGoal}
- Principal Diferencial: ${form.differential}
- Tipo de Projetos: ${getSessionLabel(form.sessionType)}
Gere análise contextual e 6 projetos pedagógicos ESPECÍFICOS e PERSONALIZADOS para esta escola real.
Responda APENAS em JSON válido, sem texto antes ou depois, sem backticks:
{
  "understanding": "Parágrafo rico de 3-4 frases mostrando análise profunda do contexto desta escola específica — conectando proposta pedagógica, diferencial, metas e tema anual. Demonstre que entende a identidade única desta instituição. Use conceitos pedagógicos, psicológicos e de branding.",
  "analysisInsights": ["insight específico sobre posicionamento desta escola", "insight sobre perfil de famílias desta escola", "insight sobre tendência relevante para este contexto"],
  "ideas": [
    {
      "title": "Nome criativo e específico para ESTA escola",
      "description": "2-3 frases explicando o projeto e por que faz sentido ESPECIFICAMENTE para ${form.schoolName} com o tema '${form.annualTheme}'. Inclua referencial pedagógico/psicológico.",
      "priority": "Alta",
      "effort": "Médio",
      "impactLevel": "Transformador",
      "goalAlignment": 85,
      "differentialAlignment": 90,
      "tags": ["tag1", "tag2", "tag3"],
      "theoreticalBasis": "Referencial teórico específico"
    }
  ]
}
REGRAS:
- goalAlignment: 0-100, alinhamento com a meta anual
- differentialAlignment: 0-100, coerência com o diferencial
- Cada ideia DEVE mencionar o nome da escola e conectar ao tema "${form.annualTheme}"
- Varie prioridades e esforços
- Use referenciais reais: Vygotsky, Piaget, Gardner, Bronfenbrenner, BNCC, etc.
- Incorpore conceitos de CX e branding educacional
- Projetos devem ser do tipo: ${getSessionLabel(form.sessionType)}`;
  };

  const generate = async () => {
    if (!form.schoolName || !form.segment || !form.sessionType || !form.annualGoal) {
      setError("Preencha pelo menos: Nome da escola, Segmento, Meta anual e Tipo de sessão.");
      return;
    }
    setError(""); setLoading(true); setResult(null); setStep(0);

    let s = 0;
    const interval = setInterval(() => {
      s++;
      setStep(s);
      if (s >= 5) clearInterval(interval);
    }, 900);

    try {
      // Calls our own API route — the key stays safe on the server
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4000,
          messages: [{ role: "user", content: buildPrompt() }],
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const text = data.content?.find(c => c.type === "text")?.text || "";
      const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(clean);

      clearInterval(interval);
      setStep(5);
      await new Promise(r => setTimeout(r, 500));
      setResult(parsed);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      clearInterval(interval);
      setError(`Erro ao conectar com a API: ${e.message}. Verifique sua conexão.`);
    } finally {
      setLoading(false);
    }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FDFAF5", minHeight: "100vh", color: "#2A1F14" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #F5ECD9, #FAF6F0)", border: "1px solid rgba(139,100,52,0.25)", borderRadius: 100, padding: "6px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8B6434", marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, background: "#C49A3C", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            IA Pedagógica
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 700, color: "#342513", marginBottom: 12, lineHeight: 1.15 }}>
            Brainstorming <em style={{ fontStyle: "italic", color: "#B8894A" }}>Inteligente</em><br />para sua Escola
          </h1>
          <p style={{ color: "#6B5744", fontSize: 15, fontWeight: 300, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Projetos pedagógicos gerados com base no contexto real da sua instituição — não templates genéricos.
          </p>
        </div>

        {/* Form Card */}
        <div style={{ background: "#fff", border: "1px solid rgba(139,100,52,0.25)", borderRadius: 20, padding: "36px 36px", marginBottom: 32, boxShadow: "0 4px 40px rgba(139,100,52,0.06)" }}>
          <SectionTitle>Identidade da Escola</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <Field label="Nome da Escola *" placeholder="ex: Colégio Montessori São Paulo" value={form.schoolName} onChange={v => f("schoolName", v)} />
            <Field label="Tema / Lema Anual" placeholder="ex: Somos o Futuro que Queremos" value={form.annualTheme} onChange={v => f("annualTheme", v)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 18 }}>
            <SelectField label="Segmento Escolar *" value={form.segment} onChange={v => f("segment", v)} options={segments} />
            <div>
              <SelectField label="Proposta Pedagógica" value={form.pedagogy} onChange={v => f("pedagogy", v)} options={pedagogies} />
              {form.pedagogy === "Outro" && (
                <input type="text" placeholder="Descreva a proposta..." value={form.pedagogyOther} onChange={e => f("pedagogyOther", e.target.value)}
                  style={{ marginTop: 8, width: "100%", padding: "10px 14px", background: "#FAF6F0", border: "1.5px solid rgba(139,100,52,0.25)", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              )}
            </div>
            <SelectField label="Perfil" value={form.profile} onChange={v => f("profile", v)} options={profiles} />
          </div>

          <div style={{ height: 1, background: "rgba(139,100,52,0.1)", margin: "24px 0" }} />
          <SectionTitle>Objetivos e Diferenciais</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>
            <TextareaField label="Meta Anual da Escola *" placeholder="ex: Aumentar engajamento das famílias em 40%, reduzir evasão em 15%..." value={form.annualGoal} onChange={v => f("annualGoal", v)} />
            <TextareaField label="Principal Diferencial da Escola" placeholder="ex: Formação humana integral, foco em inteligência emocional..." value={form.differential} onChange={v => f("differential", v)} />
          </div>

          <div style={{ height: 1, background: "rgba(139,100,52,0.1)", margin: "0 0 24px" }} />
          <SectionTitle>Tipo de Sessão de Brainstorming *</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 28 }}>
            {sessionTypes.map(s => (
              <button key={s.value} onClick={() => f("sessionType", s.value)}
                style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: form.sessionType === s.value ? "linear-gradient(135deg, #F5ECD9, #FAF6F0)" : "#FAF6F0", border: `1.5px solid ${form.sessionType === s.value ? "#B8894A" : "rgba(139,100,52,0.2)"}`, borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                <span style={{ fontSize: 18 }}>{s.label.split(" ")[0]}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: form.sessionType === s.value ? "#4E371C" : "#6B5744" }}>{s.label.replace(/^[^\s]+\s/, "")}</div>
                  <div style={{ fontSize: 11, color: "#9C836E", marginTop: 2 }}>{s.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#92400E", marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={generate} disabled={loading}
            style={{ width: "100%", padding: "18px 32px", background: loading ? "#B8894A" : "linear-gradient(135deg, #6B4D27 0%, #8B6434 50%, #B8894A 100%)", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "inherit", transition: "all 0.3s" }}>
            {loading ? "⏳ Gerando com IA..." : "✦ Gerar 6 Projetos Pedagógicos com IA"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px 32px", background: "#fff", borderRadius: 20, border: "1px solid rgba(139,100,52,0.2)" }}>
            <div style={{ width: 56, height: 56, margin: "0 auto 20px", border: "2px solid #E8D5B7", borderTop: "2px solid #B8894A", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#6B4D27", fontStyle: "italic", marginBottom: 24 }}>
              Analisando o contexto da sua escola...
            </p>
            <div style={{ maxWidth: 360, margin: "0 auto" }}>
              {stepLabels.map((label, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(139,100,52,0.1)", fontSize: 13, color: step > i ? (step === i + 1 ? "#6B4D27" : "#9C836E") : "#C4A882" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: step > i ? (step === i + 1 ? "#B8894A" : "#22C55E") : "#E8D5B7", flexShrink: 0, transition: "all 0.4s" }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultsRef}>
            {/* Understanding */}
            <div style={{ background: "linear-gradient(135deg, #342513 0%, #4E371C 100%)", borderRadius: 20, padding: "32px 36px", marginBottom: 28, color: "#fff", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "radial-gradient(circle, rgba(196,154,60,0.12) 0%, transparent 70%)" }} />
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 100, padding: "4px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F0D98B", marginBottom: 14 }}>
                ✦ Análise Contextual da IA
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.9)", fontWeight: 300, margin: "0 0 18px" }}>{result.understanding}</p>
              {result.analysisInsights && (
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  {result.analysisInsights.map((ins, i) => <span key={i}>◆ {ins}</span>)}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#342513", margin: 0 }}>Projetos Pedagógicos Gerados</h2>
              <span style={{ background: "#F5ECD9", color: "#6B4D27", fontSize: 12, padding: "4px 12px", borderRadius: 100 }}>{result.ideas?.length || 0} ideias contextualizadas</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {result.ideas?.map((idea, i) => {
                const pc = priorityColors[idea.priority] || priorityColors["Média"];
                const ef = effortMap[idea.effort] || 2;
                return (
                  <div key={i} style={{ background: "#fff", border: "1px solid rgba(139,100,52,0.2)", borderRadius: 18, padding: 26, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 2px 20px rgba(139,100,52,0.05)", transition: "all 0.3s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#FAF6F0", border: "1px solid rgba(139,100,52,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#8B6434", flexShrink: 0 }}>{i + 1}</div>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#342513", margin: 0, lineHeight: 1.3 }}>{idea.title}</h3>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: pc.bg, color: pc.text, border: `1px solid ${pc.border}`, whiteSpace: "nowrap", flexShrink: 0 }}>{idea.priority}</span>
                    </div>

                    <p style={{ fontSize: 13, color: "#6B5744", lineHeight: 1.65, fontWeight: 300, margin: 0 }}>{idea.description}</p>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: "#9C836E", textTransform: "uppercase", letterSpacing: "0.06em" }}>Esforço</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[1, 2, 3].map(n => <div key={n} style={{ width: 8, height: 8, borderRadius: "50%", background: n <= ef ? "#B8894A" : "#E8D5B7" }} />)}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#8B6434" }}>{idea.effort}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "#FAF6F0", color: "#6B4D27", fontWeight: 600 }}>{idea.impactLevel}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <Bar label="Alinhamento com a Meta Anual" value={idea.goalAlignment} color="linear-gradient(90deg, #D4B483, #B8894A)" />
                      <Bar label="Coerência com o Diferencial" value={idea.differentialAlignment} color="linear-gradient(90deg, #F0D98B, #C49A3C)" />
                    </div>

                    {idea.theoreticalBasis && (
                      <div style={{ fontSize: 11, color: "#9C836E", padding: "8px 12px", background: "#FAF6F0", borderRadius: 8, borderLeft: "3px solid #D4B483" }}>
                        📚 {idea.theoreticalBasis}
                      </div>
                    )}

                    {idea.tags && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {idea.tags.map(t => <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", background: "#F5ECD9", color: "#6B4D27", borderRadius: 100 }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
        * { box-sizing: border-box; }
        button:hover { opacity: 0.92; transform: translateY(-1px); }
        @media(max-width:640px){
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8894A", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
      {children}
      <div style={{ flex: 1, height: 1, background: "rgba(139,100,52,0.1)" }} />
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B5744", display: "block", marginBottom: 8 }}>{label}</label>
      <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "11px 14px", background: "#FAF6F0", border: "1.5px solid rgba(139,100,52,0.22)", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", color: "#2A1F14" }} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B5744", display: "block", marginBottom: 8 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "11px 14px", background: "#FAF6F0", border: "1.5px solid rgba(139,100,52,0.22)", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", color: value ? "#2A1F14" : "#9C836E", cursor: "pointer" }}>
        <option value="">Selecionar...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextareaField({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B5744", display: "block", marginBottom: 8 }}>{label}</label>
      <textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} rows={4}
        style={{ width: "100%", padding: "11px 14px", background: "#FAF6F0", border: "1.5px solid rgba(139,100,52,0.22)", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", color: "#2A1F14", resize: "vertical", lineHeight: 1.6 }} />
    </div>
  );
}

function Bar({ label, value, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "#9C836E", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#6B4D27" }}>{value}%</span>
      </div>
      <div style={{ height: 5, background: "#F5ECD9", borderRadius: 100, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 100, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}
