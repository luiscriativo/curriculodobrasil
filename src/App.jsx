import { useState, useRef } from 'react'
import { ZoomIn, ZoomOut, Maximize2, Download, Upload, FileDown, Loader2, Layers, X } from 'lucide-react'
import ResumePreview from './components/ResumePreview.jsx'
import ResumeForm from './components/ResumeForm.jsx'
import FontLoader from './components/FontLoader.jsx'
import { TEMPLATE_FONT_DEFAULTS } from './data/fonts.js'


// ── Template thumbnails (wireframe) ────────────────────────────────────────────
const T1Thumb = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', backgroundColor: '#f9fafb', borderRadius: '4px', overflow: 'hidden' }}>
    <div style={{ width: '35%', backgroundColor: '#e8e4dc', padding: '7px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#c9c3b5' }} />
      <div style={{ width: '90%', height: '1px', backgroundColor: '#c9c3b580', marginTop: '2px' }} />
      {[80, 60, 80, 60, 80, 60].map((w, i) => <div key={i} style={{ width: `${w}%`, height: i % 2 === 0 ? '4px' : '3px', backgroundColor: i % 2 === 0 ? '#b8b0a4' : '#d6d2c9', borderRadius: '2px' }} />)}
    </div>
    <div style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ width: '75%', height: '8px', backgroundColor: '#374151', borderRadius: '2px' }} />
      <div style={{ width: '55%', height: '4px', backgroundColor: '#9ca3af', borderRadius: '2px', marginBottom: '3px' }} />
      {[90, 80, 75, 90, 70, 85, 80].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '3px', backgroundColor: i === 3 ? '#6b7280' : '#d1d5db', borderRadius: '2px', marginTop: i === 3 ? '4px' : 0 }} />)}
    </div>
  </div>
)

