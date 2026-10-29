// Modelos 40–52 e a versão ATS.
import { Bg, Contacts, ContactSec, JobTitle, Name, Photo, Sec, Secs, SummaryText, type Ctx, type TemplateDef } from './engine';
import { Icon } from '../components/Icon';
import { parseDate } from '../../shared/dates.mjs';

/** Anos de experiência: do início mais antigo até hoje (ou o fim mais recente). */
function yearsOfExperience(c: Ctx) {
  const items = c.all.filter((s) => s.type === 'experience').flatMap((s) => s.items);
  const starts = items.map((i) => parseDate(i.start)).filter(Boolean) as { y: number; m: number | null }[];
  if (!starts.length) return 0;
  const first = starts.reduce((a, b) => (a.y * 12 + (a.m || 1) <= b.y * 12 + (b.m || 1) ? a : b));
  const now = new Date();
  return Math.max(0, Math.floor((now.getFullYear() * 12 + now.getMonth() + 1 - (first.y * 12 + (first.m || 1))) / 12));
}

export const setD: TemplateDef[] = [
  {
    id: 'pantanal', name: 'Pantanal', refs: ['modelo-41'], desc: 'Cartões estilo "bento" com números de destaque.',
    photo: 'yes', ats: 'baixa', cols: 2, tags: ['criativo', 'com foto', 'moderno'], accent: '#111111', palette: ['#111111', '#4338ca', '#be123c', '#0f766e'],
    fonts: { head: 'anton', body: 'inter' }, aside: ['languages', 'interests'],
    css: `
.T { padding: 10mm; display: grid; grid-template-columns: 64mm 1fr; gap: 4mm; align-items: start; }
.T .bg { width: 100%; background: #f1f1f1; }
.T .card { background: #fff; border-radius: 4mm; padding: 5mm; box-shadow: 0 .3mm 1mm rgba(0,0,0,.06); margin-bottom: 4mm; break-inside: avoid; }
.T .left .card:first-child { padding: 5mm; }
.T .kicker { font-size: .78em; text-transform: uppercase; letter-spacing: .05em; display: flex; align-items: center; gap: .5em; margin-bottom: 3mm; }
.T .kicker::before { content: ''; width: .5em; height: .5em; border-radius: 50%; background: var(--accent); }
.T .ph { width: 100%; height: 56mm; border-radius: 3mm; margin-bottom: 5mm; }
.T .nm { font-size: 3.4em; font-weight: 400; text-transform: uppercase; line-height: .95; }
.T .nm-last { display: block; }
.T .jt { font-family: var(--f-body); letter-spacing: .25em; text-transform: uppercase; font-size: .78em; margin: 2mm 0 4mm; }
.T .sum { font-size: .92em; color: #444; }
.T .ct { font-size: .85em; }
.T .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-bottom: 4mm; }
.T .stat { background: #fff; border-radius: 4mm; padding: 4mm 2mm; text-align: center; box-shadow: 0 .3mm 1mm rgba(0,0,0,.06); }
.T .stat b { display: block; font-family: var(--f-head); font-weight: 400; font-size: 2em; line-height: 1.1; margin-top: 1mm; }
.T .stat span { font-size: .78em; color: #666; }
.T .stat svg { color: #444; }
.T .sec-t { font-family: var(--f-body); font-weight: 800; font-size: .95em; letter-spacing: .04em; }
.T .lv-bar { background: #eee; height: .45em; border-radius: 0; }
.T .lv-bar i { border-radius: 0; }
.T .en-timeline::after { background: var(--accent); border: 0; }
.T .two { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
.T .two .card { margin: 0; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      const exp = c.all.filter((s) => s.type === 'experience').flatMap((s) => s.items).length;
      const years = yearsOfExperience(c);
      const skills = c.all.filter((s) => s.type === 'skills').flatMap((s) => s.items).length;
      const langs = c.all.filter((s) => s.type === 'languages').flatMap((s) => s.items).length;
      const L = { pt: ['anos de experiência', 'empresas', 'habilidades', 'idiomas'], en: ['years of experience', 'companies', 'skills', 'languages'], es: ['años de experiencia', 'empresas', 'habilidades', 'idiomas'] }[c.lang];
      const stats = [['briefcase', `${years}+`, L[0]], ['users', exp, L[1]], ['sparkles', skills, L[2]], ['globe', langs, L[3]]] as const;
      const skillSecs = main.filter((s) => s.type === 'skills');
      const rest = main.filter((s) => s.type !== 'skills');
      return (
        <>
          <Bg />
          <div className="left">
            <div className="card">
              {c.p.title ? <div className="kicker">{c.p.title}</div> : null}
              <Photo c={c} shape="rounded" />
              <Name c={c} split /><JobTitle c={c} /><SummaryText c={c} s={sum} />
            </div>
            <div className="card"><ContactSec c={c} /></div>
            {aside.map((s) => <div className="card" key={s.id}><Sec c={c} s={s} o={{ langs: 'bars', interests: 'icons' }} /></div>)}
          </div>
          <div className="right">
            <div className="stats" aria-hidden>{stats.map(([ic, n, l]) => <div className="stat" key={l}><Icon name={ic} size="1.5em" /><b>{n}</b><span>{l}</span></div>)}</div>
            {rest.map((s) => <div className="card" key={s.id}><Sec c={c} s={s} o={{ entry: 'timeline' }} /></div>)}
            {skillSecs.map((s) => <div className="card" key={s.id}><Sec c={c} s={s} o={{ skills: 'bars' }} /></div>)}
          </div>
        </>
      );
    },
  },

  {
    id: 'cerrado', name: 'Cerrado', refs: ['modelo-44', 'modelo-58'], desc: 'Nome condensado empilhado e colunas separadas por linhas.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'clássico'], accent: '#2e2e2e', palette: ['#2e2e2e', '#22577a', '#80391e', '#38583a'],
    fonts: { head: 'oswald', body: 'opensans' }, aside: ['education', 'skills', 'languages', 'interests', 'courses', 'references'],
    css: `
.T { padding: 15mm 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: auto 1fr auto; gap: 7mm; align-items: center; padding-bottom: 6mm; border-bottom: 1px solid #bbb; margin-bottom: 7mm; }
.T .ph { width: 26mm; height: 26mm; }
.T .nm { font-size: 2.8em; text-transform: uppercase; font-weight: 500; line-height: 1; }
.T .nm-last { display: block; }
.T .jt { font-family: var(--f-body); letter-spacing: .3em; text-transform: uppercase; font-size: .75em; color: #666; margin-top: 2mm; }
.T .hd .ct { font-size: .84em; }
.T .cols { display: grid; grid-template-columns: 54mm 1fr; }
.T .side { padding-right: 7mm; border-right: 1px solid #bbb; }
.T .main { padding-left: 8mm; }
.T .sec-t { font-family: var(--f-body); font-weight: 800; letter-spacing: .15em; font-size: .9em; border-bottom: 1px solid #bbb; padding-bottom: .4em; }
.T .en-t { font-size: .92em; text-transform: uppercase; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr auto' }}><Photo c={c} /><div><Name c={c} split /><JobTitle c={c} /></div><Contacts c={c} variant="right" /></header>
          <div className="cols">
            <div className="side"><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'iracema', name: 'Iracema', refs: ['modelo-45'], desc: 'Nome centralizado e espaçado com detalhe mostarda.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'clássico'], accent: '#e0ac2b', palette: ['#e0ac2b', '#e76f51', '#2a9d8f', '#8338ec'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['education', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 0 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: 46mm 1fr 46mm; gap: 6mm; align-items: center; padding-bottom: 7mm; border-bottom: 1px solid #ccc; margin-bottom: 7mm; }
.T .mid { text-align: center; position: relative; padding-top: 22mm; }
.T .mid::before { content: ''; position: absolute; top: 0; left: 50%; width: 6mm; height: 15mm; background: var(--accent); transform: translateX(-50%); }
.T .nm { font-weight: 300; font-size: 1.3em; letter-spacing: .35em; text-transform: uppercase; }
.T .nm-last { display: block; font-weight: 800; font-size: 2.2em; letter-spacing: .12em; }
.T .jt { letter-spacing: .3em; text-transform: uppercase; font-size: .75em; color: #666; margin-top: 2mm; }
.T .ph { width: 26mm; height: 26mm; margin-top: 20mm; }
.T .hd .ct { font-size: .75em; margin-top: 20mm; }
.T .cols { display: grid; grid-template-columns: 54mm 1fr; gap: 8mm; }
.T .sec-t { letter-spacing: .25em; font-size: .92em; font-weight: 700; }
.T .en-t { text-transform: uppercase; font-size: .88em; }
.T .lv-bullets li::marker { color: var(--accent); }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd">{c.hasPhoto ? <Photo c={c} /> : <div />}<div className="mid"><Name c={c} split /><JobTitle c={c} /></div><Contacts c={c} variant="right" /></header>
          <div className="cols">
            <div className="side"><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'itapua', name: 'Itapuã', refs: ['modelo-49'], desc: 'Foto com moldura deslocada e sobrenome em destaque.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno'], accent: '#333333', palette: ['#333333', '#0e7490', '#a21caf', '#4d7c0f'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['skills', 'languages', 'interests', 'references', 'awards'],
    css: `
.T { padding: 15mm 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: 1fr 40mm auto; gap: 7mm; align-items: center; margin-bottom: 9mm; }
.T .nm { font-weight: 400; font-size: 1.1em; letter-spacing: .4em; text-transform: uppercase; }
.T .nm-last { display: block; font-weight: 800; font-size: 2.7em; letter-spacing: .03em; }
.T .jt { letter-spacing: .3em; text-transform: uppercase; font-size: .78em; color: #666; margin-top: 2mm; }
.T .pw { position: relative; width: 34mm; height: 42mm; }
.T .pw::before { content: ''; position: absolute; inset: -3mm 3mm 3mm -3mm; border: 1.2px solid var(--accent); }
.T .pw .ph { position: relative; width: 100%; height: 100%; }
.T .hd .ct { font-size: .8em; }
.T .cols { display: grid; grid-template-columns: 58mm 1fr; gap: 9mm; }
.T .sec-t { letter-spacing: .25em; font-size: .92em; }
.T .en-t { text-transform: uppercase; font-size: .86em; }
.T .lower { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 9mm; border-top: 1px solid #ccc; padding-top: 6mm; margin-top: 2mm; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const edu = c.take('education');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd"><div><Name c={c} split /><JobTitle c={c} /></div>{c.hasPhoto ? <div className="pw"><Photo c={c} shape="square" /></div> : <div />}<Contacts c={c} variant="right" /></header>
          <div className="cols">
            <div>{sum ? <Sec c={c} s={sum} /> : null}{edu ? <Sec c={c} s={edu} o={{ entry: 'top' }} /> : null}</div>
            <div><Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
          {aside.length ? <div className="lower"><Secs c={c} list={aside} o={{ skills: 'columns', langs: 'list', entry: 'sub' }} /></div> : null}
        </>
      );
    },
  },

  {
    id: 'ponta-negra', name: 'Ponta Negra', refs: ['modelo-51'], desc: 'Coluna cinza com foto, nome e resumo; linha do tempo à direita.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno'], accent: '#4a4a4a', palette: ['#4a4a4a', '#3a6ea5', '#a5583a', '#3aa57a'],
    fonts: { head: 'raleway', body: 'opensans' }, aside: ['skills', 'interests'],
    css: `
.T { display: grid; grid-template-columns: 68mm 1fr; }
.T .bg { width: 68mm; background: #efefef; }
.T .side { padding: 0 8mm 12mm 11mm; }
.T .side .ph { width: 68mm; height: 66mm; margin: 0 -8mm 0 -11mm; }
.T .side .who { padding: 7mm 0 7mm; }
.T .side.nophoto .who { padding-top: 16mm; }
.T .nm { font-weight: 400; font-size: 2.4em; line-height: 1.1; }
.T .nm-last { display: block; }
.T .jt { font-family: var(--f-body); font-weight: 700; letter-spacing: .25em; text-transform: uppercase; font-size: .78em; margin-top: 3mm; }
.T .main { padding: 15mm 14mm 12mm 9mm; }
.T .sec-t { font-weight: 500; letter-spacing: .2em; font-size: 1em; border-bottom: 1.5px solid #bbb; padding-bottom: .4em; }
.T .ct { font-size: .86em; }
.T .en-t { font-size: .93em; }
.T .en-timeline::after { background: #4a4a4a; border: 0; width: .55em; height: .55em; left: .05em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className={`side pad ${c.hasPhoto ? '' : 'nophoto'}`}>
            <Photo c={c} shape="square" />
            <div className="who"><Name c={c} split /><JobTitle c={c} /></div>
            <ContactSec c={c} />{sum ? <Sec c={c} s={sum} /> : null}
            <Secs c={c} list={aside} o={{ skills: 'bullets' }} />
          </div>
          <div className="main pad"><Secs c={c} list={main} o={{ entry: 'timeline', langs: 'plain' }} /></div>
        </>
      );
    },
  },

  {
    id: 'mantiqueira', name: 'Mantiqueira', refs: ['modelo-52'], desc: 'Linha central com marcadores, habilidades alinhadas à direita.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#333333', palette: ['#333333', '#264653', '#6d597a', '#606c38'],
    fonts: { head: 'raleway', body: 'opensans' }, aside: ['skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 15mm 15mm 13mm; }
.T .bg { left: calc(15mm + 56mm + 5mm); width: 1px; background: #bbb; }
.T .hd { display: grid; grid-template-columns: 56mm 1fr; gap: 10mm; align-items: center; margin-bottom: 10mm; }
.T .lbl { font-size: .8em; letter-spacing: .4em; text-transform: uppercase; color: #555; text-align: center; margin-bottom: 3mm; }
.T .ph { width: 34mm; height: 34mm; margin: 0 auto; }
.T .nm { font-weight: 300; font-size: 2.8em; }
.T .jt { font-weight: 700; letter-spacing: .35em; text-transform: uppercase; font-size: .8em; margin: 2mm 0 5mm; }
.T .ct-letter .ct-l { width: 1.8em; height: 1.8em; border-radius: 50%; background: #333; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: .78em; }
.T .ct { font-size: .88em; }
.T .cols { display: grid; grid-template-columns: 56mm 1fr; gap: 10mm; }
.T .side { text-align: right; }
.T .side .sec-t { justify-content: flex-end; }
.T .side .lv-bullets { list-style: none; padding: 0; }
.T .side .lv-list li { justify-content: flex-end; }
.T .sec-t { letter-spacing: .3em; font-size: 1.05em; font-weight: 700; position: relative; }
.T .main .sec-t::before { content: ''; position: absolute; left: calc(-5mm - .4em); width: .8em; height: .8em; border-radius: 50%; background: #333; }
.T .en-o { text-transform: uppercase; font-size: .85em; letter-spacing: .05em; font-weight: 700; color: #333; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <header className="hd"><div><div className="lbl" aria-hidden>— {{ pt: 'Currículo', en: 'Resume', es: 'Currículum' }[c.lang]}</div><Photo c={c} /></div><div><Name c={c} /><JobTitle c={c} /><Contacts c={c} variant="icons" /></div></header>
          <div className="cols">
            <div className="side"><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'sub' }} /></div>
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'stack', orgFirst: true }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'ubatuba', name: 'Ubatuba', refs: ['modelo-54'], desc: 'Minimalista: borda preta no topo e coluna cinza com foto.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'clássico'], accent: '#111111', palette: ['#111111', '#334e68', '#7b341e', '#276749'],
    fonts: { head: 'lato', body: 'lato' }, aside: ['skills', 'references', 'languages', 'interests'],
    css: `
.T { display: grid; grid-template-columns: 64mm 1fr; }
.T .bg { width: 100%; background: linear-gradient(var(--accent) 0 0) top / 100% 3mm no-repeat, linear-gradient(#e9e9e9 0 0) left / 64mm 100% no-repeat; }
.T .side { padding: 16mm 8mm 12mm 10mm; }
.T .side .ph { width: 42mm; height: 50mm; margin: 0 auto 8mm; }
.T .nm { font-size: 1.9em; font-weight: 700; }
.T .jt { font-style: italic; color: #666; margin: 1mm 0 5mm; }
.T .side .sum { font-size: .92em; color: #444; margin-bottom: 8mm; }
.T .ct { font-size: .84em; }
.T .main { padding: 16mm 14mm 12mm 10mm; }
.T .sec-t { text-transform: none; letter-spacing: 0; font-size: 1.4em; font-weight: 400; }
.T .en-t { font-weight: 700; }
.T .lower { display: grid; grid-template-columns: 1fr 1fr; gap: 0 8mm; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="side pad"><Photo c={c} shape="square" /><Name c={c} /><JobTitle c={c} /><SummaryText c={c} s={sum} /><Contacts c={c} variant="plain" /></div>
          <div className="main pad">
            <Secs c={c} list={main} o={{ entry: 'sub' }} />
            {aside.length ? <div className="lower"><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'sub' }} /></div> : null}
          </div>
        </>
      );
    },
  },

  {
    id: 'marajo', name: 'Marajó', refs: ['modelo-55'], desc: 'Nome fino e espaçado, foto quadrada com sombra.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#444444', palette: ['#444444', '#355070', '#6d597a', '#52796f'],
    fonts: { head: 'raleway', body: 'opensans' }, aside: ['education', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 15mm 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: 1fr 34mm; gap: 8mm; align-items: center; margin-bottom: 9mm; }
.T .nm { font-weight: 300; font-size: 2.8em; letter-spacing: .25em; text-transform: uppercase; line-height: 1.2; color: #555; }
.T .nm-last { display: block; }
.T .jt { letter-spacing: .35em; text-transform: uppercase; font-size: .75em; color: #888; margin-top: 3mm; }
.T .ph { width: 34mm; height: 38mm; border: 1.5mm solid #fff; }
.T .cols { display: flex; }
.T .cols > .side { flex: 0 0 54mm; } .T .cols > .main { flex: 1; min-width: 0; }
.T .side { padding-right: 7mm; border-right: 1px solid #ccc; }
.T .main { padding-left: 8mm; }
.T .sec-t { font-weight: 500; letter-spacing: .25em; font-size: 1em; }
.T .ct { font-size: .86em; }
.T .en-t { text-transform: uppercase; font-size: .86em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd"><div><Name c={c} split /><JobTitle c={c} /></div><Photo c={c} shape="square" /></header>
          <div className="cols">
            <div className="side"><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'abrolhos', name: 'Abrolhos', refs: ['modelo-56'], desc: 'Títulos em etiquetas pretas com ícones e barra no topo.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno'], accent: '#111111', palette: ['#111111', '#1e40af', '#9f1239', '#166534'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['interests', 'awards', 'languages'],
    css: `
.T { padding: 0 14mm 13mm; }
.T .bg { width: 100%; background: linear-gradient(var(--accent) 0 0) top / 100% 3.5mm no-repeat; }
.T .hd { display: grid; grid-template-columns: 56mm 1fr; gap: 8mm; align-items: center; padding: 12mm 0 8mm; }
.T .ph { width: 36mm; height: 36mm; margin: 0 auto; }
.T .nm { font-size: 2.5em; font-weight: 800; text-transform: uppercase; }
.T .jt { text-transform: uppercase; letter-spacing: .1em; font-size: .85em; color: #777; margin-top: 1mm; }
.T .cols { display: grid; grid-template-columns: 56mm 1fr; gap: 8mm; }
.T .side { text-align: center; }
.T .side .sec-t { justify-content: center; letter-spacing: .3em; font-size: .9em; }
.T .side .ct li { justify-content: center; }
.T .side .lv-icons { justify-content: center; }
.T .side .lv-icons svg { border: 1px solid #333; border-radius: 50%; padding: .3em; width: 2.2em; height: 2.2em; }
.T .main .sec-t { gap: 0; }
.T .main .sec-ic { width: 2em; height: 2em; border-radius: 50%; background: #111; color: #fff; justify-content: center; align-items: center; margin-right: 2mm; }
.T .main .sec-tx { background: #111; color: #fff; padding: .25em .9em; letter-spacing: .25em; font-size: .85em; }
.T .en-t { text-transform: uppercase; font-size: .9em; }
.T .en-o { text-transform: uppercase; font-size: .85em; }
.T .sec-skills .lv { display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 5mm; }
.T .sec-skills .lv-bars li { display: block; text-transform: uppercase; font-size: .82em; }
.T .sec-skills .lv-bar { display: block; height: .25em; margin-top: .3em; border-radius: 0; background: #ddd; }
.T .sec-skills .lv-bar i { border-radius: 0; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr' }}><Photo c={c} /><div><Name c={c} /><JobTitle c={c} /></div></header>
          <div className="cols">
            <div className="side">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={aside} o={{ interests: 'icons', langs: 'list', entry: 'top' }} /><ContactSec c={c} variant="plain" /></div>
            <div className="main"><Secs c={c} list={main} o={{ icons: true, entry: 'sub', skills: 'bars' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'amazonia', name: 'Amazônia', refs: ['modelo-57'], desc: 'Barra lateral azul-marinho e marcadores azuis na linha do tempo.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'coluna escura'], accent: '#3b82c4', palette: ['#3b82c4', '#14b8a6', '#f59e0b', '#ec4899'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['skills', 'languages', 'interests'],
    css: `
.T { display: grid; grid-template-columns: 64mm 1fr; }
.T .bg { width: 64mm; background: #26303d; }
.T .side { color: #e8ebef; padding: 0 8mm 12mm 10mm; }
.T .side .ph { width: 64mm; height: 70mm; margin: 0 -8mm 7mm -10mm; }
.T .side.nophoto { padding-top: 14mm; }
.T .side .sec-t { color: #fff; font-size: .95em; letter-spacing: .14em; }
.T .side .ct { font-size: .84em; }
.T .side .lv-bar { background: rgba(255,255,255,.15); }
.T .side .lv-lb { color: #b8c0cc; }
.T .side .lv-icons { color: #fff; }
.T .main { padding: 15mm 14mm 12mm 10mm; }
.T .nm { font-size: 2.6em; font-weight: 800; text-transform: uppercase; line-height: 1; }
.T .nm-last { display: block; }
.T .main .jt { color: #666; margin: 2mm 0 0; }
.T .main .bar { width: 10mm; height: 1mm; background: #333; margin: 5mm 0 8mm; }
.T .main .sec-t { font-size: 1em; letter-spacing: .14em; }
.T .en-left { grid-template-columns: 22mm 1fr; position: relative; }
.T .en-left .en-b { border-left: 1px solid #ccc; padding-left: 6mm; position: relative; }
.T .en-left .en-b::before { content: ''; position: absolute; left: -1.6mm; top: .25em; width: 3.2mm; height: 3.2mm; border-radius: 50%; border: 1.2px solid var(--accent); background: #fff; }
.T .en-left .en-d { color: #444; font-weight: 700; }
.T .en-t { font-size: .92em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="main pad" style={{ gridColumn: 2, gridRow: 1 }}><Name c={c} split /><JobTitle c={c} /><div className="bar" /><Secs c={c} list={main} o={{ entry: 'left' }} /></div>
          <div className={`side pad dark ${c.hasPhoto ? '' : 'nophoto'}`} style={{ gridColumn: 1, gridRow: 1 }}>
            <Photo c={c} shape="square" />{sum ? <Sec c={c} s={sum} /> : null}<ContactSec c={c} />
            <Secs c={c} list={aside} o={{ skills: 'bars', langs: 'list', interests: 'icons' }} />
          </div>
        </>
      );
    },
  },

  {
    id: 'jalapao', name: 'Jalapão', refs: ['modelo-59'], desc: 'Três colunas de destaque e experiência em linha do tempo.',
    photo: 'yes', ats: 'media', cols: 1, tags: ['com foto', 'moderno'], accent: '#2f2f2f', palette: ['#2f2f2f', '#2c5f7c', '#7c2c4b', '#5c7c2c'],
    fonts: { head: 'josefin', body: 'opensans' }, aside: ['education', 'skills'],
    css: `
.T { padding: 15mm 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: 40mm 1fr; gap: 9mm; align-items: center; margin-bottom: 8mm; }
.T .ph { width: 40mm; height: 46mm; }
.T .nm { font-weight: 400; font-size: 2.6em; letter-spacing: .2em; text-transform: uppercase; line-height: 1.15; }
.T .nm-last { display: block; }
.T .jt { letter-spacing: .3em; text-transform: uppercase; font-size: .78em; color: #666; margin: 3mm 0 4mm; padding-bottom: 3mm; border-bottom: 1px solid #ccc; }
.T .sum { font-size: .92em; color: #444; }
.T .row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7mm; padding: 5mm 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; margin-bottom: 7mm; }
.T .row .sec { margin: 0; }
.T .sec-t { font-weight: 600; letter-spacing: .25em; font-size: .9em; display: flex; }
.T .sec-t::after { content: ''; flex: 1; height: 1px; background: #ccc; }
.T .ct { font-size: .84em; }
.T .en-left { grid-template-columns: 34mm 1fr; }
.T .en-left .en-b { border-left: 1px solid #ccc; padding-left: 5mm; position: relative; }
.T .en-left .en-b::before { content: ''; position: absolute; left: -1.2mm; top: .3em; width: 2.4mm; height: 2.4mm; border-radius: 50%; background: #2f2f2f; }
.T .en-t { text-transform: uppercase; font-size: .88em; }
.T .lower { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7mm; border-top: 1px solid #ccc; padding-top: 6mm; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const edu = c.take('education');
      const skills = c.take('skills');
      const { main, aside } = c.split(['languages', 'interests', 'references', 'awards', 'courses']);
      return (
        <>
          <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr' }}><Photo c={c} shape="square" /><div><Name c={c} split /><JobTitle c={c} /><SummaryText c={c} s={sum} /></div></header>
          <div className="row">
            <ContactSec c={c} />
            {edu ? <Sec c={c} s={edu} o={{ entry: 'top' }} /> : <div />}
            {skills ? <Sec c={c} s={skills} o={{ skills: 'bullets' }} /> : <div />}
          </div>
          <Secs c={c} list={main} o={{ entry: 'left' }} />
          {aside.length ? <div className="lower"><Secs c={c} list={aside} o={{ langs: 'list', entry: 'top' }} /></div> : null}
        </>
      );
    },
  },

  {
    id: 'carioca', name: 'Carioca', refs: ['modelo-62'], desc: 'Limpo e direto, com contatos em ícones redondos. Bom para ATS.',
    photo: 'no', ats: 'media', cols: 2, tags: ['sem foto', 'clássico'], accent: '#222222', palette: ['#222222', '#1d4ed8', '#b45309', '#15803d'],
    fonts: { head: 'worksans', body: 'opensans' }, aside: ['education', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 16mm 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: 1fr auto; gap: 8mm; align-items: center; padding-bottom: 7mm; border-bottom: 1px solid #ddd; margin-bottom: 7mm; }
.T .nm { font-size: 2.4em; font-weight: 800; text-transform: uppercase; line-height: 1.05; }
.T .nm-last { display: block; }
.T .jt { margin-top: 2mm; color: #555; font-weight: 500; }
.T .ct { font-size: .84em; }
.T .ct-right .ct-ic { width: 1.9em; height: 1.9em; border-radius: 50%; background: var(--accent); color: #fff; justify-content: center; align-items: center; font-size: .8em; }
.T .cols { display: grid; grid-template-columns: 54mm 1fr; }
.T .side { padding-right: 7mm; border-right: 1px solid #ddd; }
.T .main { padding-left: 8mm; }
.T .sec-t { font-size: .95em; letter-spacing: .08em; font-weight: 800; }
.T .en-t { font-size: .95em; }
.T .en-o { font-style: italic; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd"><div><Name c={c} split /><JobTitle c={c} /></div><Contacts c={c} variant="right" /></header>
          <div className="cols">
            <div className="side">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
            <div className="main"><Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'candango', name: 'Candango', refs: ['modelo-63'], desc: 'Etiqueta azul, foto grande e resumo entre aspas.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno'], accent: '#2c3e8f', palette: ['#2c3e8f', '#0f766e', '#9d174d', '#b45309'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['education', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 0 14mm 13mm; }
.T .bg { width: 100%; background: #f6f6f8; }
.T .hd { display: grid; grid-template-columns: 1fr 58mm; gap: 8mm; }
.T .tag { display: inline-block; background: var(--accent); color: #fff; padding: 2mm 6mm; letter-spacing: .2em; font-size: .8em; text-transform: uppercase; margin-bottom: 9mm; }
.T .nm { font-size: 2.5em; font-weight: 800; text-transform: uppercase; line-height: 1.05; }
.T .nm-last { display: block; }
.T .jt { color: #555; margin: 2mm 0 5mm; }
.T .ct { font-size: .82em; }
.T .ct-ic { color: var(--accent); }
.T .ph { width: 58mm; height: 76mm; margin-top: 10mm; }
.T .cols { display: grid; grid-template-columns: 1fr 58mm; gap: 8mm; margin-top: 7mm; }
.T .quote { position: relative; padding: 5mm 4mm; margin-bottom: 7mm; font-size: .92em; color: #444; }
.T .quote::before, .T .quote::after { position: absolute; font-family: Georgia, serif; font-size: 3.4em; color: var(--accent); line-height: 1; }
.T .quote::before { content: '\\201C'; top: -2mm; left: -2mm; }
.T .quote::after { content: '\\201D'; bottom: -9mm; right: 0; }
.T .sec-t { font-weight: 800; font-size: 1em; letter-spacing: .05em; }
.T .en-t { text-transform: uppercase; font-size: .88em; }
.T .lv-bar { height: .18em; background: #ccc; overflow: visible; }
.T .lv-bar i { position: relative; }
.T .lv-bar i::after { content: ''; position: absolute; right: -.35em; top: -.3em; width: .75em; height: .75em; border-radius: 50%; background: var(--accent); }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr' }}>
            <div><div className="tag" aria-hidden>{{ pt: 'Currículo', en: 'Resume', es: 'Currículum' }[c.lang]}</div><Name c={c} split /><JobTitle c={c} /><Contacts c={c} variant="iconsInline" /></div>
            <Photo c={c} shape="square" />
          </header>
          <div className="cols">
            <div className="main"><Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
            <div className="side">{sum ? <SummaryText c={c} s={sum} className="quote" /> : null}<Secs c={c} list={aside} o={{ skills: 'bars', langs: 'list', entry: 'top' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'ats', name: 'Essencial ATS', refs: [], desc: 'Uma coluna, sem enfeites: a leitura mais segura para sistemas de RH.',
    photo: 'no', ats: 'alta', cols: 1, tags: ['sem foto', 'clássico'], accent: '#111111', palette: ['#111111', '#1f3a5f', '#3a3a3a', '#5a3e2b'],
    fonts: { head: 'opensans', body: 'opensans' }, aside: [],
    css: `
.T { padding: 16mm 18mm 14mm; font-size: calc(9.5pt * var(--fs)); }
.T .nm { font-size: 2.1em; font-weight: 700; }
.T .jt { font-family: var(--f-body); font-size: 1.15em; margin-top: .2em; }
.T .ct { margin: .6em 0 6mm; color: #333; }
.T .sec-t { font-size: 1.05em; letter-spacing: .04em; border-bottom: 1px solid #999; padding-bottom: .2em; color: var(--accent); }
.T .en-t { font-size: 1em; }
.T .en-s { color: #333; }
`,
    render: (c) => {
      const { main } = c.split([]);
      return (
        <>
          <Name c={c} /><JobTitle c={c} />
          <Contacts c={c} variant="inline" sep=" | " />
          <Secs c={c} list={main} o={{ entry: 'stack', skills: 'plain', langs: 'list', interests: 'plain' }} />
        </>
      );
    },
  },
];
