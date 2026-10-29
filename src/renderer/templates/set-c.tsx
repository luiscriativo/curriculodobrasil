// Modelos 27–39.
import { Bg, Contacts, ContactSec, JobTitle, Name, Photo, Sec, Secs, SummaryText, type TemplateDef } from './engine';
import { Icon } from '../components/Icon';

export const setC: TemplateDef[] = [
  {
    id: 'paraty', name: 'Paraty', refs: ['modelo-24'], desc: 'Coluna bege, faixa no topo e tempo de cada experiência.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#2f2f2f', palette: ['#2f2f2f', '#7a5c45', '#3c5a6e', '#55603f'],
    fonts: { head: 'baskerville', body: 'opensans' }, aside: ['education', 'languages', 'skills', 'interests', 'courses'],
    css: `
.T { display: grid; grid-template-columns: 66mm 1fr; }
.T .bg { width: 66mm; background: #efeae4; }
.T .side { padding: 13mm 7mm 12mm 10mm; }
.T .side .ph { width: 49mm; height: 58mm; border: 2mm solid #fff; margin-bottom: 9mm; }
.T .hd { background: #efeae4; margin: 13mm 0 8mm 3mm; padding: 9mm 14mm 8mm 9mm; }
.T .nm { font-weight: 400; font-size: 2.3em; letter-spacing: .12em; text-transform: uppercase; }
.T .jt { font-size: 1.15em; margin: .4em 0 .8em; letter-spacing: .08em; }
.T .sum { font-size: .95em; }
.T .main { padding: 0 14mm 12mm 12mm; }
.T .sec-t { font-family: var(--f-body); font-weight: 800; letter-spacing: .14em; font-size: 1em; }
.T .side .sec-t { font-size: .9em; }
.T .ct { font-size: .86em; }
.T .en-left { grid-template-columns: 26mm 1fr; }
.T .en-left .en-d { color: #222; font-weight: 700; }
.T .en-t { text-transform: uppercase; font-size: .9em; }
.T .lv-bullets li { margin: .3em 0; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="main-wrap" style={{ gridColumn: 2, gridRow: 1 }}>
            <header className="hd"><Name c={c} /><JobTitle c={c} /><SummaryText c={c} s={sum} /></header>
            <div className="main pad"><Secs c={c} list={main} o={{ entry: 'left', duration: true, dateSep: ' – ' }} /></div>
          </div>
          <div className="side pad" style={{ gridColumn: 1, gridRow: 1 }}><Photo c={c} shape="square" /><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
        </>
      );
    },
  },

  {
    id: 'tiradentes', name: 'Tiradentes', refs: ['modelo-25'], desc: 'Coluna bege com foto, nome serifado e habilidades com check.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#9c7f68', palette: ['#9c7f68', '#6f8f7d', '#7d6f9c', '#b0745c'],
    fonts: { head: 'cormorant', body: 'lato' }, aside: ['languages', 'skills', 'interests'],
    css: `
.T { display: grid; grid-template-columns: 62mm 1fr; }
.T .bg { width: 62mm; background: #f3efea; }
.T .side { padding: 12mm 7mm 12mm 9mm; }
.T .side .ph { width: 44mm; height: 54mm; margin-bottom: 8mm; }
.T .main { padding: 22mm 14mm 12mm 10mm; }
.T .nm { font-weight: 500; font-size: 2.6em; text-transform: uppercase; letter-spacing: .06em; color: var(--accent); }
.T .jt { letter-spacing: .3em; text-transform: uppercase; font-size: .78em; color: #666; margin: 1em 0 9mm; font-family: var(--f-body); }
.T .sec-t { font-family: var(--f-body); font-weight: 500; letter-spacing: .25em; font-size: .88em; color: var(--accent); }
.T .ct { font-size: .86em; }
.T .ct-ic { color: var(--accent); }
.T .en-left { grid-template-columns: 22mm 1fr; }
.T .en-t { font-size: .95em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="main pad" style={{ gridColumn: 2, gridRow: 1 }}><Name c={c} /><JobTitle c={c} />{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'left' }} /></div>
          <div className="side pad" style={{ gridColumn: 1, gridRow: 1 }}><Photo c={c} shape="square" /><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'checks', langs: 'list', interests: 'bullets' }} /></div>
        </>
      );
    },
  },

  {
    id: 'chapada', name: 'Chapada', refs: ['modelo-27'], desc: 'Faixa lilás acinzentada, títulos com ícones e barra lateral.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno'], accent: '#5b5b7a', palette: ['#5b5b7a', '#3d6b7a', '#7a5b6b', '#5b7a5f'],
    fonts: { head: 'lora', body: 'opensans' }, aside: ['education', 'languages', 'skills', 'interests', 'courses'],
    css: `
.T { display: grid; grid-template-columns: 62mm 1fr; }
.T .bg { width: 62mm; background: #ececf2; }
.T .hd { grid-column: 1 / 3; background: #dedee8; display: grid; grid-template-columns: 62mm 1fr; align-items: center; padding: 8mm 14mm 8mm 0; }
.T .hd .ph { width: 32mm; height: 32mm; margin: 0 auto; border: 2mm solid #fff; }
.T .nm { font-size: 2.2em; }
.T .jt { font-family: var(--f-body); color: #555; margin-top: .3em; font-size: 1em; }
.T .side { padding: 8mm 7mm 12mm 10mm; }
.T .main { padding: 8mm 14mm 12mm 9mm; }
.T .sec-t { font-family: var(--f-body); font-weight: 800; letter-spacing: .12em; font-size: .95em; color: #333; }
.T .sec-ic { width: 1.6em; height: 1.6em; border-radius: 50%; background: var(--accent); color: #fff; justify-content: center; align-items: center; font-size: .75em; }
.T .ct { font-size: .85em; }
.T .lv-bar { background: #d4d4de; }
.T .en-t { font-size: .95em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <header className="hd">{c.hasPhoto ? <Photo c={c} /> : <div />}<div><Name c={c} /><JobTitle c={c} /></div></header>
          <div className="side pad"><ContactSec c={c} o={{ icons: true }} /><Secs c={c} list={aside} o={{ icons: true, skills: 'bars', langs: 'bars', entry: 'top' }} /></div>
          <div className="main pad">{sum ? <Sec c={c} s={sum} o={{ icons: true }} /> : null}<Secs c={c} list={main} o={{ icons: true, entry: 'sub' }} /></div>
        </>
      );
    },
  },

  {
    id: 'pelourinho', name: 'Pelourinho', refs: ['modelo-28', 'modelo-53'], desc: '"Olá," gigante na vertical, visual editorial em preto.',
    photo: 'yes', ats: 'baixa', cols: 2, tags: ['criativo', 'com foto'], accent: '#111111', palette: ['#111111', '#c2185b', '#00695c', '#283593'],
    fonts: { head: 'archivo', body: 'dmsans' }, aside: ['skills', 'languages', 'interests'],
    css: `
