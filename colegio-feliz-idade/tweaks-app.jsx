// tweaks-app.jsx — Tweaks for FelizIdade LP v2.

const FONT_LINKS = {
  'Outfit':            'family=Outfit:wght@400;500;600;700;800;900',
  'DM Sans':           'family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700',
  'Nunito':            'family=Nunito:wght@400;500;600;700;800',
  'Sora':              'family=Sora:wght@400;500;600;700;800',
  'Plus Jakarta Sans': 'family=Plus+Jakarta+Sans:wght@400;500;600;700',
  'Mulish':            'family=Mulish:wght@400;500;600;700;800',
  'Manrope':           'family=Manrope:wght@400;500;600;700;800',
};

function ensureFont(family) {
  if (!family || !FONT_LINKS[family]) return;
  const id = 'gf-' + family.replace(/\s+/g, '-');
  if (document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?' + FONT_LINKS[family] + '&display=swap';
  document.head.appendChild(l);
}

// Palettes: [green, navy, yellow, coral]
const PALETTES = [
  ['#1F8A5B', '#0F2C4F', '#FFC83D', '#F26A4F'], // floresta + marinho + sol + coral (default)
  ['#2BA86A', '#13355F', '#FFD45E', '#FF7A5C'], // mais vivo / saturado
  ['#197A4F', '#0A1F3B', '#F0B82B', '#E45838'], // mais profundo / contraste
  ['#3F9B6E', '#1B4775', '#FFD66B', '#F08A6D'], // mais soft / pastel
  ['#2E7D32', '#1565C0', '#FFC107', '#E53935'], // primário-clássico (Projetar-style)
  ['#15604B', '#0F2C4F', '#F5C544', '#E97B5B'], // verde teal + tons quentes
];

function mix(hex, target, w) {
  const a = hex.match(/[\da-f]{2}/gi).map(x => parseInt(x, 16));
  const b = target.match(/[\da-f]{2}/gi).map(x => parseInt(x, 16));
  const c = a.map((v, i) => Math.round(v * (1 - w) + b[i] * w));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

function applyPalette([green, navy, yellow, coral]) {
  const r = document.documentElement.style;
  r.setProperty('--green', green);
  r.setProperty('--green-2', mix(green, '#000000', 0.18));
  r.setProperty('--green-soft', mix(green, '#FFFFFF', 0.88));
  r.setProperty('--navy', navy);
  r.setProperty('--navy-2', mix(navy, '#FFFFFF', 0.25));
  r.setProperty('--blue-soft', mix(navy, '#FFFFFF', 0.92));
  r.setProperty('--yellow', yellow);
  r.setProperty('--yellow-soft', mix(yellow, '#FFFFFF', 0.80));
  r.setProperty('--coral', coral);
  r.setProperty('--coral-soft', mix(coral, '#FFFFFF', 0.82));
}

function applyFonts(display, body) {
  ensureFont(display); ensureFont(body);
  const r = document.documentElement.style;
  if (display) r.setProperty('--f-display', `'${display}', ui-sans-serif, system-ui, sans-serif`);
  if (body)    r.setProperty('--f-body',    `'${body}', ui-sans-serif, system-ui, sans-serif`);
}

function App() {
  const defaults = window.TWEAK_DEFAULTS;
  const [t, setTweak] = useTweaks(defaults);

  React.useEffect(() => { applyPalette(t.palette); }, [t.palette]);
  React.useEffect(() => { applyFonts(t.displayFont, t.bodyFont); }, [t.displayFont, t.bodyFont]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Paleta — verde · azul · acentos" />
      <TweakColor
        label="Combinações"
        value={t.palette}
        options={PALETTES}
        onChange={(v) => setTweak('palette', v)}
      />

      <TweakSection label="Tipografia" />
      <TweakSelect
        label="Display (títulos)"
        value={t.displayFont}
        options={['Outfit', 'DM Sans', 'Nunito', 'Sora', 'Manrope', 'Plus Jakarta Sans']}
        onChange={(v) => setTweak('displayFont', v)}
      />
      <TweakSelect
        label="Corpo (texto)"
        value={t.bodyFont}
        options={['DM Sans', 'Mulish', 'Outfit', 'Nunito', 'Plus Jakarta Sans', 'Manrope']}
        onChange={(v) => setTweak('bodyFont', v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<App />);
