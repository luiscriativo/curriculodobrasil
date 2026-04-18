import { useRef, useState, useCallback, useEffect } from 'react'
import { Plus, Trash2, User, FileText, Briefcase, GraduationCap, Palette } from 'lucide-react'
import { IconPicker } from '../data/platformIcons.jsx'
import { FONTS, FONT_GROUPS, FONT_MAP } from '../data/fonts.js'

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

// ── Font selector dropdown ────────────────────────────────────────────────────
function FontSelect({ value, onChange, fonts }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = FONT_MAP[value] ?? fonts[0]

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white hover:border-gray-400 transition-colors"
      >
        <span className="text-sm text-gray-800 truncate" style={{ fontFamily: current.family }}>{current.label}</span>
        <span className="text-gray-400 text-xs ml-2 flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          className="absolute z-30 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 overflow-y-auto"
          style={{ maxHeight: '220px' }}
        >
          {fonts.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => { onChange(font.id); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${value === font.id ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}
              style={{ fontFamily: font.family }}
            >
              {font.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Font + size combined field ────────────────────────────────────────────────
function FontField({ label, sizeValue, onSizeChange, fontValue, onFontChange, min = 5, max = 40 }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const allFonts = [...FONT_GROUPS.display, ...FONT_GROUPS.body]
  const current = FONT_MAP[fontValue]

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="pl-3 border-l-2 border-gray-100" ref={ref}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <div className="flex items-center gap-2">
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="text-xs border border-gray-200 rounded-md px-2 py-0.5 bg-white hover:border-gray-400 transition-colors"
              style={{ fontFamily: current?.family, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
            >
              {current?.label ?? '—'}
            </button>
            {open && (
              <div
                className="absolute right-0 z-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto"
                style={{ width: '170px', maxHeight: '200px', top: 'calc(100% + 4px)' }}
              >
                {allFonts.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => { onFontChange(font.id); setOpen(false) }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${fontValue === font.id ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}
                    style={{ fontFamily: font.family }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400 tabular-nums">{sizeValue}px</span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step="0.5"
        value={sizeValue}
        onChange={(e) => onSizeChange(Number(e.target.value))}
        className="w-full accent-gray-500"
        style={{ cursor: 'pointer' }}
      />
    </div>
  )
}

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
    onChange((prev) => ({ ...prev, social: [...prev.social, { id: uid(), platform: '', handle: '', icon: null }] }))
  const removeSocial = (id) =>
    onChange((prev) => ({ ...prev, social: prev.social.filter((s) => s.id !== id) }))

  // Experiences
  const updateExp = (id, field, value) =>
    onChange((prev) => ({ ...prev, experiences: prev.experiences.map((e) => e.id === id ? { ...e, [field]: value } : e) }))
  const addExp = () =>
    onChange((prev) => ({ ...prev, experiences: [...prev.experiences, { id: uid(), company: '', role: '', description: '', bullets: [''] }] }))
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

  // Skills (template 2)
  const updateSkill = (id, value) =>
    onChange((prev) => ({ ...prev, skills: (prev.skills ?? []).map((s) => s.id === id ? { ...s, name: value } : s) }))
  const addSkill = () =>
    onChange((prev) => ({ ...prev, skills: [...(prev.skills ?? []), { id: uid(), name: '' }] }))
  const removeSkill = (id) =>
    onChange((prev) => ({ ...prev, skills: (prev.skills ?? []).filter((s) => s.id !== id) }))

  // Awards (template 2)
  const updateAward = (id, field, value) =>
    onChange((prev) => ({ ...prev, awards: (prev.awards ?? []).map((a) => a.id === id ? { ...a, [field]: value } : a) }))
  const addAward = () =>
    onChange((prev) => ({ ...prev, awards: [...(prev.awards ?? []), { id: uid(), title: '', organization: '', yearLocation: '' }] }))
  const removeAward = (id) =>
    onChange((prev) => ({ ...prev, awards: (prev.awards ?? []).filter((a) => a.id !== id) }))

  // References (template 3)
  const updateReference = (id, field, value) =>
    onChange((prev) => ({ ...prev, references: (prev.references ?? []).map((r) => r.id === id ? { ...r, [field]: value } : r) }))
  const addReference = () =>
    onChange((prev) => ({ ...prev, references: [...(prev.references ?? []), { id: uid(), name: '', title: '', location: '', email: '' }] }))
  const removeReference = (id) =>
    onChange((prev) => ({ ...prev, references: (prev.references ?? []).filter((r) => r.id !== id) }))

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
            <div className="flex items-center justify-between mb-1">
              <Label>Endereço</Label>
              <IconPicker value={data.addressIcon ?? null} onChange={(v) => onChange((p) => ({ ...p, addressIcon: v }))} />
            </div>
            <Input value={data.address} onChange={set('address')} placeholder="Rua, número, cidade" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>E-mail</Label>
              <IconPicker value={data.emailIcon ?? null} onChange={(v) => onChange((p) => ({ ...p, emailIcon: v }))} />
            </div>
            <Input value={data.email} onChange={set('email')} placeholder="seu@email.com" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Telefone</Label>
              <IconPicker value={data.phoneIcon ?? null} onChange={(v) => onChange((p) => ({ ...p, phoneIcon: v }))} />
            </div>
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

                  {data.template !== 'template3' && (
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
                  )}

                  {data.template !== 'template3' && (
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
                  )}

                  {data.template !== 'template3' && (
                    <div className="flex items-center justify-between gap-3">
                      <Label>Ocultar borda</Label>
                      <button
                        type="button"
                        onClick={() => onChange((prev) => ({ ...prev, photoBorderHidden: !prev.photoBorderHidden }))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${data.photoBorderHidden ? 'bg-gray-700' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${data.photoBorderHidden ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <Label>Ocultar foto</Label>
                    <button
                      type="button"
                      onClick={() => onChange((prev) => ({ ...prev, photoHidden: !prev.photoHidden }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${data.photoHidden ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${data.photoHidden ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Label>Preto e branco</Label>
                    <button
                      type="button"
                      onClick={() => onChange((prev) => ({ ...prev, photoGrayscale: !prev.photoGrayscale }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${data.photoGrayscale ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${data.photoGrayscale ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
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
                        <div className="flex items-center justify-between mb-1">
                          <Label>Plataforma</Label>
                          <IconPicker value={s.icon ?? null} onChange={(v) => updateSocial(s.id, 'icon', v)} />
                        </div>
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
          {data.template === 'template2' && (
            <p className="text-xs text-gray-400 -mt-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              Neste modelo, o <strong>Cargo</strong> aparece em destaque e a <strong>Empresa</strong> como subtítulo.
            </p>
          )}
          <div className="flex flex-col gap-3">
            {data.experiences.map((exp) => (
              <Card key={exp.id}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 flex flex-col gap-2">
                    {data.template === 'template2' ? (
                      <>
                        <div>
                          <Label>Cargo / Título</Label>
                          <Input value={exp.role} onChange={(e) => updateExp(exp.id, 'role', e.target.value)} placeholder="Nome do Cargo" />
                        </div>
                        <div>
                          <Label>Empresa | Local | Período</Label>
                          <Input value={exp.company} onChange={(e) => updateExp(exp.id, 'company', e.target.value)} placeholder="Empresa | Cidade | 2023 – Atual" />
                        </div>
                        <div>
                          <Label>Descrição (opcional)</Label>
                          <Textarea value={exp.description ?? ''} onChange={(e) => updateExp(exp.id, 'description', e.target.value)} placeholder="Breve descrição da posição e responsabilidades..." rows={2} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label>Empresa</Label>
                          <Input value={exp.company} onChange={(e) => updateExp(exp.id, 'company', e.target.value)} placeholder="Nome da empresa" />
                        </div>
                        <div>
                          <Label>Cargo e Período</Label>
                          <Input value={exp.role} onChange={(e) => updateExp(exp.id, 'role', e.target.value)} placeholder="Cargo | 2023 – 2024" />
                        </div>
                      </>
                    )}
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
                      {data.template === 'template3' && (
                        <div>
                          <Label>Descrição (opcional)</Label>
                          <Textarea value={edu.description ?? ''} onChange={(e) => updateEdu(edu.id, 'description', e.target.value)} placeholder="Breve descrição do curso..." rows={2} />
                        </div>
                      )}
                    </div>
                    <RemoveButton onClick={() => removeEdu(edu.id)} />
                  </div>
                </Card>
              ))}
              <AddButton onClick={addEdu} label="Adicionar formação" />
            </div>
          </div>

          {/* Template 1: Especializações */}
          {data.template !== 'template2' && data.template !== 'template3' && (
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
          )}

          {/* Template 2: Habilidades */}
          {data.template === 'template2' && (
            <div className="pt-1">
              <Label>Habilidades</Label>
              <div className="flex flex-col gap-2 mt-1">
                {(data.skills ?? []).map((skill) => (
                  <div key={skill.id} className="flex items-center gap-2">
                    <Input value={skill.name} onChange={(e) => updateSkill(skill.id, e.target.value)} placeholder="Nome da habilidade" />
                    <RemoveButton onClick={() => removeSkill(skill.id)} />
                  </div>
                ))}
                <AddButton onClick={addSkill} label="Adicionar habilidade" />
              </div>
            </div>
          )}

          {/* Template 2: Prêmios */}
          {data.template === 'template2' && (
            <div className="pt-1">
              <Label>Prêmios e Conquistas</Label>
              <div className="flex flex-col gap-2 mt-1">
                {(data.awards ?? []).map((award) => (
                  <Card key={award.id}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 flex flex-col gap-2">
                        <div>
                          <Label>Nome do Prêmio</Label>
                          <Input value={award.title} onChange={(e) => updateAward(award.id, 'title', e.target.value)} placeholder="Nome do prêmio ou conquista" />
                        </div>
                        <div>
                          <Label>Organização / Evento</Label>
                          <Input value={award.organization} onChange={(e) => updateAward(award.id, 'organization', e.target.value)} placeholder="Nome da organização" />
                        </div>
                        <div>
                          <Label>Ano – Local</Label>
                          <Input value={award.yearLocation} onChange={(e) => updateAward(award.id, 'yearLocation', e.target.value)} placeholder="2023 – São Paulo" />
                        </div>
                      </div>
                      <RemoveButton onClick={() => removeAward(award.id)} />
                    </div>
                  </Card>
                ))}
                <AddButton onClick={addAward} label="Adicionar prêmio" />
              </div>
            </div>
          )}

          {/* Template 3: Habilidades */}
          {data.template === 'template3' && (
            <div className="pt-1">
              <Label>Habilidades</Label>
              <div className="flex flex-col gap-2 mt-1">
                {(data.skills ?? []).map((skill) => (
                  <div key={skill.id} className="flex items-center gap-2">
                    <Input value={skill.name} onChange={(e) => updateSkill(skill.id, e.target.value)} placeholder="Nome da habilidade" />
                    <RemoveButton onClick={() => removeSkill(skill.id)} />
                  </div>
                ))}
                <AddButton onClick={addSkill} label="Adicionar habilidade" />
              </div>
            </div>
          )}

          {/* Template 3: Referências */}
          {data.template === 'template3' && (
            <div className="pt-1">
              <Label>Referências</Label>
              <div className="flex flex-col gap-2 mt-1">
                {(data.references ?? []).map((ref) => (
                  <Card key={ref.id}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 flex flex-col gap-2">
                        <div>
                          <Label>Nome</Label>
                          <Input value={ref.name} onChange={(e) => updateReference(ref.id, 'name', e.target.value)} placeholder="Nome completo" />
                        </div>
                        <div>
                          <Label>Cargo / Empresa</Label>
                          <Input value={ref.title} onChange={(e) => updateReference(ref.id, 'title', e.target.value)} placeholder="Cargo na Empresa" />
                        </div>
                        <div>
                          <Label>Cidade / Telefone</Label>
                          <Input value={ref.location} onChange={(e) => updateReference(ref.id, 'location', e.target.value)} placeholder="Cidade, UF · (00) 00000-0000" />
                        </div>
                        <div>
                          <Label>E-mail</Label>
                          <Input value={ref.email} onChange={(e) => updateReference(ref.id, 'email', e.target.value)} placeholder="referencia@email.com" />
                        </div>
                      </div>
                      <RemoveButton onClick={() => removeReference(ref.id)} />
                    </div>
                  </Card>
                ))}
                <AddButton onClick={addReference} label="Adicionar referência" />
              </div>
            </div>
          )}
        </FieldGroup>
      )}

      {/* ── Estilo — Fontes (Template 1 apenas) ────────────────────────────── */}
      {activeTab === 'estilo' && data.template !== 'template2' && data.template !== 'template3' && (
        <div className="mb-5">
          <StyleDivider label="Fontes" />
          <div className="flex flex-col gap-3 mt-1">
            <div>
              <Label>Fonte do nome / destaque</Label>
              <FontSelect
                value={data.fontDisplay ?? 'montserrat'}
                onChange={(v) => onChange((p) => ({ ...p, fontDisplay: v }))}
                fonts={[...FONT_GROUPS.display, ...FONT_GROUPS.body]}
              />
            </div>
            <div>
              <Label>Fonte do corpo / texto</Label>
              <FontSelect
                value={data.fontBody ?? 'opensans'}
                onChange={(v) => onChange((p) => ({ ...p, fontBody: v }))}
                fonts={[...FONT_GROUPS.body, ...FONT_GROUPS.display]}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Estilo ────────────────────────────────────────────────────────── */}
      {activeTab === 'estilo' && data.template === 'template2' && (
        <FieldGroup>

          <StyleDivider label="Cores" />
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <ColorField label="Fundo da página"       value={data.style.mainBg}              onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainBg: v } }))} />
            <ColorField label="Cor do nome"           value={data.style.mainNameColor}        onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainNameColor: v } }))} />
            <ColorField label="Texto do corpo"        value={data.style.mainBodyColor}        onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainBodyColor: v } }))} />
            <ColorField label="Texto suave / ícones"  value={data.style.mainMutedColor}       onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainMutedColor: v } }))} />
            <ColorField label="Títulos de seção"      value={data.style.t2SectionTitleColor ?? '#9ca3af'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2SectionTitleColor: v } }))} />
            <ColorField label="Linhas divisórias"     value={data.style.t2DividerColor ?? '#d1d5db'}      onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2DividerColor: v } }))} />
            <ColorField label="Cor de destaque (foto e rodapé)" value={data.style.t2AccentColor ?? '#e5e7eb'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2AccentColor: v } }))} />
          </div>

          <StyleDivider label="Fontes e Tamanhos" />
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <MasterFontField
              label="↕ Escala geral"
              value={data.style.t2Master ?? 9}
              min={6} max={18}
              onChange={(v) => {
                const ratio = v / (data.style.t2Master ?? 9)
                onChange((p) => ({ ...p, style: {
                  ...p.style,
                  t2Master:            v,
                  t2NameSize:          Math.round((p.style.t2NameSize          ?? 30) * ratio * 2) / 2,
                  t2SubtitleSize:      Math.round((p.style.t2SubtitleSize      ??  9) * ratio * 2) / 2,
                  t2ContactSize:       Math.round((p.style.t2ContactSize       ??  9) * ratio * 2) / 2,
                  t2SectionTitleSize:  Math.round((p.style.t2SectionTitleSize  ??  8) * ratio * 2) / 2,
                  t2BodySize:          Math.round((p.style.t2BodySize          ??  9) * ratio * 2) / 2,
                  t2CompanySize:       Math.round((p.style.t2CompanySize       ?? 10) * ratio * 2) / 2,
                  t2RoleSize:          Math.round((p.style.t2RoleSize          ??  9) * ratio * 2) / 2,
                }}))
              }}
            >
              <FontField
                label="Nome (destaque no cabeçalho)"
                sizeValue={data.style.t2NameSize ?? 30}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2NameSize: v } }))}
                fontValue={data.style.t2FontName ?? 'raleway'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2FontName: v } }))}
                min={16} max={50}
              />
              <FontField
                label="Cargo / subtítulo"
                sizeValue={data.style.t2SubtitleSize ?? 9}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2SubtitleSize: v } }))}
                fontValue={data.style.t2FontSubtitle ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2FontSubtitle: v } }))}
                min={5} max={16}
              />
              <FontField
                label="Contato (telefone, email...)"
                sizeValue={data.style.t2ContactSize ?? 9}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2ContactSize: v } }))}
                fontValue={data.style.t2FontContact ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2FontContact: v } }))}
                min={5} max={16}
              />
              <FontField
                label="Títulos de seção"
                sizeValue={data.style.t2SectionTitleSize ?? 8}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2SectionTitleSize: v } }))}
                fontValue={data.style.t2FontSectionTitle ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2FontSectionTitle: v } }))}
                min={5} max={14}
              />
              <FontField
                label="Texto do corpo / resumo"
                sizeValue={data.style.t2BodySize ?? 9}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2BodySize: v } }))}
                fontValue={data.style.t2FontBody ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2FontBody: v } }))}
                min={5} max={16}
              />
              <FontField
                label="Cargo/empresa (negrito)"
                sizeValue={data.style.t2CompanySize ?? 10}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2CompanySize: v } }))}
                fontValue={data.style.t2FontCompany ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2FontCompany: v } }))}
                min={5} max={18}
              />
              <FontField
                label="Empresa/período (itálico)"
                sizeValue={data.style.t2RoleSize ?? 9}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2RoleSize: v } }))}
                fontValue={data.style.t2FontRole ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t2FontRole: v } }))}
                min={5} max={16}
              />
            </MasterFontField>
          </div>

          <button
            type="button"
            onClick={() => onChange((p) => ({ ...p, style: {
              ...p.style,
              mainBg: '#FFFFFF', mainNameColor: '#2d2d2d', mainBodyColor: '#374151', mainMutedColor: '#9ca3af',
              t2Master: 9, t2NameSize: 30, t2SubtitleSize: 9, t2ContactSize: 9,
              t2SectionTitleSize: 8, t2SectionTitleColor: '#9ca3af',
              t2BodySize: 9, t2CompanySize: 10, t2RoleSize: 9, t2DividerColor: '#d1d5db',
              t2AccentColor: '#e5e7eb',
              t2FontName: 'raleway', t2FontSubtitle: 'lato', t2FontContact: 'lato',
              t2FontSectionTitle: 'lato', t2FontBody: 'lato', t2FontCompany: 'lato', t2FontRole: 'lato',
            }}))}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors text-center mt-1 py-2 border border-dashed border-gray-200 rounded-lg hover:border-gray-400"
          >
            Restaurar todos os padrões
          </button>

        </FieldGroup>
      )}

      {/* ── Estilo — Template 3 ─────────────────────────────────────────────── */}
      {activeTab === 'estilo' && data.template === 'template3' && (
        <FieldGroup>

          <StyleDivider label="Barras de Acento (Topo e Rodapé)" />
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <ColorField label="Cor da barra do topo" value={data.style.t3AccentBarColor ?? '#858587'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3AccentBarColor: v } }))} />
            <ColorField label="Rodapé — esquerda" value={data.style.t3BottomBarLeftColor ?? '#ACABB0'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3BottomBarLeftColor: v } }))} />
            <ColorField label="Rodapé — direita" value={data.style.t3BottomBarRightColor ?? '#858587'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3BottomBarRightColor: v } }))} />
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Espessura das barras</span>
                <span className="text-xs text-gray-400 tabular-nums">{data.style.t3AccentBarHeight ?? 7}px</span>
              </div>
              <input
                type="range" min={0} max={24} step={1}
                value={data.style.t3AccentBarHeight ?? 7}
                onChange={(e) => onChange((p) => ({ ...p, style: { ...p.style, t3AccentBarHeight: Number(e.target.value) } }))}
                className="w-full accent-gray-800"
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>

          <StyleDivider label="Cores da Sidebar" />
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <ColorField label="Fundo da sidebar"        value={data.style.t3SidebarBg         ?? '#F5F5F5'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3SidebarBg: v } }))} />
            <ColorField label="Nome (sidebar)"          value={data.style.t3SidebarNameColor  ?? '#1a1a1a'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3SidebarNameColor: v } }))} />
            <ColorField label="Subtítulo / itálico"     value={data.style.t3SidebarSubColor   ?? '#6b6b6b'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3SidebarSubColor: v } }))} />
            <ColorField label="Texto geral (sidebar)"   value={data.style.t3SidebarTextColor  ?? '#3d3d3d'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3SidebarTextColor: v } }))} />
          </div>

          <StyleDivider label="Cores do Conteúdo" />
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <ColorField label="Fundo do conteúdo"        value={data.style.mainBg              ?? '#F0F0F0'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, mainBg: v } }))} />
            <ColorField label="Títulos de seção"        value={data.style.t3SectionTitleColor ?? '#1a1a1a'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3SectionTitleColor: v } }))} />
            <ColorField label="Cargo / título do item"  value={data.style.t3JobTitleColor     ?? '#1a1a1a'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3JobTitleColor: v } }))} />
            <ColorField label="Empresa / sub-título"    value={data.style.t3CompanyColor      ?? '#6b7280'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3CompanyColor: v } }))} />
            <ColorField label="Texto do corpo"          value={data.style.t3BodyColor         ?? '#3d3d3d'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3BodyColor: v } }))} />
            <ColorField label="Data / itálico"          value={data.style.t3DateColor         ?? '#6b7280'} onChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3DateColor: v } }))} />
          </div>

          <StyleDivider label="Foto" />
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Altura da foto</span>
                <span className="text-xs text-gray-400 tabular-nums">{data.style.t3PhotoHeight ?? 310}px</span>
              </div>
              <input
                type="range" min={80} max={420} step={4}
                value={data.style.t3PhotoHeight ?? 310}
                onChange={(e) => onChange((p) => ({ ...p, style: { ...p.style, t3PhotoHeight: Number(e.target.value) } }))}
                className="w-full accent-gray-800"
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>

          <StyleDivider label="Fontes e Tamanhos" />
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
            <MasterFontField
              label="↕ Escala geral"
              value={data.style.t3Master ?? 9}
              min={6} max={18}
              onChange={(v) => {
                const ratio = v / (data.style.t3Master ?? 9)
                onChange((p) => ({ ...p, style: {
                  ...p.style,
                  t3Master:           v,
                  t3NameSize:         Math.round((p.style.t3NameSize         ?? 37)   * ratio * 2) / 2,
                  t3SubtitleSize:     Math.round((p.style.t3SubtitleSize     ?? 11.5) * ratio * 2) / 2,
                  t3SectionTitleSize: Math.round((p.style.t3SectionTitleSize ?? 17.5) * ratio * 2) / 2,
                  t3JobTitleSize:     Math.round((p.style.t3JobTitleSize     ?? 17)   * ratio * 2) / 2,
                  t3BodySize:         Math.round((p.style.t3BodySize         ?? 13.5) * ratio * 2) / 2,
                  t3DateSize:         Math.round((p.style.t3DateSize         ?? 13.5) * ratio * 2) / 2,
                  t3ContactSize:      Math.round((p.style.t3ContactSize      ?? 10)   * ratio * 2) / 2,
                  t3SocialSize:       Math.round((p.style.t3SocialSize       ?? 10)   * ratio * 2) / 2,
                }}))
              }}
            >
              <FontField
                label="Nome (sidebar)"
                sizeValue={data.style.t3NameSize ?? 37}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3NameSize: v } }))}
                fontValue={data.style.t3FontName ?? 'fjalla'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3FontName: v } }))}
                min={14} max={48}
              />
              <FontField
                label="Subtítulo / cargo (sidebar) — itálico"
                sizeValue={data.style.t3SubtitleSize ?? 11.5}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3SubtitleSize: v } }))}
                fontValue={data.style.t3FontSubtitle ?? 'poppins'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3FontSubtitle: v } }))}
                min={6} max={18}
              />
              <FontField
                label="Títulos de seção"
                sizeValue={data.style.t3SectionTitleSize ?? 17.5}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3SectionTitleSize: v } }))}
                fontValue={data.style.t3FontSectionTitle ?? 'poppins'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3FontSectionTitle: v } }))}
                min={10} max={32}
              />
              <FontField
                label="Cargo / título do item"
                sizeValue={data.style.t3JobTitleSize ?? 17}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3JobTitleSize: v } }))}
                fontValue={data.style.t3FontCompany ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3FontCompany: v } }))}
                min={6} max={18}
              />
              <FontField
                label="Texto do corpo / bullets"
                sizeValue={data.style.t3BodySize ?? 13.5}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3BodySize: v } }))}
                fontValue={data.style.t3FontBody ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3FontBody: v } }))}
                min={6} max={20}
              />
              <FontField
                label="Empresa, data e instituição"
                sizeValue={data.style.t3DateSize ?? 13.5}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3DateSize: v } }))}
                fontValue={data.style.t3FontRole ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3FontRole: v } }))}
                min={6} max={20}
              />
              <FontField
                label="Contato (endereço, telefone, email)"
                sizeValue={data.style.t3ContactSize ?? 10}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3ContactSize: v } }))}
                fontValue={data.style.t3FontBody ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3FontBody: v } }))}
                min={5} max={14}
              />
              <FontField
                label="Redes sociais"
                sizeValue={data.style.t3SocialSize ?? 10}
                onSizeChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3SocialSize: v } }))}
                fontValue={data.style.t3FontBody ?? 'lato'}
                onFontChange={(v) => onChange((p) => ({ ...p, style: { ...p.style, t3FontBody: v } }))}
                min={5} max={14}
              />
            </MasterFontField>
          </div>

          <button
            type="button"
            onClick={() => onChange((p) => ({ ...p, style: {
              ...p.style,
              mainBg: '#ffffff',
              mainBg: '#F0F0F0',
              t3AccentBarColor: '#858587', t3AccentBarHeight: 8,
              t3BottomBarLeftColor: '#ACABB0', t3BottomBarRightColor: '#858587',
              t3SidebarBg: '#F5F5F5', t3SidebarTextColor: '#3d3d3d',
              t3SidebarNameColor: '#1a1a1a', t3SidebarSubColor: '#6b6b6b',
              t3SectionTitleColor: '#1a1a1a', t3JobTitleColor: '#1a1a1a',
              t3CompanyColor: '#6b7280', t3BodyColor: '#3d3d3d', t3DateColor: '#6b7280',
              t3Master: 9, t3PhotoHeight: 310,
              t3NameSize: 37, t3SubtitleSize: 11.5, t3SectionTitleSize: 17.5,
              t3JobTitleSize: 17, t3BodySize: 13.5, t3DateSize: 13.5, t3ContactSize: 10, t3SocialSize: 10,
              t3FontName: 'fjalla', t3FontSubtitle: 'poppins',
              t3FontSectionTitle: 'poppins',
              t3FontBody: 'lato', t3FontCompany: 'lato', t3FontRole: 'lato',
            }}))}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors text-center mt-1 py-2 border border-dashed border-gray-200 rounded-lg hover:border-gray-400"
          >
            Restaurar todos os padrões
          </button>

        </FieldGroup>
      )}

      {activeTab === 'estilo' && data.template !== 'template2' && data.template !== 'template3' && (
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