.T { padding: 12mm 14mm 13mm 0; display: grid; grid-template-columns: 26mm 62mm 1fr; gap: 0 7mm; }
.T .hello { grid-row: 1; writing-mode: vertical-rl; transform: rotate(180deg); font-family: var(--f-head); font-weight: 900; font-size: 5em; line-height: 1; text-align: right; padding-top: 4mm; }
.T .ph { width: 62mm; height: 74mm; }
.T .who { align-self: end; }
.T .nm { font-size: 1.5em; font-weight: 800; margin-bottom: 3mm; }
.T .ct { font-size: .9em; }
.T .jt { font-weight: 800; margin-top: 7mm; font-size: .95em; }
.T .side { grid-column: 2; padding-top: 9mm; }
.T .main { grid-column: 3; padding-top: 9mm; }
.T .sec-t { text-transform: none; letter-spacing: 0; font-size: 1.35em; font-weight: 800; }
.T .lv-bar { background: #e0e0e0; height: .6em; border-radius: 0; flex-basis: 45%; }
.T .lv-bar i { border-radius: 0; }
.T .lv-columns { list-style: none; padding: 0; font-size: .92em; }
.T .en-t { font-size: 1.05em; font-weight: 800; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <div className="hello" aria-hidden>{{ pt: 'Olá,', en: 'Hello,', es: 'Hola,' }[c.lang]}</div>
          {c.hasPhoto ? <Photo c={c} shape="square" /> : <div />}
          <div className="who"><Name c={c} /><Contacts c={c} variant="plain" /><JobTitle c={c} /></div>
          <div className="side"><Secs c={c} list={aside} o={{ skills: 'columns', langs: 'bars' }} /></div>
          <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
        </>
      );
    },
  },

  {
    id: 'copacabana', name: 'Copacabana', refs: ['modelo-29'], desc: '"CURRÍCULO" em letras enormes, fundo areia e nome no rodapé.',
    photo: 'yes', ats: 'baixa', cols: 2, tags: ['criativo', 'com foto'], accent: '#1c1c1c', palette: ['#1c1c1c', '#7f1d1d', '#1e3a8a', '#365314'],
    fonts: { head: 'anton', body: 'archivo' }, aside: ['education', 'skills', 'languages', 'references', 'interests', 'courses'],
    css: `
.T { padding: 12mm 14mm 12mm; }
.T .bg { width: 100%; background: #e9e6df; }
.T .tops { display: grid; grid-template-columns: repeat(3, 1fr); font-size: .78em; text-transform: uppercase; margin-bottom: 5mm; }
.T .tops > :last-child { text-align: right; }
.T .tops b { display: block; }
.T .hd { display: grid; grid-template-columns: 1fr 52mm; gap: 6mm; align-items: end; }
.T .big { font-family: var(--f-head); font-size: 6.6em; line-height: .9; text-transform: uppercase; color: var(--accent); }
.T .sub { display: flex; justify-content: space-between; margin-top: 2mm; text-transform: uppercase; font-size: .85em; }
.T .sub .nm { font-family: var(--f-body); font-size: 1em; font-weight: 400; }
.T .sub .jt { font-family: var(--f-body); }
.T .ph { width: 52mm; height: 62mm; }
.T .sum { text-transform: uppercase; margin: 7mm 0 7mm; font-size: .95em; max-width: 120mm; }
.T .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
.T .sec-t { font-family: var(--f-head); font-weight: 400; font-size: 1.6em; letter-spacing: 0; }
.T .en-t { text-transform: uppercase; }
.T .en-d { font-style: italic; }
.T .lv-tags li { border: 1px solid #222; background: transparent; padding: .25em .9em; }
.T .lv-tags li:nth-child(3n+1) { background: #222; color: #fff; }
.T .lv-pips i { background: transparent; border: 1px solid #222; }
.T .lv-pips i.on { background: #222; }
.T .foot { font-family: var(--f-head); font-size: 5.6em; line-height: 1; text-transform: uppercase; margin-top: 8mm; text-align: center; word-spacing: .3em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="tops"><div><b>E-mail</b>{c.p.email}</div><div><b>{{ pt: 'Telefone', en: 'Phone', es: 'Teléfono' }[c.lang]}</b>{c.p.phone}</div><div><b>{{ pt: 'Endereço', en: 'Address', es: 'Dirección' }[c.lang]}</b>{c.p.location}</div></div>
          <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr' }}>
            <div>
              <div className="big" aria-hidden>{{ pt: 'Currículo', en: 'Resume', es: 'Currículum' }[c.lang]}</div>
              <div className="sub"><JobTitle c={c} /><Name c={c} tag="div" /></div>
            </div>
            <Photo c={c} shape="square" />
          </header>
          <SummaryText c={c} s={sum} />
          <div className="cols">
            <div><Secs c={c} list={main} o={{ entry: 'sub', orgFirst: true }} /></div>
            <div><Secs c={c} list={aside} o={{ skills: 'tags', langs: 'dots', entry: 'sub' }} /><Contacts c={c} keys={['website', 'linkedin', 'github']} variant="plain" /></div>
          </div>
          <div className="foot fit" aria-hidden>{c.p.name}</div>
        </>
      );
    },
  },

  {
    id: 'alter-do-chao', name: 'Alter do Chão', refs: ['modelo-30'], desc: '"Olá!" manuscrito em azul, linha do tempo e fundo rosado.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'criativo'], accent: '#1f4fd1', palette: ['#1f4fd1', '#d1495b', '#00798c', '#6a4c93'],
    fonts: { head: 'dmsans', body: 'dmsans' }, aside: ['education', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 14mm 14mm 13mm; display: grid; grid-template-columns: 58mm 1fr; gap: 0 9mm; }
.T .bg { width: 100%; background: linear-gradient(160deg, #fdf6f3, #fbeee9); }
.T .ph { width: 58mm; height: 64mm; border-radius: 5mm; margin-bottom: 7mm; }
.T .nm { font-size: 1.5em; color: var(--accent); }
.T .jt { color: #555; margin: .3em 0 5mm; }
.T .ct-ic { color: var(--accent); }
.T .ct { font-size: .88em; }
.T .hello { font-family: 'Caveat Variable', cursive; font-size: 4.2em; color: var(--accent); line-height: 1; margin-bottom: 3mm; }
.T .sum { text-align: justify; margin-bottom: 7mm; }
.T .sec-t { color: var(--accent); font-weight: 800; font-size: 1.05em; letter-spacing: .02em; }
.T .side .ens, .T .side .lv { border-left: 1.5px solid var(--accent); padding-left: 3mm; }
.T .side .lv-bullets { list-style: none; }
.T .side .lv-bullets li { color: var(--accent); font-weight: 600; }
.T .en-left { grid-template-columns: 22mm 1fr; gap: 0 6mm; position: relative; }
.T .main .ens { position: relative; }
.T .main .ens::before { content: ''; position: absolute; left: 24.5mm; top: .3em; bottom: 0; width: 1.5px; background: var(--accent); }
.T .en-left .en-d { color: var(--accent); font-weight: 700; }
.T .en-t { color: var(--accent); }
.T .en-o { font-style: italic; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="side"><Photo c={c} shape="rounded" /><Name c={c} /><JobTitle c={c} /><Contacts c={c} /><div style={{ height: '6mm' }} /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'sub' }} /></div>
          <div className="main"><div className="hello" aria-hidden>{{ pt: 'Olá!', en: 'Hello!', es: '¡Hola!' }[c.lang]}</div><SummaryText c={c} s={sum} /><Secs c={c} list={main} o={{ entry: 'left' }} /></div>
        </>
      );
    },
  },

  {
    id: 'jericoacoara', name: 'Jericoacoara', refs: ['modelo-31'], desc: 'Caixas em grade, estrelinhas e habilidades em anéis.',
    photo: 'yes', ats: 'baixa', cols: 2, tags: ['criativo', 'com foto'], accent: '#2a2a2a', palette: ['#2a2a2a', '#8d5524', '#3d5a80', '#6a994e'],
    fonts: { head: 'bebas', body: 'worksans' }, aside: ['skills', 'languages', 'interests'],
    css: `
.T { padding: 12mm; }
.T .bg { width: 100%; background: #f4f0e8; }
.T .box { border: 1px solid #333; }
.T .grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #333; }
.T .grid > * { border: .5px solid #333; padding: 5mm; }
.T .hd { grid-column: 1 / 3; display: grid; grid-template-columns: 62mm 1fr; padding: 0 !important; }
.T .hd .ph { width: 62mm; height: 72mm; border-right: 1px solid #333; }
.T .who { padding: 6mm; position: relative; }
.T .nm { font-size: 3.6em; font-weight: 400; letter-spacing: .02em; line-height: .95; }
.T .jt { font-family: var(--f-body); font-weight: 700; text-transform: uppercase; font-size: .85em; margin: 1mm 0 4mm; }
.T .star { position: absolute; right: 6mm; top: 5mm; color: #333; }
.T .sec-t { font-family: var(--f-head); font-weight: 400; font-size: 1.7em; letter-spacing: .02em; }
.T .en-left { grid-template-columns: 18mm 1fr; }
.T .lv-ring .fl { stroke: #333; }
.T .lv-ring .tr { stroke: #ddd; }
.T .full { grid-column: 1 / 3; }
.T .ct { font-size: .85em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      const all = [...aside, ...main];
      return (
        <>
          <Bg />
          <div className="grid">
            <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr' }}>
              <Photo c={c} shape="square" />
              <div className="who"><span className="star" aria-hidden><Icon name="sparkles" size="2.2em" stroke={1.4} /></span><Name c={c} split /><JobTitle c={c} /><SummaryText c={c} s={sum} /></div>
            </header>
            {all.map((s, i) => <div key={s.id} className={all.length % 2 === 1 && i === all.length - 1 ? 'full' : ''}><Sec c={c} s={s} o={{ skills: 'circles', langs: 'bars', entry: 'left' }} /></div>)}
            <div className="full"><ContactSec c={c} variant="labels" /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'itacare', name: 'Itacaré', refs: ['modelo-32'], desc: 'Sobrenome em destaque, títulos com "+" e foto em retrato.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno'], accent: '#2b2b2b', palette: ['#2b2b2b', '#1d3557', '#6d2e46', '#2d6a4f'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['skills', 'languages', 'interests', 'references'],
    css: `
.T { padding: 15mm 15mm 13mm; }
.T .bg { width: 100%; background: #ececec; }
.T .hd { display: grid; grid-template-columns: 1fr auto; gap: 8mm; }
.T .nm { font-weight: 300; font-size: 1.9em; letter-spacing: .2em; text-transform: uppercase; }
.T .nm-last { display: block; font-weight: 900; font-size: 2.2em; letter-spacing: .02em; line-height: 1; }
.T .jt { font-weight: 700; letter-spacing: .3em; text-transform: uppercase; margin: 6mm 0 3mm; font-size: 1.1em; }
.T .ct { font-size: .88em; }
.T .cols { display: grid; grid-template-columns: 1fr 52mm; gap: 10mm; }
.T .side .ph { width: 52mm; height: 62mm; margin: -6mm 0 9mm; }
.T .sec-t { letter-spacing: .3em; font-size: 1.1em; border-bottom: 1px solid #999; padding-bottom: .4em; }
.T .main .sec-t::after { content: '+'; margin-left: auto; font-weight: 300; font-size: 1.3em; line-height: .8; }
.T .en-t { font-size: 1em; }
.T .en-o { font-weight: 600; color: #333; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <header className="hd"><div><Name c={c} split /><JobTitle c={c} /></div><Contacts c={c} variant="icons" /></header>
          <div className="cols">
            <div className="main"><SummaryText c={c} s={sum} /><div style={{ height: '8mm' }} /><Secs c={c} list={main} o={{ entry: 'stack', orgFirst: false }} /></div>
            <div className="side"><Photo c={c} shape="square" /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'bullets' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'buzios', name: 'Búzios', refs: ['modelo-33'], desc: 'Papel creme, nome enorme e uma linha vertical marcante.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'impacto'], accent: '#111111', palette: ['#111111', '#7c2d12', '#1e3a8a', '#14532d'],
    fonts: { head: 'inter', body: 'inter' }, aside: ['languages', 'interests'],
    css: `
.T { padding: 16mm 15mm 13mm; }
.T .bg { width: 100%; background: linear-gradient(#222, #222) calc(15mm + 112mm) 0 / 1px 100% no-repeat, #fdfbf2; }
.T .hd { display: grid; grid-template-columns: 112mm 1fr; padding-bottom: 6mm; border-bottom: 1px solid #222; margin-bottom: 7mm; }
.T .nm { font-size: 3.6em; font-weight: 800; letter-spacing: -.03em; line-height: .98; }
.T .nm-last { display: block; }
.T .jt { padding-left: 7mm; font-size: 1.5em; font-weight: 800; line-height: 1.1; letter-spacing: -.02em; }
.T .cols { display: grid; grid-template-columns: 112mm 1fr; }
.T .main { padding-right: 7mm; }
.T .side { padding-left: 7mm; }
.T .side .ph { width: 100%; height: 56mm; margin: 30mm 0 10mm; }
.T .sec-t { text-transform: none; letter-spacing: -.01em; font-size: 1.55em; font-weight: 700; }
.T .en-t { font-weight: 700; }
.T .en-o { font-weight: 700; color: #111; }
.T .ct-labels .ct-l { font-weight: 800; }
.T .ct-labels li { margin-bottom: .8em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <header className="hd"><Name c={c} split /><JobTitle c={c} /></header>
          <div className="cols">
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub', orgFirst: true, skills: 'plain' }} /></div>
            <div className="side"><Photo c={c} shape="square" /><Contacts c={c} variant="labels" /><div style={{ height: '6mm' }} /><Secs c={c} list={aside} o={{ langs: 'list', interests: 'bullets' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'ilhabela', name: 'Ilhabela', refs: ['modelo-35'], desc: 'Foto no alto da coluna estreita e nome serifado espaçado.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#333333', palette: ['#333333', '#5c4b3b', '#3b4f5c', '#4b5c3b'],
    fonts: { head: 'bodoni', body: 'opensans' }, aside: ['education', 'languages', 'skills', 'interests', 'courses'],
    css: `
.T { padding: 0 15mm 13mm 0; display: grid; grid-template-columns: 62mm 1fr; }
.T .bg { left: 62mm; width: 1px; background: #ddd; }
.T .side { padding: 13mm 7mm 0 12mm; }
.T .side .ph { width: 43mm; height: 50mm; margin-bottom: 8mm; }
.T .main { padding: 17mm 0 0 9mm; }
.T .nm { font-weight: 400; font-size: 2.3em; letter-spacing: .2em; text-transform: uppercase; line-height: 1.25; }
.T .nm-last { display: block; }
.T .jt { letter-spacing: .3em; text-transform: uppercase; font-size: .78em; color: #666; margin: 3mm 0 9mm; padding-top: 3mm; border-top: 1px solid #ddd; font-family: var(--f-body); }
.T .sec-t { font-family: var(--f-body); letter-spacing: .1em; font-weight: 800; font-size: .95em; }
.T .side .sec-t { font-size: .8em; }
.T .side { font-size: .92em; }
.T .en-stack .en-d { font-weight: 700; color: #222; }
.T .en-t { text-transform: uppercase; font-size: .88em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="main pad" style={{ gridColumn: 2, gridRow: 1 }}><Name c={c} split /><JobTitle c={c} />{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'left', duration: true }} /></div>
          <div className="side pad" style={{ gridColumn: 1, gridRow: 1 }}><Photo c={c} shape="square" /><ContactSec c={c} variant="plain" /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
        </>
      );
    },
  },

  {
    id: 'campos', name: 'Campos do Jordão', refs: ['modelo-36'], desc: 'Foto grande e redonda, tons de areia e assinatura.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#a88f78', palette: ['#a88f78', '#8f9c8a', '#8a8fa8', '#b38a7a'],
    fonts: { head: 'raleway', body: 'raleway' }, aside: ['languages', 'interests', 'skills'],
    css: `
.T { display: grid; grid-template-columns: 70mm 1fr; }
.T .bg { width: 70mm; background: #f1ede8; }
.T .side { padding: 12mm 7mm 12mm 10mm; }
.T .side .ph { width: 52mm; height: 52mm; margin: 0 auto 9mm; }
.T .main { padding: 14mm 14mm 12mm 0; }
.T .hd { padding: 0 0 6mm 9mm; border-bottom: 1px solid #c9bfb4; margin-bottom: 8mm; }
.T .nm { font-weight: 300; font-size: 3.1em; letter-spacing: .14em; text-transform: uppercase; line-height: 1.1; }
.T .nm-last { display: block; color: var(--accent); }
.T .body { padding-left: 9mm; }
.T .sec-t { font-weight: 400; letter-spacing: .3em; color: var(--accent); font-size: 1.05em; }
.T .ct-ic { color: var(--accent); }
.T .ct { font-size: .9em; }
.T .en-t { text-transform: uppercase; letter-spacing: .1em; font-size: .85em; font-weight: 500; }
.T .lv-pips i { background: #ddd2c7; }
.T .sig { margin-top: 10mm; display: flex; justify-content: space-between; align-items: end; color: #555; }
.T .sig b { font-family: 'Great Vibes', cursive; font-weight: 400; font-size: 2.2em; color: #555; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      const today = new Date().toLocaleDateString({ pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[c.lang]);
      return (
        <>
          <Bg />
          <div className="main pad" style={{ gridColumn: 2, gridRow: 1 }}>
            <header className="hd"><Name c={c} split /><JobTitle c={c} /></header>
            <div className="body">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} />
              {c.p.name ? <div className="sig"><span>{c.p.location ? `${c.p.location}, ` : ''}{today}</span><b>{c.p.name}</b></div> : null}</div>
          </div>
          <div className="side pad" style={{ gridColumn: 1, gridRow: 1 }}><Photo c={c} /><ContactSec c={c} /><Secs c={c} list={aside} o={{ langs: 'dots', skills: 'dots', interests: 'bullets' }} /></div>
        </>
      );
    },
  },

  {
    id: 'noronha', name: 'Noronha', refs: ['modelo-37', 'modelo-50'], desc: 'Foto em bloco preto com curva e nome serifado.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#111111', palette: ['#111111', '#3a2e39', '#1e3d58', '#3e4a3d'],
    fonts: { head: 'cormorant', body: 'opensans' }, aside: ['languages', 'skills', 'interests'],
    css: `
.T { display: grid; grid-template-columns: 66mm 1fr; }
.T .bg { left: 66mm; width: 1px; background: #ccc; }
.T .pw { height: 74mm; background: var(--accent); border-bottom-right-radius: 34mm; overflow: hidden; margin-bottom: 8mm; }
.T .pw .ph { width: 100%; height: 100%; border-radius: 0; }
.T .side { padding: 0 7mm 12mm 0; }
.T .side .sec, .T .side .ctw { padding-left: 11mm; }
.T .hd { background: #efefef; margin-top: 14mm; padding: 9mm 14mm 7mm 9mm; }
.T .nm { font-weight: 400; font-size: 3em; letter-spacing: .14em; text-transform: uppercase; line-height: 1.1; }
.T .nm-last { display: block; }
.T .jt { letter-spacing: .35em; text-transform: uppercase; font-size: .78em; color: #666; margin-top: 4mm; font-family: var(--f-body); }
.T .main { padding: 8mm 14mm 12mm 9mm; }
.T .sec-t { font-family: var(--f-body); font-weight: 400; letter-spacing: .3em; font-size: .92em; }
.T .ct-ic { color: #111; }
.T .ct { font-size: .86em; }
.T .en-t { text-transform: uppercase; font-size: .86em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div style={{ gridColumn: 2, gridRow: 1 }}>
            <header className="hd"><Name c={c} split /><JobTitle c={c} /></header>
            <div className="main pad">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
          <div className="side pad" style={{ gridColumn: 1, gridRow: 1 }}>
            {c.hasPhoto ? <div className="pw"><Photo c={c} shape="square" /></div> : <div style={{ height: '14mm' }} />}
            <div className="ctw"><ContactSec c={c} /></div>
            <Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list' }} />
          </div>
        </>
      );
    },
  },

  {
    id: 'lencois', name: 'Lençóis', refs: ['modelo-38', 'modelo-60'], desc: 'Nome serifado numa faixa cinza e foto redonda.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'clássico'], accent: '#3c3c3c', palette: ['#3c3c3c', '#2b4c6f', '#6f3b2b', '#3b6f4c'],
    fonts: { head: 'playfair', body: 'opensans' }, aside: ['education', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { display: grid; grid-template-columns: 60mm 1fr; }
.T .bg { width: 60mm; background: #f4f4f4; }
.T .hd { grid-column: 1 / 3; display: grid; grid-template-columns: 60mm 1fr; align-items: center; padding-top: 12mm; }
.T .hd .ph { width: 36mm; height: 36mm; margin: 0 auto; }
.T .band { background: #e8e8e8; padding: 7mm 12mm 6mm 9mm; }
.T .nm { font-size: 2.7em; font-weight: 500; }
.T .jt { letter-spacing: .3em; text-transform: uppercase; font-size: .76em; color: #666; margin-top: 2mm; font-family: var(--f-body); }
.T .side { padding: 9mm 6mm 12mm 9mm; }
.T .main { padding: 9mm 13mm 12mm 9mm; }
.T .sec-t { font-family: var(--f-body); font-weight: 800; letter-spacing: .12em; font-size: .9em; border-bottom: 1px solid #ccc; padding-bottom: .4em; }
.T .ct { font-size: .85em; }
.T .en-t { font-size: .92em; text-transform: uppercase; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <header className="hd">{c.hasPhoto ? <Photo c={c} /> : <div />}<div className="band"><Name c={c} /><JobTitle c={c} /></div></header>
          <div className="side pad"><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
          <div className="main pad">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
        </>
      );
    },
  },
];
