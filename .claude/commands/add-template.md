# Skill: Adicionar Novo Modelo de Currículo

Você é um especialista em adicionar novos templates ao projeto **curriculodobrasil** (React + Vite). Sua missão é garantir que cada novo modelo seja implementado com fidelidade máxima à referência, com todas as ferramentas de edição necessárias e sem quebrar os modelos existentes.

---

## FASE 1 — ANÁLISE PROFUNDA DA REFERÊNCIA

Antes de escrever qualquer código, analise a imagem de referência com extremo cuidado:

### 1.1 Estrutura de Layout
- [ ] Quantas colunas? Quais larguras proporcionais? (ex: sidebar 35% + main 65%)
- [ ] A foto é circular, retangular, quadrada ou oculta?
- [ ] O cabeçalho é separado do corpo?
- [ ] Há rodapé decorativo?
- [ ] Há elementos decorativos (linhas, blocos de cor, formas geométricas)?

### 1.2 Tipografia — seja ESPECÍFICO
Para cada bloco de texto, identifique:
- **Nome/destaque**: tamanho estimado (px), peso (bold/black/light), família (serif? sans? condensado?), caixa (uppercase/normal/italic)
- **Subtítulo**: idem
- **Títulos de seção**: tamanho, peso, estilo, separador (linha? underline? nenhum?)
- **Cargo/empresa**: qual tem destaque? qual é secundário?
- **Texto do corpo**: tamanho base, line-height estimado
- **Datas/metadados**: cor, estilo (italic?), tamanho
- **Contato/social**: tamanho, ícones presentes?

Procure a fonte exata ou a mais parecida no Google Fonts. Considere:
- Serif elegante → Playfair Display, Cormorant Garamond, EB Garamond, Libre Baskerville
- Sans condensado → Oswald, Barlow Condensed, Fjalla One
- Sans moderno → Montserrat, Raleway, Poppins, Josefin Sans
- Sans corpo → Lato, Open Sans, Source Sans 3, Inter, DM Sans

### 1.3 Paleta de Cores
Liste TODAS as cores visíveis:
- Fundo(s) principal(is)
- Cor do nome
- Cor de títulos de seção
- Cor de texto do corpo
- Cor de texto secundário (datas, empresas, etc.)
- Cor de destaque/accent (barras, linhas, elementos decorativos)
- Cor da sidebar (se houver)
- Cor de texto da sidebar

Use o eyedropper mental: tons escuros típicos são #1f2937, #2d2d2d, #374151; tons médios #6b7280, #9ca3af; tons claros #d1d5db, #e5e7eb, #f3f4f6.

### 1.4 Seções de Conteúdo
Inventarie TODAS as seções presentes:
- [ ] Nome + Subtítulo
- [ ] Foto de perfil
- [ ] Resumo/Bio
- [ ] Contato (endereço, email, telefone)
- [ ] Redes sociais
- [ ] Experiências profissionais
- [ ] Formação acadêmica
- [ ] Especializações/Cursos
- [ ] Habilidades/Skills
- [ ] Prêmios/Conquistas
- [ ] Referências (NOVO se presente)
- [ ] Idiomas (NOVO se presente)
- [ ] Certificações (NOVO se presente)
- [ ] Portfolio/Projetos (NOVO se presente)
- [ ] Qualquer outra seção não listada acima

### 1.5 Estrutura de Cada Seção
Para cada seção de conteúdo, anote:
- Quais campos são visíveis (ex: experiência: cargo + empresa na mesma linha, data abaixo, depois parágrafo, depois bullets)
- Quais campos estão na MESMA linha vs linhas separadas
- Qual campo recebe destaque (bold) vs qual é secundário (muted/italic)
- Há separadores entre itens (linha, espaço, nada)?

---

## FASE 2 — PLANEJAMENTO TÉCNICO

### 2.1 ID do Novo Template
Escolha um ID sequencial: `template3`, `template4`, etc.
Prefixo de chaves de estilo: `t3`, `t4`, etc.

### 2.2 Campos de Dados Novos
Compare com o `initialData` existente em `src/App.jsx`. Liste o que FALTA:
- Novos arrays (ex: `references: []`, `languages: []`)
- Novos campos em itens existentes (ex: `edu.description`, `exp.period`)
- Novos campos de topo (ex: `website`, `nationality`)

