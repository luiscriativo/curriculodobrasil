import { useState, useRef } from 'react'
import { ZoomIn, ZoomOut, Maximize2, Download, Upload, FileDown, Loader2 } from 'lucide-react'
import ResumePreview from './components/ResumePreview.jsx'
import ResumeForm from './components/ResumeForm.jsx'

const ZOOM_MIN = 0.3
const ZOOM_MAX = 1.5
const ZOOM_STEP = 0.1
const ZOOM_DEFAULT = 0.68

const initialData = {
  name: 'SEU NOME COMPLETO',
  subtitle: 'Área de Atuação | Especialidade | Cargo',
  address: 'Rua Exemplo, 123 - Bairro - Cidade UF',
  email: 'seuemail@exemplo.com',
  phone: '(00) 00000-0000',
  photo: null,
  photoX: 50,
  photoY: 50,
  photoScale: 110,
  photoSize: 100,
  photoBorderColor: '#6b7280',
  style: {
    // ── Sidebar — cores ──────────────────────────────
    sidebarBg:                 '#E8E4DC',
    sidebarTitleColor:         '#2d2d2d',
    sidebarItemTitleColor:     '#2d2d2d',
    sidebarItemSubColor:       '#6b7280',
    // ── Sidebar — fontes (master + individuais) ──────
    sidebarMaster:             9,
    sidebarSectionTitleSize:   7,
    sidebarItemTitleSize:      9,
    sidebarItemSubSize:        8,
    // ── Main — cores ─────────────────────────────────
    mainBg:                    '#FFFFFF',
    mainNameColor:             '#2d2d2d',
    mainSectionTitleColor:     '#2d2d2d',
    mainBodyColor:             '#374151',
    mainMutedColor:            '#6b7280',
    // ── Main — fontes (master + individuais) ─────────
    mainMaster:                10,
    mainNameSize:              26,
    mainSubtitleSize:          10,
    mainContactSize:           10,
    mainSectionTitleSize:       9,
    mainBodySize:              10,
    mainCompanySize:           11,
    mainRoleSize:              10,
  },
  social: [
    { id: '1', platform: 'LinkedIn', handle: 'linkedin.com/in/seuperfil' },
    { id: '2', platform: 'Instagram', handle: '@seuperfil' },
  ],
  summary:
    'Descreva aqui seu perfil profissional. Fale sobre sua experiência, competências e o que você busca na sua carreira. Este é um texto de exemplo — substitua pelo seu resumo real.',
  experiences: [
    {
      id: '1',
      company: 'Nome da Empresa',
      role: 'Cargo Ocupado | 2023 – Atual',
      bullets: [
        'Descreva uma atividade ou conquista relevante nesta posição.',
        'Adicione mais detalhes sobre suas responsabilidades e resultados.',
      ],
    },
    {
      id: '2',
      company: 'Empresa Anterior',
      role: 'Cargo Anterior | 2020 – 2023',
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
    },
  ],
  specializations: [
    { id: '1', name: 'Nome do Curso ou Certificação', institution: 'Instituição / Ano' },
  ],
}

// Renders the photo to a circular canvas with the user's crop/zoom settings
// and returns a base64 JPEG — used so the PDF gets the exact cropped version.
const cropToCircle = (src, scale, x, y, outputSize = 400) =>
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
      if (data.photo) {
        exportData.photoCropped = await cropToCircle(
          data.photo, data.photoScale, data.photoX, data.photoY
        )
      }

      setExportStatus('Renderizando currículo…')
      const res = await fetch('https://0yaig28xc6.execute-api.us-east-2.amazonaws.com/default/gerar-pdf-cv/pdf', {
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
      window.location.href = `https://0yaig28xc6.execute-api.us-east-2.amazonaws.com/default/gerar-pdf-cv/download/${token}`

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
      {/* ── Form Panel ─────────────────────────────────────────── */}
      <div
        className="form-panel bg-white shadow-xl flex flex-col"
        style={{ width: '500px', minWidth: '500px', height: '100vh' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <h1 className="text-lg font-bold text-gray-800">Editor de Currículo</h1>
          <span className="text-xs text-gray-400 font-medium">A4 Preview</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ResumeForm data={data} onChange={setData} />
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 flex flex-col gap-2">
          {/* Draft save/load */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveDraft}
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium text-xs"
              title="Salvar rascunho como .json"
            >
              <Download size={13} />
              Salvar rascunho
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium text-xs"
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
              className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-700 active:bg-gray-900 transition-colors font-semibold text-sm disabled:opacity-75 disabled:cursor-not-allowed"
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
    </div>
  )
}
