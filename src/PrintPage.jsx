import { useState, useEffect } from 'react'
import ResumePreview from './components/ResumePreview.jsx'

export default function PrintPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const jobId = params.get('job')
    if (!jobId) { setError('Job ID ausente'); return }

    const params2 = new URLSearchParams(window.location.search)
    const apiUrl = params2.get('api') || 'https://enh8xz7m7f.execute-api.us-east-2.amazonaws.com/default/gerar-pdf-cv'
    fetch(`${apiUrl}?data=${jobId}`)
      .then(r => {
        if (!r.ok) throw new Error('Dados não encontrados')
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  if (error) return <div style={{ padding: 20, color: 'red' }}>Erro: {error}</div>
  if (!data)  return <div style={{ padding: 20 }}>Carregando…</div>

  return (
    <div style={{ margin: 0, padding: 0, background: '#fff' }}>
      <ResumePreview data={data} />
    </div>
  )
}