### 2.3 Chaves de Estilo (prefixo tN)
Mapeie TODOS os elementos visuais que o usuário deve poder customizar:
```
tN_SidebarBg, tNSidebarTextColor, tNSidebarNameColor
tNSectionTitleColor, tNJobTitleColor, tNCompanyColor
tNBodyColor, tNDateColor, tNAccentColor, tNDividerColor
tNPhotoHeight (se foto retangular)
tNNameSize, tNSubtitleSize, tNSectionTitleSize
tNBodySize, tNJobTitleSize, tNContactSize
tNFontName, tNFontSectionTitle, tNFontBody, tNFontCompany, tNFontRole
```

### 2.4 Fontes Padrão
Defina os defaults do novo template em `src/data/fonts.js`:
```js
TEMPLATE_FONT_DEFAULTS.templateN = { fontDisplay: '...', fontBody: '...' }
```

### 2.5 Abas do Formulário Afetadas
Mapeie que seção de cada aba do form precisa de ajuste:
- **Dados**: apenas se houver novos campos no topo (website, etc.)
- **Perfil**: apenas se houver novos campos de social/resumo
- **Carreira**: se a estrutura de experiência mudar (ex: novo campo "período")
- **Formação**: se houver edu.description, referências, idiomas, certificações
- **Estilo**: SEMPRE — criar bloco `{activeTab === 'estilo' && data.template === 'templateN' && ...}`

---

## FASE 3 — IMPLEMENTAÇÃO

### 3.1 Adicionar Fontes Novas (se necessário)
Em `src/data/fonts.js`, adicione entradas ao array `FONTS`. Verifique o Google Fonts para o nome exato da família e os pesos disponíveis.

### 3.2 Criar `src/components/templates/TemplateNPreview.jsx`

**Estrutura obrigatória:**
```jsx
import { PlatformIcon } from '../../data/platformIcons.jsx'
import { getFontFamily } from '../../data/fonts.js'

const DEFAULT = {
  mainBg: '#ffffff',
  // ... todas as chaves tN com seus valores padrão
}

export default function TemplateNPreview({ data, id = 'resume-preview' }) {
  const st = { ...DEFAULT, ...data.style }
  // render fiel à referência
}
```

**Regras de implementação:**
- Largura fixa: `width: '210mm', minHeight: '297mm'`
- `fontFamily` no root = `getFontFamily(data.fontBody)` (fallback global)
- Cada elemento usa seu próprio `getFontFamily(st.tNFontX ?? data.fontBody/fontDisplay)`
- Usar `data.photoHidden`, `data.photoBorderHidden`, `data.photoGrayscale`
- Foto circular: `borderRadius: '50%'` com `border`
- Foto retangular: sem border-radius, usar altura configurável
- Seções condicionais: `{data.section?.length > 0 && (...)}`

### 3.3 Atualizar `src/App.jsx`
1. Criar `TNThumb` (wireframe visual do modelo)
2. Adicionar `{ id: 'templateN', name: '...', desc: '...', Thumb: TNThumb }` ao array `TEMPLATES`
3. Adicionar novos campos ao `initialData` (novos arrays, campos)
4. Adicionar chaves `tN*` ao `initialData.style`
5. Na seleção de template: `TEMPLATE_FONT_DEFAULTS` já cuida das fontes se você adicionou lá

### 3.4 Atualizar `src/components/ResumePreview.jsx`
```jsx
import TemplateNPreview from './templates/TemplateNPreview.jsx'
// ...
if (data.template === 'templateN') return <TemplateNPreview data={data} id={id} />
```

### 3.5 Atualizar `src/components/ResumeForm.jsx`

**Aba Carreira** — se a estrutura de experiência mudar para templateN:
```jsx
{data.template === 'templateN' ? (
  <>
    <Label>Campo A (destaque)</Label>
    <Input ... />
    <Label>Campo B (contexto)</Label>
    <Input ... />
    <Label>Campo C (período/data)</Label>
    <Input ... />
  </>
) : data.template === 'template2' ? (...) : (...)}
```

**Aba Formação** — novas seções:
```jsx
{data.template === 'templateN' && (
  <div className="pt-1">
    <Label>Nova Seção</Label>
    {/* campos */}
  </div>
)}
```

