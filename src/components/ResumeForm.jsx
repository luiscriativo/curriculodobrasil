import { useRef, useState, useCallback } from 'react'
import { Plus, Trash2, User, FileText, Briefcase, GraduationCap, Palette } from 'lucide-react'

// ── UI primitives ─────────────────────────────────────────────────────────────

const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
    {children}
  </label>
)

const Input = ({ value, onChange, placeholder, className = '' }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-300 bg-white ${className}`}
  />
)

const Textarea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-y placeholder-gray-300 bg-white"
  />
)

const AddButton = ({ onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mt-1 font-medium border border-dashed border-gray-200 hover:border-gray-400 rounded-md px-3 py-2 w-full justify-center"
  >
    <Plus size={12} />
    {label}
  </button>
)

const RemoveButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded hover:bg-red-50"
    title="Remover"
  >
    <Trash2 size={13} />
  </button>
)

const Card = ({ children }) => (
  <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/60 flex flex-col gap-2.5">
    {children}
  </div>
)

const FieldGroup = ({ children }) => (
  <div className="flex flex-col gap-3">{children}</div>
)

const uid = () => Math.random().toString(36).slice(2)

const TABS = [
  { id: 'dados',    label: 'Dados',    Icon: User },
  { id: 'perfil',   label: 'Perfil',   Icon: FileText },
  { id: 'carreira', label: 'Carreira', Icon: Briefcase },
  { id: 'formacao', label: 'Formação', Icon: GraduationCap },
  { id: 'estilo',   label: 'Estilo',   Icon: Palette },
]

// ── Style tab helpers ─────────────────────────────────────────────────────────
const ColorField = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-gray-600 flex-1">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 tabular-nums uppercase w-16 text-right">{value}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-gray-200"
        style={{ padding: '2px' }}
      />
    </div>
  </div>
)

// Master slider with collapsible sub-sliders as children
const MasterFontField = ({ label, value, onChange, min = 6, max = 18, children }) => {
  const [open, setOpen] = useState(false)
  return (
    <div>
      {/* Master row */}
      <div className="flex items-center gap-2 mb-1">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors flex-shrink-0"
        >
          <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: '10px' }}>▶</span>
          {label}
        </button>
        <span className="text-xs font-bold text-gray-400 tabular-nums ml-auto">{value}px</span>
      </div>
      <input
        type="range" min={min} max={max} step="0.5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gray-800 mb-1"
        style={{ cursor: 'pointer' }}
      />
      {/* Collapsible sub-sliders */}
      {open && (
        <div className="mt-3 flex flex-col gap-3 pl-3 border-l-2 border-gray-200">
          {children}
        </div>
      )}
    </div>
  )
}

// Sub slider — individual fine-tune (indented)
const FontSizeField = ({ label, value, onChange, min = 5, max = 40 }) => (
  <div className="pl-3 border-l-2 border-gray-100">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs text-gray-400 tabular-nums">{value}px</span>
    </div>
    <input
      type="range" min={min} max={max} step="0.5"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-gray-500"
      style={{ cursor: 'pointer' }}
    />
  </div>
)

const StyleDivider = ({ label }) => (
  <div className="flex items-center gap-2 mt-2 mb-1">
    <div className="flex-1 h-px bg-gray-100" />
    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
)

// ── Photo drag hook ───────────────────────────────────────────────────────────
function usePhotoDrag(data, onChange) {
  return useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX ?? e.touches?.[0]?.clientX
    const startY = e.clientY ?? e.touches?.[0]?.clientY
    const startPX = data.photoX
    const startPY = data.photoY
    const scale   = data.photoScale

    const onMove = (ev) => {
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY
      // The circle preview is 140px. At photoScale, the image overflows by (scale/100 - 1)*140 px
      const CIRCLE = 140
      const excess = Math.max(CIRCLE * (scale / 100 - 1), 1)
      const sens = 100 / excess
      const newX = Math.max(0, Math.min(100, startPX - (cx - startX) * sens))
      const newY = Math.max(0, Math.min(100, startPY - (cy - startY) * sens))
      onChange((prev) => ({ ...prev, photoX: newX, photoY: newY }))
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
  }, [data.photoX, data.photoY, data.photoScale, onChange])
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function ResumeForm({ data, onChange }) {
  const [activeTab, setActiveTab] = useState('dados')
  const fileInputRef = useRef(null)
  const handlePhotoDragStart = usePhotoDrag(data, onChange)

  const set = (field) => (e) =>
    onChange((prev) => ({ ...prev, [field]: e.target.value }))

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () =>
      onChange((prev) => ({ ...prev, photo: reader.result, photoX: 50, photoY: 35, photoScale: 110 }))
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    onChange((prev) => ({ ...prev, photo: null, photoX: 50, photoY: 35, photoScale: 110 }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Social
  const updateSocial = (id, field, value) =>
    onChange((prev) => ({ ...prev, social: prev.social.map((s) => s.id === id ? { ...s, [field]: value } : s) }))
  const addSocial = () =>
    onChange((prev) => ({ ...prev, social: [...prev.social, { id: uid(), platform: '', handle: '' }] }))
  const removeSocial = (id) =>
    onChange((prev) => ({ ...prev, social: prev.social.filter((s) => s.id !== id) }))

  // Experiences
  const updateExp = (id, field, value) =>
    onChange((prev) => ({ ...prev, experiences: prev.experiences.map((e) => e.id === id ? { ...e, [field]: value } : e) }))
  const addExp = () =>
    onChange((prev) => ({ ...prev, experiences: [...prev.experiences, { id: uid(), company: '', role: '', bullets: [''] }] }))
  const removeExp = (id) =>
    onChange((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }))
  const updateBullet = (expId, i, value) =>
    onChange((prev) => ({ ...prev, experiences: prev.experiences.map((e) => e.id === expId ? { ...e, bullets: e.bullets.map((b, idx) => idx === i ? value : b) } : e) }))
  const addBullet = (expId) =>
    onChange((prev) => ({ ...prev, experiences: prev.experiences.map((e) => e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e) }))
  const removeBullet = (expId, i) =>
    onChange((prev) => ({ ...prev, experiences: prev.experiences.map((e) => e.id === expId ? { ...e, bullets: e.bullets.filter((_, idx) => idx !== i) } : e) }))

  // Education
  const updateEdu = (id, field, value) =>
    onChange((prev) => ({ ...prev, education: prev.education.map((e) => e.id === id ? { ...e, [field]: value } : e) }))
  const addEdu = () =>
    onChange((prev) => ({ ...prev, education: [...prev.education, { id: uid(), degree: '', institution: '' }] }))
  const removeEdu = (id) =>
    onChange((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }))

  // Specializations
  const updateSpec = (id, field, value) =>
    onChange((prev) => ({ ...prev, specializations: prev.specializations.map((s) => s.id === id ? { ...s, [field]: value } : s) }))
  const addSpec = () =>
    onChange((prev) => ({ ...prev, specializations: [...prev.specializations, { id: uid(), name: '', institution: '' }] }))
  const removeSpec = (id) =>
    onChange((prev) => ({ ...prev, specializations: prev.specializations.filter((s) => s.id !== id) }))

  return (
    <div className="flex flex-col gap-0">

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                active ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Dados ─────────────────────────────────────────────────────────── */}
      {activeTab === 'dados' && (
        <FieldGroup>
          <div>
            <Label>Nome Completo</Label>
            <Input value={data.name} onChange={set('name')} placeholder="SEU NOME" />
          </div>
          <div>
            <Label>Subtítulo / Áreas</Label>
            <Input value={data.subtitle} onChange={set('subtitle')} placeholder="Área 1 | Área 2 | Área 3" />
          </div>
          <div>
            <Label>Endereço</Label>
            <Input value={data.address} onChange={set('address')} placeholder="Rua, número, cidade" />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input value={data.email} onChange={set('email')} placeholder="seu@email.com" />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={data.phone} onChange={set('phone')} placeholder="(00) 00000-0000" />
          </div>

          {/* ── Foto ── */}
          <div className="pt-1">
            <Label>Foto de Perfil</Label>
            {data.photo ? (
              <div className="flex flex-col items-center gap-3 mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100">

                {/* Draggable circle preview */}
                <div
                  onMouseDown={handlePhotoDragStart}
                  onTouchStart={handlePhotoDragStart}
                  title="Arraste para reposicionar"
                  style={{
                    width: 140, height: 140,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #d1d5db',
                    cursor: 'grab',
                    userSelect: 'none',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}
                >
                  <img
                    src={data.photo}
                    draggable={false}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      objectPosition: `${data.photoX}% ${data.photoY}%`,
                      transform: `scale(${data.photoScale / 100})`,
                      transformOrigin: `${data.photoX}% ${data.photoY}%`,
                      pointerEvents: 'none',
                      display: 'block',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 -mt-1">Arraste a foto para reposicionar</p>

                {/* Sliders */}
                <div className="w-full flex flex-col gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label>Zoom da foto</Label>
                      <span className="text-xs text-gray-400 tabular-nums">{data.photoScale}%</span>
                    </div>
                    <input
                      type="range" min="100" max="250" step="1"
                      value={data.photoScale}
                      onChange={(e) => onChange((prev) => ({ ...prev, photoScale: Number(e.target.value) }))}
                      className="w-full accent-gray-700"
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label>Posição horizontal</Label>
                      <span className="text-xs text-gray-400 tabular-nums">{Math.round(data.photoX)}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="0.5"
                      value={data.photoX}
                      onChange={(e) => onChange((prev) => ({ ...prev, photoX: Number(e.target.value) }))}
                      className="w-full accent-gray-700"
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label>Posição vertical</Label>
                      <span className="text-xs text-gray-400 tabular-nums">{Math.round(data.photoY)}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="0.5"
                      value={data.photoY}
                      onChange={(e) => onChange((prev) => ({ ...prev, photoY: Number(e.target.value) }))}
                      className="w-full accent-gray-700"
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label>Tamanho da foto</Label>
                      <span className="text-xs text-gray-400 tabular-nums">{data.photoSize ?? 100}px</span>
                    </div>
                    <input
                      type="range" min="60" max="160" step="2"
                      value={data.photoSize ?? 100}
                      onChange={(e) => onChange((prev) => ({ ...prev, photoSize: Number(e.target.value) }))}
                      className="w-full accent-gray-700"
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Label>Cor da borda</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 tabular-nums uppercase w-16 text-right">
                        {data.photoBorderColor ?? '#6b7280'}
                      </span>
                      <input
                        type="color"
                        value={data.photoBorderColor ?? '#6b7280'}
                        onChange={(e) => onChange((prev) => ({ ...prev, photoBorderColor: e.target.value }))}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                        style={{ padding: '1px' }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removePhoto}
                  className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                >
                  Remover foto
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center cursor-pointer hover:border-gray-400 transition-colors mt-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-xs text-gray-400">Clique para selecionar uma foto</p>
                <p className="text-xs text-gray-300 mt-0.5">JPG, PNG ou WEBP</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
        </FieldGroup>
      )}

      {/* ── Perfil ────────────────────────────────────────────────────────── */}
      {activeTab === 'perfil' && (
        <FieldGroup>
          <div>
            <Label>Resumo Profissional</Label>
            <Textarea value={data.summary} onChange={set('summary')} placeholder="Descreva seu perfil profissional..." rows={6} />
          </div>
          <div className="pt-1">
            <Label>Redes Sociais</Label>
            <div className="flex flex-col gap-2 mt-1">
              {data.social.map((s) => (
                <Card key={s.id}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 flex flex-col gap-2">
                      <div>
                        <Label>Plataforma</Label>
                        <Input value={s.platform} onChange={(e) => updateSocial(s.id, 'platform', e.target.value)} placeholder="Facebook, Instagram, LinkedIn..." />
                      </div>
                      <div>
                        <Label>Usuário / Link</Label>
                        <Input value={s.handle} onChange={(e) => updateSocial(s.id, 'handle', e.target.value)} placeholder="@usuario ou url" />
                      </div>
                    </div>
                    <RemoveButton onClick={() => removeSocial(s.id)} />
                  </div>
                </Card>
              ))}
              <AddButton onClick={addSocial} label="Adicionar rede social" />
            </div>
          </div>
        </FieldGroup>
      )}

      {/* ── Carreira ──────────────────────────────────────────────────────── */}
      {activeTab === 'carreira' && (
        <FieldGroup>
          <Label>Experiências de Trabalho</Label>
          <div className="flex flex-col gap-3">
            {data.experiences.map((exp) => (
              <Card key={exp.id}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 flex flex-col gap-2">
                    <div>
                      <Label>Empresa</Label>
                      <Input value={exp.company} onChange={(e) => updateExp(exp.id, 'company', e.target.value)} placeholder="Nome da empresa" />
                    </div>
                    <div>
                      <Label>Cargo e Período</Label>
                      <Input value={exp.role} onChange={(e) => updateExp(exp.id, 'role', e.target.value)} placeholder="Cargo | 2023 – 2024" />
                    </div>
                    <div>
                      <Label>Atividades</Label>
                      <div className="flex flex-col gap-2">
                        {exp.bullets.map((bullet, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-gray-300 mt-2 text-xs flex-shrink-0">&bull;</span>
                            <Textarea value={bullet} onChange={(e) => updateBullet(exp.id, i, e.target.value)} placeholder="Descreva uma atividade..." rows={2} />
                            {exp.bullets.length > 1 && (
                              <button type="button" onClick={() => removeBullet(exp.id, i)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-2">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        <AddButton onClick={() => addBullet(exp.id)} label="Adicionar bullet" />
                      </div>
                    </div>
                  </div>
                  <RemoveButton onClick={() => removeExp(exp.id)} />
                </div>
              </Card>
            ))}
            <AddButton onClick={addExp} label="Adicionar experiência" />
          </div>
        </FieldGroup>
      )}

      {/* ── Formação ──────────────────────────────────────────────────────── */}
      {activeTab === 'formacao' && (
        <FieldGroup>
          <div>
            <Label>Formação Acadêmica</Label>
            <div className="flex flex-col gap-2 mt-1">
              {data.education.map((edu) => (
                <Card key={edu.id}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 flex flex-col gap-2">
                      <div>
                        <Label>Curso / Grau</Label>
                        <Input value={edu.degree} onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)} placeholder="Graduação em..." />
                      </div>
                      <div>
                        <Label>Instituição e Período</Label>
                        <Input value={edu.institution} onChange={(e) => updateEdu(edu.id, 'institution', e.target.value)} placeholder="Instituição / 2022 – 2024" />
                      </div>
                    </div>
                    <RemoveButton onClick={() => removeEdu(edu.id)} />
                  </div>
                </Card>
              ))}
              <AddButton onClick={addEdu} label="Adicionar formação" />
            </div>
          </div>
          <div className="pt-1">
            <Label>Especializações</Label>
            <div className="flex flex-col gap-2 mt-1">
              {data.specializations.map((spec) => (
                <Card key={spec.id}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 flex flex-col gap-2">
                      <div>
                        <Label>Nome do Curso</Label>
                        <Input value={spec.name} onChange={(e) => updateSpec(spec.id, 'name', e.target.value)} placeholder="Modelagem de Vestuário" />
                      </div>
                      <div>
                        <Label>Instituição e Ano</Label>
                        <Input value={spec.institution} onChange={(e) => updateSpec(spec.id, 'institution', e.target.value)} placeholder="Instituição / 2023" />
                      </div>
                    </div>
                    <RemoveButton onClick={() => removeSpec(spec.id)} />
                  </div>
                </Card>
              ))}
              <AddButton onClick={addSpec} label="Adicionar especialização" />
            </div>
          </div>
        </FieldGroup>
      )}

      {/* ── Estilo ────────────────────────────────────────────────────────── */}
      {activeTab === 'estilo' && (
        <FieldGroup>

          {/* ════ SIDEBAR (ESQUERDA) ════ */}
          <StyleDivider label="Barra Lateral (Esquerda)" />

          {/* Cores */}
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <ColorField label="Cor de fundo"           value={data.style.sidebarBg}             onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, sidebarBg: v } }))} />
            <ColorField label="Títulos de seção"       value={data.style.sidebarTitleColor}      onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, sidebarTitleColor: v } }))} />
            <ColorField label="Nomes em negrito"       value={data.style.sidebarItemTitleColor}  onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, sidebarItemTitleColor: v } }))} />
            <ColorField label="Subtítulos/instituições" value={data.style.sidebarItemSubColor}   onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, sidebarItemSubColor: v } }))} />
          </div>

          {/* Fontes sidebar */}
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <MasterFontField
              label="↕ Escala geral da sidebar"
              value={data.style.sidebarMaster}
              min={6} max={18}
              onChange={(v) => {
                const ratio = v / data.style.sidebarMaster
                onChange((p) => ({ ...p, style: {
                  ...p.style,
                  sidebarMaster: v,
                  sidebarSectionTitleSize: Math.round(p.style.sidebarSectionTitleSize * ratio * 2) / 2,
                  sidebarItemTitleSize:    Math.round(p.style.sidebarItemTitleSize    * ratio * 2) / 2,
                  sidebarItemSubSize:      Math.round(p.style.sidebarItemSubSize      * ratio * 2) / 2,
                }}))
              }}
            >
              <FontSizeField label="Títulos de seção (SOCIAL, FORMAÇÃO...)" value={data.style.sidebarSectionTitleSize} min={5} max={16} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, sidebarSectionTitleSize: v } }))} />
              <FontSizeField label="Nomes (Facebook, Modelagem...)"          value={data.style.sidebarItemTitleSize}    min={5} max={18} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, sidebarItemTitleSize: v } }))} />
              <FontSizeField label="Subtítulos (handles, instituições)"      value={data.style.sidebarItemSubSize}      min={5} max={16} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, sidebarItemSubSize: v } }))} />
            </MasterFontField>
          </div>

          {/* ════ MAIN (DIREITA) ════ */}
          <StyleDivider label="Conteúdo Principal (Direita)" />

          {/* Cores */}
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <ColorField label="Cor de fundo"        value={data.style.mainBg}               onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainBg: v } }))} />
            <ColorField label="Cor do nome"         value={data.style.mainNameColor}         onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainNameColor: v } }))} />
            <ColorField label="Títulos de seção"    value={data.style.mainSectionTitleColor} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainSectionTitleColor: v } }))} />
            <ColorField label="Texto do corpo"      value={data.style.mainBodyColor}         onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainBodyColor: v } }))} />
            <ColorField label="Texto suave/ícones"  value={data.style.mainMutedColor}        onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainMutedColor: v } }))} />
          </div>

          {/* Fontes main */}
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <MasterFontField
              label="↕ Escala geral do conteúdo"
              value={data.style.mainMaster}
              min={7} max={20}
              onChange={(v) => {
                const ratio = v / data.style.mainMaster
                onChange((p) => ({ ...p, style: {
                  ...p.style,
                  mainMaster:           v,
                  mainNameSize:         Math.round(p.style.mainNameSize         * ratio * 2) / 2,
                  mainSubtitleSize:     Math.round(p.style.mainSubtitleSize     * ratio * 2) / 2,
                  mainContactSize:      Math.round(p.style.mainContactSize      * ratio * 2) / 2,
                  mainSectionTitleSize: Math.round(p.style.mainSectionTitleSize * ratio * 2) / 2,
                  mainBodySize:         Math.round(p.style.mainBodySize         * ratio * 2) / 2,
                  mainCompanySize:      Math.round(p.style.mainCompanySize      * ratio * 2) / 2,
                  mainRoleSize:         Math.round(p.style.mainRoleSize         * ratio * 2) / 2,
                }}))
              }}
            >
              <FontSizeField label="Nome (ALANA RODRIGUES)"       value={data.style.mainNameSize}         min={14} max={48} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainNameSize: v } }))} />
              <FontSizeField label="Subtítulo / áreas"            value={data.style.mainSubtitleSize}     min={6}  max={18} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainSubtitleSize: v } }))} />
              <FontSizeField label="Contato (endereço, email...)" value={data.style.mainContactSize}      min={6}  max={18} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainContactSize: v } }))} />
              <FontSizeField label="Títulos de seção"             value={data.style.mainSectionTitleSize} min={6}  max={18} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainSectionTitleSize: v } }))} />
              <FontSizeField label="Texto do corpo / resumo"      value={data.style.mainBodySize}         min={6}  max={18} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainBodySize: v } }))} />
              <FontSizeField label="Nome da empresa"              value={data.style.mainCompanySize}      min={6}  max={20} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainCompanySize: v } }))} />
              <FontSizeField label="Cargo / período (itálico)"   value={data.style.mainRoleSize}         min={6}  max={18} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainRoleSize: v } }))} />
            </MasterFontField>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={() => onChange((p) => ({ ...p, style: {
              sidebarBg: '#E8E4DC', sidebarTitleColor: '#2d2d2d',
              sidebarItemTitleColor: '#2d2d2d', sidebarItemSubColor: '#6b7280',
              sidebarMaster: 9, sidebarSectionTitleSize: 7, sidebarItemTitleSize: 9, sidebarItemSubSize: 8,
              mainBg: '#FFFFFF', mainNameColor: '#2d2d2d',
              mainSectionTitleColor: '#2d2d2d', mainBodyColor: '#374151', mainMutedColor: '#6b7280',
              mainMaster: 10, mainNameSize: 26, mainSubtitleSize: 10, mainContactSize: 10,
              mainSectionTitleSize: 9, mainBodySize: 10, mainCompanySize: 11, mainRoleSize: 10,
            }}))}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors text-center mt-1 py-2 border border-dashed border-gray-200 rounded-lg hover:border-gray-400"
          >
            Restaurar todos os padrões
          </button>

        </FieldGroup>
      )}

    </div>
  )
}
