// Currículo de exemplo (dados fictícios): prévia dos modelos, "Começar com um exemplo" e prints do README.
import { uid, DEFAULT_STYLE, emptyProfile } from './model.mjs';

// Retrato ilustrado neutro (SVG) — os modelos com foto ficam completos sem usar a foto de ninguém
const AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9d6d1"/><stop offset="1" stop-color="#b9b4ad"/></linearGradient>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#57514b"/><stop offset="1" stop-color="#2f2b27"/></linearGradient>
<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9d4c3"/><stop offset="1" stop-color="#d4b8a2"/></linearGradient></defs>
<rect width="400" height="400" fill="url(#b)"/>
<path d="M200 70c-52 0-86 38-86 96 0 30 6 58 16 80l-20 40h180l-20-40c10-22 16-50 16-80 0-58-34-96-86-96z" fill="#3b3430"/>
<ellipse cx="200" cy="170" rx="58" ry="70" fill="url(#f)"/>
<path d="M142 150c6-46 34-66 60-66s54 20 58 66c-18-26-38-36-60-38-22 2-44 14-58 38z" fill="#3b3430"/>
<rect x="178" y="226" width="44" height="40" rx="10" fill="#d4b8a2"/>
<path d="M60 400c4-78 58-128 140-128s136 50 140 128z" fill="url(#s)"/>
<path d="M170 274l30 36 30-36" fill="none" stroke="#efe9e2" stroke-width="10" stroke-linejoin="round"/>
</svg>`;

export const SAMPLE_PHOTO = `data:image/svg+xml;base64,${typeof btoa === 'function' ? btoa(AVATAR_SVG) : Buffer.from(AVATAR_SVG).toString('base64')}`;

const it = (o) => ({ id: uid(), role: '', org: '', location: '', start: '', end: '', current: false, description: '', ...o });
const lv = (name, level) => ({ id: uid(), name, level });

export function sampleResume({ withPhoto = true, template = 'ipanema' } = {}) {
  const now = Date.now();
  return {
    schema: 1,
    id: uid(),
    docTitle: 'Currículo de exemplo — Mariana Costa',
    createdAt: now,
    updatedAt: now,
    template,
    style: { ...DEFAULT_STYLE },
    profile: {
      ...emptyProfile(),
      name: 'Mariana Albuquerque Costa',
      title: 'Analista de Marketing Digital',
      email: 'mariana.costa@email.com',
      phone: '(11) 98765-4321',
      location: 'São Paulo, SP',
      website: 'marianacosta.com.br',
      linkedin: 'linkedin.com/in/marianacosta',
      photo: withPhoto ? SAMPLE_PHOTO : null,
    },
    sections: [
      {
        id: uid(), type: 'summary', title: '', hidden: false, placement: 'auto', items: [],
        text: 'Analista de marketing com 6 anos de experiência em campanhas de performance, SEO e gestão de redes sociais. Aumentei a receita do e-commerce em 42% com estratégias orientadas por dados e lidero projetos com times de criação, produto e vendas.',
      },
      {
        id: uid(), type: 'experience', title: '', hidden: false, placement: 'auto', text: '',
        items: [
          it({ role: 'Analista de Marketing Digital Sênior', org: 'Grupo Horizonte Varejo', location: 'São Paulo, SP', start: '03/2022', current: true,
            description: '- Planejei e executei campanhas de mídia paga com orçamento mensal de R$ 400 mil e ROAS médio de 6,2\n- Reestruturei o funil de e-mail marketing, elevando a taxa de conversão em 35%\n- Coordeno uma equipe de 4 pessoas entre redação, design e análise de dados' }),
          it({ role: 'Analista de Marketing Pleno', org: 'Lumen Tecnologia', location: 'Campinas, SP', start: '01/2020', end: '02/2022',
            description: '- Conduzi a estratégia de SEO que triplicou o tráfego orgânico em 18 meses\n- Implantei dashboards no Looker Studio para acompanhamento semanal de metas' }),
          it({ role: 'Assistente de Marketing', org: 'Café Serra Azul', location: 'Campinas, SP', start: '02/2018', end: '12/2019',
            description: '- Gerenciei as redes sociais da marca, com crescimento de 120 mil seguidores\n- Produzi conteúdo para blog e newsletter semanal' }),
        ],
      },
      {
        id: uid(), type: 'education', title: '', hidden: false, placement: 'auto', text: '',
        items: [
          it({ role: 'MBA em Marketing Digital', org: 'Fundação Getulio Vargas (FGV)', location: 'São Paulo, SP', start: '2021', end: '2022' }),
          it({ role: 'Bacharelado em Comunicação Social — Publicidade', org: 'Pontifícia Universidade Católica de Campinas', location: 'Campinas, SP', start: '2014', end: '2017' }),
        ],
      },
      {
        id: uid(), type: 'skills', title: '', hidden: false, placement: 'auto', text: '',
        items: [lv('Google Ads e Meta Ads', 5), lv('SEO e Analytics', 5), lv('CRM e automação (RD Station)', 4), lv('Copywriting', 4), lv('Excel e Looker Studio', 4), lv('Figma e Canva', 3)],
      },
      {
        id: uid(), type: 'languages', title: '', hidden: false, placement: 'auto', text: '',
        items: [lv('Português', 5), lv('Inglês', 4), lv('Espanhol', 2)],
      },
      {
        id: uid(), type: 'courses', title: '', hidden: false, placement: 'auto', text: '',
        items: [
          it({ role: 'Google Analytics 4 — Certificação', org: 'Google', start: '2023' }),
          it({ role: 'Growth Marketing', org: 'Rock Content University', start: '2021' }),
        ],
      },
      {
        id: uid(), type: 'interests', title: '', hidden: false, placement: 'auto', text: '',
        items: [{ id: uid(), name: 'Fotografia' }, { id: uid(), name: 'Corrida' }, { id: uid(), name: 'Viagens' }],
      },
    ],
  };
}