**Aba Estilo** — OBRIGATÓRIO criar bloco completo:
```jsx
{activeTab === 'estilo' && data.template === 'templateN' && (
  <FieldGroup>
    <StyleDivider label="Cores" />
    <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
      {/* ColorField para cada cor customizável */}
    </div>

    <StyleDivider label="Fontes e Tamanhos" />
    <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
      <MasterFontField ...>
        {/* FontField para cada elemento com fonte + tamanho */}
      </MasterFontField>
    </div>

    <button type="button" onClick={() => onChange((p) => ({ ...p, style: { ...p.style,
      /* restaurar todos os defaults tN */
    }}))} className="...">
      Restaurar todos os padrões
    </button>
  </FieldGroup>
)}
```

---

## FASE 4 — CHECKLIST DE QUALIDADE

Antes de declarar o template pronto, verifique:

### Visual
- [ ] O layout geral bate com a referência (colunas, proporções)?
- [ ] As fontes são as mais próximas possível da referência?
- [ ] Os tamanhos de fonte parecem corretos (hierarquia visual)?
- [ ] As cores correspondem à referência?
- [ ] Os espaçamentos entre seções parecem corretos?
- [ ] A foto é exibida no formato correto (circular/retangular)?
- [ ] Elementos decorativos estão presentes (linhas, barras, formas)?

### Funcionalidade
- [ ] Todos os campos do form são refletidos no preview?
- [ ] Seções condicionais funcionam (somem quando vazias)?
- [ ] A foto respeita `photoHidden`, `photoGrayscale`, `photoBorderHidden`?
- [ ] O estilo responde aos sliders e color pickers?
- [ ] As fontes mudam ao selecionar no dropdown?
- [ ] Ao trocar para este template na galeria, as fontes padrão são aplicadas?
- [ ] O botão "Restaurar padrões" funciona?

### Robustez
- [ ] O template não quebra com dados vazios/undefined?
- [ ] Campos opcionais usam `?.` ou verificação de existência?
- [ ] Arrays usam `.length > 0` antes de renderizar?
- [ ] Campos de string usam `?? ''` ou verificação?

### Integração
- [ ] O template aparece na galeria de modelos com thumb correto?
- [ ] Os outros templates não foram afetados?
- [ ] O PDF export não quebra?

---

## REFERÊNCIAS DE CÓDIGO

### Padrão de renderização de foto circular (como Template 1/2):
```jsx
<div style={{ width: sz, height: sz, borderRadius: '50%', overflow: 'hidden',
  border: data.photoBorderHidden ? 'none' : `1.5px solid ${data.photoBorderColor ?? '#d1d5db'}` }}>
  <img src={data.photo} style={{ width:'100%', height:'100%', objectFit:'cover',
    objectPosition:`${data.photoX??50}% ${data.photoY??50}%`,
    transform:`scale(${(data.photoScale??100)/100})`,
    transformOrigin:`${data.photoX??50}% ${data.photoY??50}%`,
    filter: data.photoGrayscale ? 'grayscale(1)' : 'none' }} />
</div>
```

### Padrão de foto retangular (como Template 3):
```jsx
<div style={{ width: '100%', height: `${st.tNPhotoHeight}px`, overflow: 'hidden' }}>
  <img src={data.photo} draggable={false} style={{ width:'100%', height:'100%', objectFit:'cover',
    objectPosition:`${data.photoX??50}% ${data.photoY??50}%`,
    transform:`scale(${(data.photoScale??100)/100})`,
    transformOrigin:`${data.photoX??50}% ${data.photoY??50}%`,
    display:'block', filter: data.photoGrayscale ? 'grayscale(1)' : 'none' }} />
</div>
```

### Padrão de SectionTitle com linha horizontal (Template 2):
```jsx
<div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
  <h3 style={{ fontSize:`${st.tNSectionTitleSize}px`, fontWeight:'700', fontFamily:..., textTransform:'uppercase', letterSpacing:'0.14em', color:..., whiteSpace:'nowrap', flexShrink:0 }}>
    {children}
  </h3>
  <div style={{ flex:1, height:'0.5px', backgroundColor:st.tNDividerColor }} />
</div>
```

### Padrão de SectionTitle display serif grande (Template 3):
```jsx
<h2 style={{ fontFamily: getFontFamily(st.tNFontSectionTitle ?? data.fontDisplay),
  fontSize:`${st.tNSectionTitleSize}px`, fontWeight:'700',
  color:st.tNSectionTitleColor, marginBottom:'16px', lineHeight:'1.1' }}>
  Título da Seção
</h2>
```
