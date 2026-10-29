// Modelos 1–13. Cada um se inspira numa imagem da pasta modelos/ (campo refs).
import { Bg, Contacts, ContactSec, JobTitle, Name, Photo, Sec, Secs, SummaryText, type TemplateDef } from './engine';

export const setA: TemplateDef[] = [
  {
    id: 'ipanema', name: 'Ipanema', refs: ['modelo-01'], desc: 'Clássico de uma coluna com datas à esquerda. Ótimo para ATS.',
    photo: 'no', ats: 'alta', cols: 1, tags: ['sem foto', 'clássico'], accent: '#2b2b2b', palette: ['#2b2b2b', '#1f3a5f', '#6b4f3a', '#2f5d50'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['skills', 'languages', 'interests', 'references', 'awards'],
    css: `
.T { padding: 15mm 16mm 14mm; }
.T .hd { display: grid; grid-template-columns: 1fr auto; gap: 8mm; align-items: start; padding-bottom: 6mm; }
.T .nm { font-size: 2.9em; text-transform: uppercase; letter-spacing: .03em; color: var(--accent); }
.T .nm-last { display: block; }
.T .jt { margin-top: .7em; font-size: .9em; letter-spacing: .14em; text-transform: uppercase; font-weight: 600; color: #555; }
.T .ct { font-size: .88em; color: #444; margin-top: .3em; }
.T .ct-ic { color: var(--accent); }
.T .sec { border-top: 1px solid var(--line); padding-top: 4.5mm; position: relative; }
.T .sec::before { content: ''; position: absolute; top: -1px; left: 0; width: 9mm; height: 2px; background: var(--accent); }
.T .sec-t { font-size: 1em; letter-spacing: .16em; color: var(--accent); }
.T .en-left { grid-template-columns: 30mm 1fr; }
.T .en-d { font-weight: 600; color: #444; }
.T .en-t { text-transform: uppercase; font-size: .95em; letter-spacing: .03em; }
.T .two { display: grid; grid-template-columns: 1fr 1fr; column-gap: 10mm; }
.T .two .sec { break-inside: avoid; }
.T .lv-bar { background: #e6e6e6; height: .3em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd">
            <div><Name c={c} split /><JobTitle c={c} /></div>
            <Contacts c={c} variant="icons" />
          </header>
          {sum ? <Sec c={c} s={sum} /> : null}
          <Secs c={c} list={main} o={{ entry: 'left' }} />
          {aside.length ? <div className="two"><Secs c={c} list={aside} o={{ skills: 'bars', langs: 'list', entry: 'stack' }} /></div> : null}
        </>
      );
    },
  },

  {
    id: 'vila-madalena', name: 'Vila Madalena', refs: ['modelo-02'], desc: 'Criativo, com "Olá," vertical e fundo quadriculado.',
    photo: 'yes', ats: 'baixa', cols: 2, tags: ['criativo', 'com foto'], accent: '#111111', palette: ['#111111', '#d6336c', '#1c7ed6', '#2b8a3e'],
    fonts: { head: 'archivoblack', body: 'dmsans' }, aside: ['skills', 'languages', 'interests', 'references'],
    css: `
.T { display: grid; grid-template-columns: 22mm 58mm 1fr; padding: 0 12mm 12mm 0; }
.T .bg { width: 100%; background-image: linear-gradient(#ececec 1px, transparent 1px), linear-gradient(90deg, #ececec 1px, transparent 1px); background-size: 6mm 6mm; }
.T .hello { grid-column: 1; grid-row: 1 / span 2; writing-mode: vertical-rl; transform: rotate(180deg); font-family: var(--f-head); font-size: 5.4em; line-height: 1; color: var(--accent); padding: 10mm 0 0 0; text-align: right; align-self: start; height: 120mm; }
.T .top { grid-column: 2 / 4; display: grid; grid-template-columns: 58mm 1fr; padding-top: 12mm; gap: 0 8mm; }
.T .ph { width: 52mm; height: 62mm; }
.T .who { padding-top: 4mm; }
.T .hi { font-family: var(--f-head); font-size: 2.1em; line-height: 1.1; }
.T .nm { font-size: 1.15em; font-family: var(--f-body); font-weight: 700; margin-top: .3em; }
.T .jt { font-family: var(--f-body); color: #666; margin-bottom: 4mm; }
.T .ct { font-size: .88em; }
.T .ct-ic { color: var(--accent); }
.T .side { grid-column: 2; padding-top: 8mm; padding-right: 4mm; }
.T .main { grid-column: 3; padding-top: 8mm; padding-left: 4mm; }
.T .sec-t { font-family: var(--f-body); font-size: 1em; letter-spacing: .05em; }
.T .sec-t::before { content: ''; width: 1.8em; height: .55em; background: var(--accent); display: inline-block; }
.T .lv-bar { background: transparent; height: .55em; flex-basis: 45%; border-radius: 0; }
.T .lv-bar i { border-radius: 0; }
.T .en-t { font-size: .98em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      const hi = { pt: 'Olá,', en: 'Hello,', es: 'Hola,' }[c.lang];
      return (
        <>
          <Bg />
          <div className="hello" aria-hidden>{hi}</div>
          <header className="top">
            <Photo c={c} shape="square" />
            <div className="who">
              <div className="hi">{{ pt: 'olá! eu sou', en: "hello! I'm", es: '¡hola! soy' }[c.lang]}</div>
              <Name c={c} /><JobTitle c={c} />
              <Contacts c={c} />
            </div>
          </header>
          <div className="side pad"><Secs c={c} list={aside} o={{ skills: 'bars', langs: 'list' }} /></div>
          <div className="main pad">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
        </>
      );
    },
  },

  {
    id: 'paulista', name: 'Paulista', refs: ['modelo-03'], desc: 'Nome espaçado, faixa com o cargo e linha vertical marcando as seções.',
    photo: 'no', ats: 'media', cols: 2, tags: ['sem foto', 'moderno'], accent: '#111111', palette: ['#111111', '#264653', '#7f5539', '#5f3dc4'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['skills', 'languages', 'education', 'interests', 'courses'],
    css: `
.T { padding: 16mm 14mm 14mm 20mm; }
.T .bg { left: 13mm; width: 1px; background: #222; }
.T .nm { font-weight: 300; font-size: 2.6em; letter-spacing: .5em; text-transform: uppercase; line-height: 1.3; }
.T .nm-last { display: block; font-weight: 800; }
.T .band { display: grid; grid-template-columns: 1fr auto; align-items: stretch; margin: 6mm 0 9mm -7mm; }
.T .band .jt { border: 1.5px solid #222; border-left: 0; padding: .7em 1em .7em 7mm; letter-spacing: .45em; text-transform: uppercase; font-weight: 600; font-size: .95em; display: flex; align-items: center; gap: 1em; }
.T .band .jt::before { content: ''; width: .55em; height: .55em; border-radius: 50%; background: #222; margin-left: -8.5mm; flex: none; }
.T .band .ct { margin: 0; padding-left: 4mm; border-left: 5px solid var(--accent); font-size: .85em; display: flex; flex-direction: column; justify-content: center; }
.T .band .ct li { margin: .1em 0; }
.T .cols { display: grid; grid-template-columns: 1fr 52mm; gap: 10mm; }
.T .sec-t { font-size: 1.05em; letter-spacing: .3em; position: relative; }
.T .main .sec-t::before { content: ''; position: absolute; left: -7.6mm; width: 2.2mm; height: 2.2mm; border-radius: 50%; background: #222; }
.T .en-s { text-transform: uppercase; font-size: .82em; letter-spacing: .08em; }
.T .en-t { font-size: .9em; text-transform: uppercase; letter-spacing: .06em; }
.T .side .en { padding-left: 3mm; border-left: 2px solid #222; }
.T .lv-bullets { list-style: none; padding: 0; }
.T .lv-bullets li::before { content: '•'; margin-right: .6em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <Name c={c} split />
          <div className="band">{c.p.title ? <JobTitle c={c} /> : <div />}<Contacts c={c} variant="plain" /></div>
          <div className="cols">
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'stack', orgFirst: true }} /></div>
            <div className="side"><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'sub' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'gramado', name: 'Gramado', refs: ['modelo-04'], desc: 'Sóbrio, com foto redonda, linha do tempo e assinatura.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#5c5c5c', palette: ['#5c5c5c', '#2f4858', '#7a5c3e', '#3d5a40'],
    fonts: { head: 'raleway', body: 'lato' }, aside: ['skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 16mm 15mm 14mm; color: #3c3c3c; }
.T .hd { display: grid; grid-template-columns: 1fr 34mm; gap: 8mm; align-items: center; padding-bottom: 6mm; border-bottom: 1px solid #cfcfcf; margin-bottom: 9mm; }
.T .nm { font-weight: 400; font-size: 2.5em; letter-spacing: .32em; text-transform: uppercase; color: #555; line-height: 1.25; }
.T .nm-last { display: block; }
.T .jt { margin-top: 1em; letter-spacing: .3em; text-transform: uppercase; font-size: .82em; color: #777; }
.T .ph { width: 34mm; height: 34mm; }
.T .cols { display: grid; grid-template-columns: 50mm 1fr; gap: 9mm; }
.T .sec-t { font-family: var(--f-head); font-weight: 500; font-size: .92em; letter-spacing: .3em; color: #666; }
.T .ct { font-size: .88em; }
.T .ct-ic { color: #777; }
.T .main { border-left: 1px solid #cfcfcf; padding-left: 8mm; }
.T .main .sec-t { margin-left: -8mm; padding-left: 8mm; position: relative; }
.T .main .sec-t::before { content: ''; position: absolute; left: -1.3mm; top: .25em; width: 2.6mm; height: 2.6mm; border: 1px solid #999; border-radius: 50%; background: #fff; }
.T .en-t { text-transform: uppercase; font-size: .88em; letter-spacing: .06em; }
.T .en-s { font-size: .9em; }
.T .lv-list li { display: block; }
.T .lv-list .lv-lb { display: inline; margin-left: .4em; }
.T .lv-list .lv-lb::before { content: '('; } .T .lv-list .lv-lb::after { content: ')'; }
.T .sig { margin-top: 10mm; text-align: right; color: #777; font-size: .9em; }
.T .sig b { display: block; font-family: 'Great Vibes', cursive; font-weight: 400; font-size: 2.4em; color: #333; line-height: 1.2; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      const today = new Date().toLocaleDateString({ pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[c.lang]);
      return (
        <>
          <header className="hd"><div><Name c={c} split /><JobTitle c={c} /></div><Photo c={c} /></header>
          <div className="cols">
            <div className="side"><ContactSec c={c} /><Secs c={c} list={aside} o={{ langs: 'list', skills: 'bullets' }} /></div>
            <div className="main">
              {sum ? <Sec c={c} s={sum} /> : null}
              <Secs c={c} list={main} o={{ entry: 'sub' }} />
              {c.p.name ? <div className="sig">{c.p.location ? `${c.p.location}, ` : ''}{today}<b>{c.p.name}</b></div> : null}
            </div>
          </div>
        </>
      );
    },
  },

  {
    id: 'pinheiros', name: 'Pinheiros', refs: ['modelo-05', 'modelo-43'], desc: 'Nome condensado, foto com bloco de cor e linha divisória.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno'], accent: '#d9a63a', palette: ['#d9a63a', '#222222', '#c2410c', '#0f766e'],
    fonts: { head: 'oswald', body: 'opensans' }, aside: ['skills', 'languages', 'education', 'interests', 'courses'],
    css: `
.T { padding: 14mm 14mm 13mm; }
.T .hd { display: grid; grid-template-columns: 1fr 46mm; gap: 8mm; align-items: end; margin-bottom: 8mm; }
.T .nm { font-size: 3em; text-transform: uppercase; font-weight: 500; letter-spacing: .02em; }
.T .jt { font-family: var(--f-body); letter-spacing: .3em; text-transform: uppercase; font-size: .78em; color: #666; margin-top: .8em; }
.T .pw { position: relative; height: 50mm; }
.T .pw::before { content: ''; position: absolute; left: -5mm; top: 6mm; width: 30mm; height: 44mm; background: var(--accent); }
.T .ph { position: absolute; right: 0; top: 0; width: 40mm; height: 48mm; }
.T .cols { display: grid; grid-template-columns: 54mm 1fr; }
.T .side { padding-right: 7mm; border-right: 1px solid #222; }
.T .main { padding-left: 7mm; }
.T .sec-t { font-size: 1.05em; letter-spacing: .25em; font-weight: 500; }
.T .ct-ic { color: var(--accent); }
.T .ct { font-size: .88em; }
.T .en-t { text-transform: uppercase; font-size: .88em; letter-spacing: .08em; }
.T .en-d { font-weight: 600; color: #333; }
.T .lv-bullets li::marker { color: var(--accent); }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd"><div><Name c={c} /><JobTitle c={c} /></div>{c.hasPhoto ? <div className="pw"><Photo c={c} shape="square" /></div> : <div />}</header>
          <div className="cols">
            <div className="side"><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'top' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'lapa', name: 'Lapa', refs: ['modelo-06'], desc: 'Faixa de destaque em cor viva e "Currículo" na vertical.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'criativo'], accent: '#c5e600', palette: ['#c5e600', '#ffd43b', '#4dabf7', '#ff8787'],
    fonts: { head: 'grotesk', body: 'dmsans' }, aside: ['skills', 'languages', 'education', 'interests', 'courses'],
    css: `
.T { padding: 14mm 14mm 13mm; }
.T .hd { display: grid; grid-template-columns: 10mm 38mm 1fr; gap: 0 5mm; align-items: end; }
.T .vt { writing-mode: vertical-rl; transform: rotate(180deg); font-family: var(--f-head); font-weight: 700; letter-spacing: .1em; font-size: 1.5em; border: 1.5px solid #111; padding: 2mm 1mm; align-self: stretch; text-align: center; text-transform: uppercase; }
.T .ph { width: 38mm; height: 46mm; background: #ddd; }
.T .nm { font-size: 2.6em; font-weight: 400; letter-spacing: -.01em; }
.T .nm-last { font-weight: 700; }
.T .hl { background: var(--accent); margin: 3mm -14mm 0 0; padding: 2.4mm 4mm; letter-spacing: .4em; text-transform: uppercase; font-size: .9em; }
.T .ct { margin-top: 3mm; font-size: .85em; }
.T .ct-inline .ct-v:first-child { font-weight: 600; }
.T .sum { margin: 7mm 0 8mm; padding-left: 4mm; border-left: 3px solid var(--accent); }
.T .cols { display: grid; grid-template-columns: 50mm 1fr; gap: 9mm; }
.T .sec-t { font-size: 1em; letter-spacing: .25em; }
.T .side .sec-t + * { font-size: .95em; }
.T .en-t { text-transform: uppercase; font-size: .9em; letter-spacing: .04em; }
.T .side .en-timeline::after { border-color: #111; background: #111; width: .5em; height: .5em; left: .08em; }
.T .lv-bullets { list-style: none; padding: 0; }
.T .lv-bullets li::before { content: '•'; color: #111; margin-right: .5em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      const word = { pt: 'Currículo', en: 'Resume', es: 'Currículum' }[c.lang];
      return (
        <>
          <header className="hd">
            <div className="vt" aria-hidden>{word}</div>
            {c.hasPhoto ? <Photo c={c} shape="square" /> : <div />}
            <div><Name c={c} split />{c.p.title ? <div className="hl jt">{c.p.title}</div> : null}<Contacts c={c} variant="inline" sep="   ·   " /></div>
          </header>
          <SummaryText c={c} s={sum} />
          <div className="cols">
            <div className="side"><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'timeline' }} /></div>
            <div className="main"><Secs c={c} list={main} o={{ entry: 'top' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'olinda', name: 'Olinda', refs: ['modelo-07'], desc: 'Nome enorme em letras condensadas ao lado da foto.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'impacto'], accent: '#1d1d1d', palette: ['#1d1d1d', '#9c2f2f', '#1e3a5f', '#4a5d23'],
    fonts: { head: 'anton', body: 'opensans' }, aside: ['skills', 'languages', 'interests'],
    css: `
.T { padding: 14mm 14mm 13mm; }
.T .hd { display: grid; grid-template-columns: 70mm 1fr; gap: 8mm; margin-bottom: 8mm; align-items: start; }
.T .ph { width: 70mm; height: 74mm; }
.T .nm { font-size: 5.4em; line-height: .95; text-transform: uppercase; font-weight: 400; color: var(--accent); }
.T .nm-last { display: block; }
.T .jt { font-family: var(--f-body); text-align: right; font-size: 1.4em; letter-spacing: .05em; text-transform: uppercase; margin-top: 2mm; }
.T .ct { margin-top: 6mm; font-size: .9em; }
.T .cols { display: grid; grid-template-columns: 70mm 1fr; gap: 8mm; }
.T .sec-t { font-family: var(--f-body); font-weight: 800; font-size: 1em; letter-spacing: .02em; border-bottom: 1.5px solid #222; padding-bottom: .3em; }
.T .en-t { font-size: .95em; }
.T .lv-bar { background: #e2e2e2; height: .28em; border-radius: 0; }
.T .lv-bar i { border-radius: 0; }
.T .lv-list li { justify-content: flex-start; gap: .4em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd">
            {c.hasPhoto ? <Photo c={c} shape="square" /> : null}
            <div style={c.hasPhoto ? undefined : { gridColumn: '1 / 3' }}><Name c={c} split /><JobTitle c={c} /><Contacts c={c} variant="icons" /></div>
          </header>
          <div className="cols">
            <div className="side">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={aside} o={{ skills: 'bars', langs: 'list' }} /></div>
            <div className="main"><Secs c={c} list={main} o={{ entry: 'stack' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'pampulha', name: 'Pampulha', refs: ['modelo-08'], desc: 'Barra lateral escura com foto redonda e linha do tempo.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'coluna escura'], accent: '#2f3542', palette: ['#2f3542', '#1b4332', '#4a1d3f', '#1e3a8a'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['skills', 'languages', 'education', 'interests', 'courses'],
    css: `
.T { display: grid; grid-template-columns: 66mm 1fr; }
.T .bg { width: 66mm; background: var(--accent); }
.T .side { padding: 14mm 8mm 12mm 10mm; color: #eef0f3; }
.T .main { padding: 16mm 14mm 12mm 10mm; }
.T .side .ph { width: 40mm; height: 40mm; margin: 0 auto 9mm; border: 2.5mm solid rgba(255,255,255,.95); }
.T .side .sec-t { color: #fff; border-bottom: 1px solid rgba(255,255,255,.4); padding-bottom: .4em; letter-spacing: .14em; font-size: 1em; }
.T .side .en-s, .T .side .en-d, .T .side .lv-lb { color: #c9cdd4; }
.T .side .lv-bar { background: rgba(255,255,255,.2); }
.T .side .lv-bar i { background: #fff; }
.T .side .ct-ic { color: #fff; }
.T .nm { font-size: 2.6em; letter-spacing: .06em; text-transform: uppercase; color: #2b2b2b; }
.T .jt { margin-top: .4em; letter-spacing: .2em; text-transform: uppercase; font-size: .9em; color: #666; font-weight: 600; }
.T .main .sum { margin: 5mm 0 8mm; color: #444; }
.T .main .sec-t { color: #2b2b2b; border-bottom: 1px solid #bbb; padding-bottom: .4em; letter-spacing: .14em; }
.T .main .en-timeline::after { border-color: #444; }
.T .main .sec-references .ens { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 8mm; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="main pad" style={{ gridColumn: 2, gridRow: 1 }}>
            <Name c={c} /><JobTitle c={c} /><SummaryText c={c} s={sum} />
            <Secs c={c} list={main} o={{ entry: 'timeline' }} />
          </div>
          <div className="side pad dark" style={{ gridColumn: 1, gridRow: 1 }}>
            <Photo c={c} />
            <ContactSec c={c} />
            <Secs c={c} list={aside} o={{ skills: 'bars', langs: 'list', entry: 'sub' }} />
          </div>
        </>
      );
    },
  },

  {
    id: 'tijuca', name: 'Tijuca', refs: ['modelo-09', 'modelo-34'], desc: 'Coluna escura com foto sangrando e nome sobreposto.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'coluna escura'], accent: '#2b2b2e', palette: ['#2b2b2e', '#243b55', '#3d2c2e', '#21412f'],
    fonts: { head: 'poppins', body: 'poppins' }, aside: ['languages', 'interests'],
    css: `
.T { display: grid; grid-template-columns: 64mm 1fr; }
.T .bg { width: 64mm; background: var(--accent); }
.T .side { color: #f1f1f1; padding: 0 0 12mm; }
.T .side .ph { width: 64mm; height: 72mm; border-radius: 0; }
.T .who { padding: 6mm 9mm 4mm; }
.T .nm { color: #fff; font-size: 2.2em; line-height: 1.05; }
.T .jt { color: #cfcfcf; font-size: .9em; margin-top: .3em; }
.T .side .sec { padding: 0 9mm; }
.T .side .sec-t { color: #fff; font-size: 1.15em; text-transform: none; letter-spacing: 0; font-weight: 600; }
.T .side .sec-t::after { content: ''; display: block; position: absolute; }
.T .side .ct { font-size: .85em; }
.T .side .ct-l { color: #fff; font-weight: 600; }
.T .side .ct-v { color: #cfcfcf; }
.T .side .lv-bar { background: rgba(255,255,255,.15); flex-basis: 50%; border-radius: 0; height: .5em; }
.T .side .lv-bar i { background: #fff; border-radius: 0; }
.T .side .lv-lb { color: #cfcfcf; }
.T .main { padding: 14mm 13mm 12mm 11mm; }
.T .main .sec-t { text-transform: none; letter-spacing: 0; font-size: 1.45em; font-weight: 600; }
.T .main .sec-t::after { content: none; }
.T .main .sec-t { flex-direction: column; align-items: flex-start; gap: .15em; }
.T .main .sec-t::after { content: ''; width: 9mm; height: 2px; background: #2b2b2e; }
.T .en-left { grid-template-columns: 30mm 1fr; }
.T .en-left .en-t { font-size: .95em; }
.T .lv-bar { border-radius: 0; height: .5em; }
.T .lv-bar i { border-radius: 0; }
.T .main .sec-skills .lv { display: grid; grid-template-columns: 1fr 1fr; column-gap: 8mm; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="side pad dark">
            <Photo c={c} shape="square" />
            <div className="who"><Name c={c} split /><JobTitle c={c} /></div>
            <ContactSec c={c} variant="labels" />
            <Secs c={c} list={aside} o={{ langs: 'bars', interests: 'bullets' }} />
          </div>
          <div className="main pad">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'left', skills: 'bars' }} /></div>
        </>
      );
    },
  },

  {
    id: 'leblon', name: 'Leblon', refs: ['modelo-10'], desc: 'Serifado e elegante com detalhes em cobre.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#c07f55', palette: ['#c07f55', '#8c6d46', '#5b7065', '#7b4b5a'],
    fonts: { head: 'baskerville', body: 'lato' }, aside: ['skills', 'languages', 'education', 'interests', 'courses'],
    css: `
.T { padding: 16mm 15mm 14mm; }
.T .hd { display: grid; grid-template-columns: 1fr 34mm; align-items: center; gap: 8mm; padding-bottom: 7mm; border-bottom: 1px solid #ddd; margin-bottom: 8mm; }
.T .nm { font-size: 2.6em; font-weight: 400; text-transform: uppercase; letter-spacing: .08em; line-height: 1.15; color: #333; }
.T .nm-last { display: block; }
.T .jt { color: var(--accent); letter-spacing: .3em; text-transform: uppercase; font-size: .85em; margin-top: .8em; font-family: var(--f-body); }
.T .ph { width: 32mm; height: 32mm; box-shadow: 0 0 0 1.2mm #fff, 0 0 0 1.6mm var(--accent); }
.T .cols { display: grid; grid-template-columns: 55mm 1fr; }
.T .side { padding-right: 7mm; border-right: 1px solid #ddd; }
.T .main { padding-left: 8mm; }
.T .sec-t { color: var(--accent); font-family: var(--f-body); font-size: .95em; letter-spacing: .22em; }
.T .ct-ic { color: var(--accent); }
.T .ct { font-size: .88em; }
.T .en-t { text-transform: uppercase; font-size: .86em; letter-spacing: .05em; }
.T .lv-pips i { background: #eee; }
.T .lv-pips i.on { background: var(--accent); }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd"><div><Name c={c} split /><JobTitle c={c} /></div><Photo c={c} /></header>
          <div className="cols">
            <div className="side"><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'dots', langs: 'dots', entry: 'top' }} /></div>
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'trancoso', name: 'Trancoso', refs: ['modelo-11', 'modelo-47'], desc: 'Faixas suaves em cinza e pêssego, ano à esquerda.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'suave'], accent: '#e3a084', palette: ['#e3a084', '#9bb7a3', '#a3b1d6', '#c9a66b'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['skills', 'interests', 'languages'],
    css: `
.T { display: grid; grid-template-columns: 72mm 1fr; }
.T .bg { width: 100%; background: linear-gradient(#ececea 0 0) top / 100% 92mm no-repeat, #fdf3ee; }
.T .side { padding: 16mm 7mm 12mm 13mm; }
.T .main { padding: 16mm 13mm 12mm 7mm; }
.T .nm { font-size: 1.7em; letter-spacing: .3em; text-transform: uppercase; font-weight: 600; text-align: center; }
.T .jt { text-align: center; font-family: 'Lora Variable', serif; font-style: italic; color: #666; margin-top: .3em; }
.T .ph { width: 44mm; height: 44mm; margin: 7mm auto 9mm; }
.T .sec-t { font-size: .9em; letter-spacing: .3em; border-top: 1px solid #bbb; border-bottom: 1px solid #bbb; padding: .5em 0; }
.T .ct li { border-bottom: 1px solid #ddd; padding-bottom: .4em; justify-content: space-between; flex-direction: row-reverse; font-size: .82em; letter-spacing: .12em; text-transform: uppercase; }
.T .side .sum { margin-bottom: 7mm; font-size: .95em; text-align: justify; }
.T .en-left { grid-template-columns: 13mm 1fr; }
.T .en-left .en-d { font-weight: 600; color: #333; white-space: pre-line; }
.T .en-t { color: var(--accent); text-transform: uppercase; letter-spacing: .14em; font-size: .85em; }
.T .en-o { font-family: 'Lora Variable', serif; font-style: italic; color: #444; }
.T .lv-columns { list-style: none; padding: 0; font-size: .9em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="side pad">
            <Name c={c} /><JobTitle c={c} /><Photo c={c} />
            <ContactSec c={c} variant="icons" />
            <SummaryText c={c} s={sum} />
            <Secs c={c} list={aside} o={{ skills: 'columns', langs: 'list' }} />
          </div>
          <div className="main pad"><Secs c={c} list={main} o={{ entry: 'left', dateSep: '\n' }} /></div>
        </>
      );
    },
  },

  {
    id: 'bonito', name: 'Bonito', refs: ['modelo-12'], desc: 'Títulos em pílula, tons terrosos e linha do tempo.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'suave'], accent: '#8a6f5e', palette: ['#8a6f5e', '#6b7f73', '#7a6a8f', '#b07d62'],
    fonts: { head: 'raleway', body: 'raleway' }, aside: ['skills', 'languages', 'interests'],
    css: `
.T { display: grid; grid-template-columns: 70mm 1fr; }
.T .side { padding: 14mm 8mm 12mm 12mm; text-align: center; }
.T .main { padding: 14mm 0 12mm 4mm; }
.T .ph { width: 42mm; height: 42mm; margin: 0 auto 7mm; }
.T .nm { font-weight: 400; font-size: 2.3em; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); line-height: 1.2; }
.T .nm-last { display: block; }
.T .jt { margin: .7em 0 9mm; letter-spacing: .2em; text-transform: uppercase; font-size: .82em; color: #555; font-weight: 600; }
.T .side .sec { text-align: left; }
.T .side .sec-t { letter-spacing: .35em; font-weight: 500; color: #555; justify-content: flex-start; }
.T .ct-ic { color: var(--accent); }
.T .main .sec-t { background: #efebe8; border-radius: 999px 0 0 999px; padding: .75em 1.3em; letter-spacing: .35em; font-weight: 500; color: #666; font-size: .95em; margin-bottom: 1em; }
.T .main .ens { padding-right: 12mm; }
.T .en-timeline { padding-left: 1.6em; margin-left: 1em; }
.T .en-timeline::after { border-color: #aaa; }
.T .en-timeline .en-d { order: -1; }
.T .en-meta { flex-direction: column; align-items: flex-start; gap: 0; }
.T .lv-bar { background: transparent; height: .45em; }
.T .lv-list li { justify-content: flex-start; }
.T .lv-list .lv-lb::before { content: '-  '; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <div className="side pad">
            <Photo c={c} /><Name c={c} split /><JobTitle c={c} />
            <ContactSec c={c} />
            <Secs c={c} list={aside} o={{ skills: 'bars', langs: 'list' }} />
          </div>
          <div className="main pad">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'top' }} /></div>
        </>
      );
    },
  },

  {
    id: 'boa-viagem', name: 'Boa Viagem', refs: ['modelo-13'], desc: 'Cargo em letras gigantes e títulos com interruptor.',
    photo: 'yes', ats: 'baixa', cols: 2, tags: ['criativo', 'com foto'], accent: '#1a1a1a', palette: ['#1a1a1a', '#5a189a', '#c1121f', '#1d3557'],
    fonts: { head: 'inter', body: 'inter' }, aside: ['languages', 'interests'],
    css: `
.T { padding: 12mm 13mm 12mm; display: grid; grid-template-columns: 68mm 1fr; gap: 0 9mm; }
.T .bar { grid-column: 1 / 3; display: flex; justify-content: space-between; text-transform: uppercase; font-size: .95em; margin-bottom: 7mm; }
.T .bar b { font-weight: 800; }
.T .big { font-weight: 800; font-size: 4.2em; line-height: .98; letter-spacing: -.03em; margin-bottom: 9mm; overflow-wrap: anywhere; }
.T .nm { font-size: 1.9em; font-weight: 700; margin-bottom: 4mm; font-family: var(--f-body); }
.T .ct-labels li { margin: 0 0 .7em; }
.T .ct-labels .ct-l { font-weight: 400; color: #666; }
.T .side .ph { width: 60mm; height: 72mm; margin-top: 7mm; }
.T .sec-t { text-transform: none; letter-spacing: 0; font-size: 1.35em; border-bottom: 1.5px solid #222; padding-bottom: .25em; gap: .6em; }
.T .sec-t::before { content: ''; flex: none; width: 1.6em; height: .9em; border-radius: 1em; border: 1.5px solid #222; background: radial-gradient(circle at 70% 50%, #222 0 .28em, transparent .3em); }
.T .en-t { font-size: 1em; }
.T .en-meta { justify-content: flex-start; }
.T .en-meta .en-d::before { content: '|'; margin-right: .6em; color: #999; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <div className="bar" aria-hidden><span>[ {{ pt: 'Currículo', en: 'Resume', es: 'Currículum' }[c.lang]} ]</span><b>{c.p.title}</b></div>
          <div className="side">
            <div className="big" aria-hidden>{c.p.title || c.p.name}</div>
            <Name c={c} />
            <Contacts c={c} variant="labels" />
            <Secs c={c} list={aside} o={{ langs: 'list', interests: 'bullets' }} />
            <Photo c={c} shape="square" />
          </div>
          <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub', skills: 'columns' }} /></div>
        </>
      );
    },
  },
];