const T2Thumb = () => (
  <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '4px', overflow: 'hidden', padding: '8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '5px', border: '1px solid #f3f4f6' }}>
    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#d1d5db', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '1px' }}>
        <div style={{ width: '60%', height: '7px', backgroundColor: '#374151', borderRadius: '2px' }} />
        <div style={{ width: '40%', height: '3px', backgroundColor: '#9ca3af', borderRadius: '2px' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
        {[38, 45, 32, 40].map((w, i) => <div key={i} style={{ width: `${w}px`, height: '3px', backgroundColor: '#d1d5db', borderRadius: '2px' }} />)}
      </div>
    </div>
    <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />
    {[88, 78].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '3px', backgroundColor: '#d1d5db', borderRadius: '2px' }} />)}
    <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
      <div style={{ width: '38%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {[70, 85, 60, 70, 80, 55].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '3px', backgroundColor: i % 3 === 0 ? '#9ca3af' : '#d1d5db', borderRadius: '2px', marginTop: i % 3 === 0 && i > 0 ? '3px' : 0 }} />)}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {[65, 90, 80, 85, 65, 88, 75].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '3px', backgroundColor: i === 0 || i === 4 ? '#9ca3af' : '#d1d5db', borderRadius: '2px', marginTop: i === 4 ? '3px' : 0 }} />)}
      </div>
    </div>
  </div>
)

const T3Thumb = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', borderRadius: '4px', overflow: 'hidden' }}>
    {/* Top accent bar */}
    <div style={{ width: '100%', height: '5px', backgroundColor: '#1a1a1a', flexShrink: 0 }} />
    <div style={{ display: 'flex', flex: 1 }}>
      <div style={{ width: '35%', backgroundColor: '#d4cec8', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', height: '36%', backgroundColor: '#b5b0a8' }} />
        <div style={{ padding: '5px 5px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          <div style={{ width: '85%', height: '6px', backgroundColor: '#1a1a1a', borderRadius: '2px' }} />
          <div style={{ width: '65%', height: '3px', backgroundColor: '#6b7280', borderRadius: '2px', marginBottom: '3px' }} />
          {[90, 80, 85, 70, 80].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2.5px', backgroundColor: '#8a8580', borderRadius: '2px' }} />)}
        </div>
      </div>
      <div style={{ flex: 1, padding: '7px 6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ width: '60%', height: '8px', backgroundColor: '#1a1a1a', borderRadius: '2px' }} />
        {[90, 75, 85, 70, 80, 65].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2.5px', backgroundColor: i % 4 === 0 ? '#374151' : '#d1d5db', borderRadius: '2px', marginTop: i % 4 === 0 && i > 0 ? '4px' : 0 }} />)}
        <div style={{ width: '50%', height: '7px', backgroundColor: '#1a1a1a', borderRadius: '2px', marginTop: '4px' }} />
        {[80, 70, 75, 65].map((w, i) => <div key={i} style={{ width: `${w}%`, height: '2.5px', backgroundColor: '#d1d5db', borderRadius: '2px' }} />)}
      </div>
    </div>
  </div>
)

const TEMPLATES = [
  { id: 'template1', name: 'Sidebar Clássico',  desc: 'Barra lateral colorida com foto',        Thumb: T1Thumb },
  { id: 'template2', name: 'Layout Moderno',    desc: 'Cabeçalho full-width com duas colunas',  Thumb: T2Thumb },
  { id: 'template3', name: 'Editorial Clássico', desc: 'Sidebar cinza claro, foto retangular, títulos serif', Thumb: T3Thumb },
]

// ── Zoom ────────────────────────────────────────────────────────────────────────
const ZOOM_MIN = 0.3
const ZOOM_MAX = 1.5
const ZOOM_STEP = 0.1
const ZOOM_DEFAULT = 0.68

const initialData = {
  template: 'template1',
  fontDisplay: 'montserrat',
  fontBody: 'opensans',
  name: 'SEU NOME COMPLETO',
  subtitle: 'Área de Atuação | Especialidade | Cargo',
  address: 'Rua Exemplo, 123 - Bairro - Cidade UF',
  email: 'seuemail@exemplo.com',
  phone: '(00) 00000-0000',
  phoneIcon: 'phone',
  emailIcon: 'mail',
  addressIcon: 'mappin',
  photo: null,
  photoX: 50,
  photoY: 50,
  photoScale: 110,
  photoSize: 100,
  photoBorderColor: '#6b7280',
  photoBorderHidden: false,
  photoHidden: false,
  photoGrayscale: false,
  style: {
    // ── Template 1 — Sidebar — cores ─────────────────
    sidebarBg:                 '#E8E4DC',
    sidebarTitleColor:         '#2d2d2d',
    sidebarItemTitleColor:     '#2d2d2d',
    sidebarItemSubColor:       '#6b7280',
    // ── Template 1 — Sidebar — fontes ────────────────
    sidebarMaster:             9,
    sidebarSectionTitleSize:   7,
    sidebarItemTitleSize:      9,
    sidebarItemSubSize:        8,
    // ── Compartilhado — Main — cores ──────────────────
    mainBg:                    '#FFFFFF',
    mainNameColor:             '#2d2d2d',
    mainSectionTitleColor:     '#2d2d2d',
    mainBodyColor:             '#374151',
    mainMutedColor:            '#6b7280',
    // ── Compartilhado — Main — fontes ─────────────────
    mainMaster:                10,
    mainNameSize:              26,
    mainSubtitleSize:          10,
    mainContactSize:           10,
    mainSectionTitleSize:       9,
    mainBodySize:              10,
    mainCompanySize:           11,
    mainRoleSize:              10,
    // ── Template 3 — cores ───────────────────────────
    t3SidebarBg:               '#F5F5F5',
    t3SidebarTextColor:        '#3d3d3d',
    t3SidebarNameColor:        '#1a1a1a',
    t3SidebarSubColor:         '#6b6b6b',
    t3SectionTitleColor:       '#1a1a1a',
    t3JobTitleColor:           '#1a1a1a',
    t3CompanyColor:            '#6b7280',
    t3BodyColor:               '#3d3d3d',
    t3DateColor:               '#6b7280',
    t3AccentBarColor:          '#858587',
    t3BottomBarLeftColor:      '#ACABB0',
    t3BottomBarRightColor:     '#858587',
    // ── Template 3 — tamanhos ────────────────────────
    t3Master:                  9,
    t3AccentBarHeight:         8,
    t3PhotoHeight:             310,
    t3NameSize:                37,
    t3SubtitleSize:            11.5,
    t3SectionTitleSize:        17,
    t3JobTitleSize:            14.5,
    t3BodySize:                14,
    t3DateSize:                13.5,
    t3ContactSize:             11.5,
    t3SocialSize:              11.5,
    // ── Template 3 — fontes ──────────────────────────
    t3FontName:                'fjalla',
    t3FontSubtitle:            'poppins',
    t3FontSectionTitle:        'inter',
    t3FontBody:                'lato',
    t3FontCompany:             'lato',
    t3FontRole:                'lato',
    // ── Template 2 — fontes e cores exclusivas ────────
    t2Master:                  9,
    t2NameSize:                30,
    t2SubtitleSize:             9,
    t2ContactSize:              9,
    t2SectionTitleSize:         8,
    t2SectionTitleColor:       '#9ca3af',
    t2BodySize:                 9,
    t2CompanySize:             10,
    t2RoleSize:                 9,
    t2DividerColor:            '#d1d5db',
    t2AccentColor:             '#e5e7eb',
    t2FontName:                'raleway',
    t2FontSubtitle:            'lato',
    t2FontContact:             'lato',
    t2FontSectionTitle:        'lato',
    t2FontBody:                'lato',
    t2FontCompany:             'lato',
    t2FontRole:                'lato',
  },
  social: [
    { id: '1', platform: 'LinkedIn',  handle: 'linkedin.com/in/seuperfil', icon: 'linkedin' },
    { id: '2', platform: 'Instagram', handle: '@seuperfil',                icon: 'instagram' },
  ],
  summary:
    'Descreva aqui seu perfil profissional. Fale sobre sua experiência, competências e o que você busca na sua carreira. Este é um texto de exemplo — substitua pelo seu resumo real.',
  experiences: [
    {
      id: '1',
      company: 'Nome da Empresa',
      role: 'Cargo Ocupado | 2023 – Atual',
      description: '',
      bullets: [
        'Descreva uma atividade ou conquista relevante nesta posição.',
        'Adicione mais detalhes sobre suas responsabilidades e resultados.',
      ],
    },
    {
      id: '2',
      company: 'Empresa Anterior',
      role: 'Cargo Anterior | 2020 – 2023',
      description: '',
      bullets: [
        'Descreva suas principais entregas nesta posição.',
      ],
    },
  ],
  education: [
    {
      id: '1',
      degree: 'Graduação em Nome do Curso',
      institution: 'Nome da Instituição / 2020 – 2024',
      description: '',
    },
  ],
  references: [
    { id: '1', name: 'Nome da Referência', title: 'Cargo na Empresa', location: 'Cidade, UF · (00) 00000-0000', email: 'referencia@email.com' },
  ],
  specializations: [
    { id: '1', name: 'Nome do Curso ou Certificação', institution: 'Instituição / Ano' },
  ],
  skills: [
    { id: '1', name: 'Habilidade ou Competência' },
    { id: '2', name: 'Outra Competência Importante' },
    { id: '3', name: 'Mais uma Habilidade Relevante' },
  ],
  awards: [
    { id: '1', title: 'Nome do Prêmio', organization: 'Organização ou Evento', yearLocation: 'Ano – Local' },
  ],
}

// Renders the photo to a circular canvas with the user's crop/zoom settings
// and returns a base64 JPEG — used so the PDF gets the exact cropped version.
const cropToCircle = (src, scale, x, y, grayscale = false, outputSize = 400) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')

      ctx.beginPath()
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
      ctx.clip()

      if (grayscale) ctx.filter = 'grayscale(1)'

      // object-fit: cover dimensions
      const aspect = img.naturalWidth / img.naturalHeight
      let coverW, coverH
      if (aspect > 1) { coverH = outputSize; coverW = outputSize * aspect }
      else             { coverW = outputSize; coverH = outputSize / aspect }

      // object-position offsets
      const offsetX = -(coverW - outputSize) * (x / 100)
      const offsetY = -(coverH - outputSize) * (y / 100)

      // apply scale around the position origin
      const s = scale / 100
      const originX = outputSize * (x / 100)
      const originY = outputSize * (y / 100)
      ctx.translate(originX, originY)
      ctx.scale(s, s)
      ctx.translate(-originX, -originY)
      ctx.drawImage(img, offsetX, offsetY, coverW, coverH)

      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.src = src
  })

export default function App() {
  const [data, setData] = useState(initialData)
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [zoom, setZoom] = useState(ZOOM_DEFAULT)
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const importRef = useRef(null)

  const handleSaveDraft = () => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${data.name.replace(/\s+/g, '_') || 'curriculo'}_rascunho.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleLoadDraft = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      try {
        const parsed = JSON.parse(reader.result)
        setData((prev) => ({ ...prev, ...parsed }))
      } catch {
        alert('Arquivo inválido. Selecione um rascunho .json exportado por este editor.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const zoomIn    = () => setZoom((z) => Math.min(ZOOM_MAX, parseFloat((z + ZOOM_STEP).toFixed(2))))
  const zoomOut   = () => setZoom((z) => Math.max(ZOOM_MIN, parseFloat((z - ZOOM_STEP).toFixed(2))))
  const zoomReset = () => setZoom(ZOOM_DEFAULT)

  const handleExport = async () => {
    setExporting(true)
    setExportStatus('Preparando dados…')
    try {
      let exportData = { ...data }
      if (data.photo && !data.photoHidden) {
        exportData.photoCropped = await cropToCircle(
          data.photo, data.photoScale, data.photoX, data.photoY, data.photoGrayscale
        )
      }

      setExportStatus('Renderizando currículo…')
      const res = await fetch('https://enh8xz7m7f.execute-api.us-east-2.amazonaws.com/default/gerar-pdf-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error || res.statusText)
      }

      const { token } = await res.json()

      setExportStatus('Iniciando download…')
      window.location.href = `https://enh8xz7m7f.execute-api.us-east-2.amazonaws.com/default/gerar-pdf-cv?token=${token}`

      // Mantém o overlay até o IDM/browser capturar o download:
      // quando o IDM abre sua janela, o browser perde o foco (blur).
      // Fallback de 10s caso o blur não aconteça.
      await new Promise(resolve => {
        let done = false
        const finish = () => {
          if (done) return
          done = true
          window.removeEventListener('blur', finish)
          clearTimeout(fallback)
          resolve()
        }
        window.addEventListener('blur', finish)
        const fallback = setTimeout(finish, 5000)
      })
      setExportStatus('Download iniciado!')
      await new Promise(r => setTimeout(r, 600))
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Erro ao gerar PDF: ' + err.message)
    } finally {
      setExporting(false)
      setExportStatus('')
    }
  }

  return (
    <div
      className="flex bg-gray-100"
      style={{ height: '100vh', overflow: 'hidden', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
    >
      <FontLoader />
      {/* ── Form Panel ─────────────────────────────────────────── */}
      <div
        className="form-panel bg-white shadow-xl flex flex-col"
        style={{ width: '500px', minWidth: '500px', height: '100vh' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <h1 className="text-lg font-bold text-gray-800">Editor de Currículo</h1>
          <span className="text-xs text-gray-400 font-medium">A4 Preview</span>
        </div>

        {/* Template trigger */}
        <div className="px-5 py-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-xs text-gray-400">Modelo atual</span>
            <span className="block text-sm font-semibold text-gray-700 truncate">
              {TEMPLATES.find((t) => t.id === data.template)?.name ?? 'Sidebar Clássico'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTemplateGallery(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-3 py-2 transition-all flex-shrink-0"
          >
            <Layers size={13} />
            Trocar modelo
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ResumeForm data={data} onChange={setData} />
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 flex flex-col gap-2">
          {/* Draft save/load */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveDraft}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 hover:border-gray-500 hover:text-gray-900 transition-colors font-medium text-xs shadow-sm"
              title="Salvar rascunho como .json"
            >
              <Download size={13} />
              Salvar rascunho
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 hover:border-gray-500 hover:text-gray-900 transition-colors font-medium text-xs shadow-sm"
              title="Carregar rascunho .json"
            >
              <Upload size={13} />
              Carregar rascunho
            </button>
            <input ref={importRef} type="file" accept=".json,application/json" onChange={handleLoadDraft} className="hidden" />
          </div>
          {/* PDF export */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-colors font-semibold text-sm shadow-md shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting
                ? <Loader2 size={15} className="animate-spin" />
                : <FileDown size={15} />
              }
              {exporting ? 'Gerando PDF…' : 'Exportar PDF'}
            </button>
            {exporting && (
              <p className="text-center text-xs text-gray-400 animate-pulse">
                {exportStatus}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Preview Panel ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col" style={{ height: '100vh' }}>

        {/* Zoom toolbar */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-200 border-b border-gray-300 flex-shrink-0">
          <button onClick={zoomOut} disabled={zoom <= ZOOM_MIN}
            className="p-1.5 rounded-md hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600"
            title="Diminuir zoom">
            <ZoomOut size={15} />
          </button>
          <button onClick={zoomReset}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 w-14 text-center tabular-nums hover:bg-gray-300 rounded px-1 py-1 transition-colors"
            title="Resetar zoom">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={zoomIn} disabled={zoom >= ZOOM_MAX}
            className="p-1.5 rounded-md hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600"
            title="Aumentar zoom">
            <ZoomIn size={15} />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button onClick={zoomReset}
            className="p-1.5 rounded-md hover:bg-gray-300 transition-colors text-gray-500"
            title="Zoom padrão">
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Scrollable preview */}
        <div className="flex-1 overflow-y-auto overflow-x-auto bg-gray-300 flex justify-center relative"
          style={{ paddingTop: '32px', paddingBottom: '64px' }}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: '210mm', flexShrink: 0 }}>
            <ResumePreview data={data} />
          </div>

          {/* Overlay de progresso durante exportação */}
          {exporting && (
            <div className="absolute inset-0 bg-gray-900/40 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
              <Loader2 size={36} className="animate-spin text-white drop-shadow" />
              <div className="bg-white rounded-xl shadow-xl px-6 py-4 flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-gray-800">Gerando PDF</span>
                <span className="text-xs text-gray-500 animate-pulse">{exportStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Galeria de modelos ──────────────────────────────────────── */}
      {showTemplateGallery && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          onClick={() => setShowTemplateGallery(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl flex flex-col"
            style={{ width: '640px', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-800">Escolher Modelo</h2>
                <p className="text-xs text-gray-400 mt-0.5">Seus dados são preservados ao trocar de modelo</p>
              </div>
              <button
                onClick={() => setShowTemplateGallery(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid de modelos */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-4">
                {TEMPLATES.map(({ id, name, desc, Thumb }) => {
                  const active = data.template === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          template: id,
                          ...(TEMPLATE_FONT_DEFAULTS[id] ?? {}),
                          style: {
                            ...prev.style,
                            mainBg: id === 'template3' ? '#F0F0F0' : '#FFFFFF',
                          },
                        }))
                        setShowTemplateGallery(false)
                      }}
                      className={`flex flex-col rounded-xl border-2 overflow-hidden transition-all text-left group ${
                        active
                          ? 'border-gray-800 shadow-md'
                          : 'border-gray-200 hover:border-gray-500 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-full bg-gray-50" style={{ aspectRatio: '3/4', padding: '6px' }}>
                        <Thumb />
                      </div>
                      <div className={`px-3 py-2.5 ${active ? 'bg-gray-800' : 'bg-white group-hover:bg-gray-50'} transition-colors`}>
                        <span className={`block text-xs font-bold ${active ? 'text-white' : 'text-gray-700'}`}>{name}</span>
                        <span className={`block text-xs mt-0.5 leading-tight ${active ? 'text-gray-400' : 'text-gray-400'}`}>{desc}</span>
                      </div>
                    </button>
                  )
                })}
                {/* Placeholders "em breve" */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`soon-${i}`} className="flex flex-col rounded-xl border-2 border-dashed border-gray-200 overflow-hidden opacity-40 cursor-not-allowed">
                    <div className="w-full bg-gray-50 flex items-end justify-center pb-4" style={{ aspectRatio: '3/4' }}>
                      <span className="text-xs text-gray-300 font-medium">Em breve</span>
                    </div>
                    <div className="px-3 py-2.5 bg-white">
                      <span className="block text-xs font-bold text-gray-300">Novo modelo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
