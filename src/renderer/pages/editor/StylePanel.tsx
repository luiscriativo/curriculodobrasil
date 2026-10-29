// Aba "Estilo": cor, fontes, tamanho, espaçamento, foto, datas, idioma e papel.
import { Icon } from '../../components/Icon';
import { Switch } from '../../components/ui';
import type { Resume, ResumeStyle } from '../../types';
import type { Update } from '../Editor';
import { FONT_PAIRS, FONTS } from '../../templates/engine';
import { getTemplate } from '../../templates';
import { formatDate } from '../../../shared/dates.mjs';

export const EXTRA_COLORS = ['#111111', '#1f3a5f', '#2563eb', '#0f766e', '#15803d', '#b45309', '#c2410c', '#b91c1c', '#be185d', '#7c3aed', '#8a6f5e', '#64748b'];

export function StylePanel({ doc, update, pages, onFit }: { doc: Resume; update: Update; pages: number; onFit: () => void }) {
  const st = doc.style;
  const tpl = getTemplate(doc.template);
  const set = (patch: Partial<ResumeStyle>, coalesce?: string) => update((r) => ({ ...r, style: { ...r.style, ...patch } }), coalesce ? { coalesce } : undefined);
  const colors = [...new Set([...(tpl.palette || [tpl.accent]), ...EXTRA_COLORS])];
  const current = st.accent || tpl.accent;

  return (
    <div>
      <div className="style-sec">
        <h4>Cor de destaque</h4>
        <div className="swatches">
          {colors.map((c) => <button key={c} className={`sw ${current.toLowerCase() === c.toLowerCase() ? 'on' : ''}`} style={{ background: c }} title={c === tpl.accent ? `${c} (original do modelo)` : c} aria-label={`Cor ${c}`} onClick={() => set({ accent: c === tpl.accent ? null : c })} />)}
          <label className="sw custom" title="Escolher outra cor"><input type="color" value={current} onChange={(e) => set({ accent: e.target.value }, 'accent')} /></label>
          {st.accent ? <button className="btn ghost sm" onClick={() => set({ accent: null })}>Original</button> : null}
        </div>
      </div>

      <div className="style-sec">
        <h4>Fontes</h4>
        <div className="chips">
          <button className={`chip font-opt ${!st.font ? 'on' : ''}`} onClick={() => set({ font: null })}>Do modelo<small>{tpl.fonts.head === tpl.fonts.body ? tpl.fonts.head : `${tpl.fonts.head} + ${tpl.fonts.body}`}</small></button>
          {FONT_PAIRS.map((f) => (
            <button key={f.id} className={`chip font-opt ${st.font === f.id ? 'on' : ''}`} style={{ fontFamily: FONTS[f.head] }} onClick={() => set({ font: f.id })}>{f.name}<small style={{ fontFamily: FONTS[f.body] }}>Texto do currículo</small></button>
          ))}
        </div>
      </div>

      <div className="style-sec">
        <h4>Tamanho e espaçamento</h4>
        <div className="field"><label>Tamanho do texto</label>
          <div className="range-row"><input type="range" min={0.8} max={1.25} step={0.01} value={st.fontScale} onChange={(e) => set({ fontScale: +e.target.value }, 'fontScale')} /><span className="num">{Math.round(st.fontScale * 100)}%</span></div></div>
        <div className="field" style={{ marginTop: 10 }}><label>Espaço entre seções e itens</label>
          <div className="range-row"><input type="range" min={0.6} max={1.6} step={0.05} value={st.spacing} onChange={(e) => set({ spacing: +e.target.value }, 'spacing')} /><span className="num">{Math.round(st.spacing * 100)}%</span></div></div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <button className="btn sm" onClick={onFit} disabled={pages <= 1}><Icon name="wand" size={15} />Caber em 1 página</button>
          {st.fontScale !== 1 || st.spacing !== 1 ? <button className="btn ghost sm" onClick={() => set({ fontScale: 1, spacing: 1 })}>Restaurar 100%</button> : null}
          <span className="hint">{pages === 1 ? 'Já cabe em 1 página.' : `≈ ${pages} páginas agora.`}</span>
        </div>
      </div>

      <div className="style-sec">
        <h4>Foto</h4>
        <div className="chips">
          {[[null, 'Do modelo'], ['circle', 'Redonda'], ['rounded', 'Arredondada'], ['square', 'Quadrada'], ['arch', 'Arco']].map(([v, l]) => (
            <button key={String(v)} className={`chip ${st.photoShape === v ? 'on' : ''}`} onClick={() => set({ photoShape: v })}>{l}</button>
          ))}
        </div>
        <div className="opt-row" style={{ marginTop: 8 }}><div className="ot"><b>Foto em preto e branco</b><small>Visual mais sóbrio, como em muitos modelos.</small></div><Switch checked={st.grayscale} onChange={(v) => set({ grayscale: v })} label="Preto e branco" /></div>
      </div>

      <div className="style-sec">
        <h4>Detalhes</h4>
        <div className="opt-row"><div className="ot"><b>Mostrar níveis</b><small>Barras/pontos em habilidades e idiomas. Desligado vira lista simples.</small></div><Switch checked={st.showLevels} onChange={(v) => set({ showLevels: v })} label="Mostrar níveis" /></div>
        <div className="opt-row"><div className="ot"><b>Letras bem espaçadas (decorativo)</b><small>Fiel ao visual original, mas sistemas de RH podem ler “A N A L I S T A”. Deixe desligado para candidaturas online.</small></div><Switch checked={st.decorativeSpacing} onChange={(v) => set({ decorativeSpacing: v })} label="Letras espaçadas" /></div>
        <div className="grid2" style={{ marginTop: 10 }}>
          <div className="field"><label>Formato das datas</label>
            <select className="select" value={st.dateFormat} onChange={(e) => set({ dateFormat: e.target.value as ResumeStyle['dateFormat'] })}>
              {(['mm/yyyy', 'mon yyyy', 'month yyyy', 'yyyy'] as const).map((f) => <option key={f} value={f}>{formatDate('03/2021', f, st.lang)}</option>)}
            </select></div>
          <div className="field"><label>Idioma dos títulos</label>
            <select className="select" value={st.lang} onChange={(e) => set({ lang: e.target.value as ResumeStyle['lang'] })}>
              <option value="pt">Português</option><option value="en">English</option><option value="es">Español</option>
            </select></div>
          <div className="field"><label>Papel</label>
            <select className="select" value={st.paper} onChange={(e) => set({ paper: e.target.value as ResumeStyle['paper'] })}>
              <option value="A4">A4 (Brasil)</option><option value="Letter">Carta (EUA)</option>
            </select></div>
        </div>
      </div>
    </div>
  );
}
