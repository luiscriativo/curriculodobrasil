const LAMBDA = 'https://0yaig28xc6.execute-api.us-east-2.amazonaws.com/default/gerar-pdf-cv'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // POST /api/pdf — envia dados para Lambda e retorna token
    if (url.pathname === '/api/pdf' && request.method === 'POST') {
      const body = await request.text()
      const res = await fetch(`${LAMBDA}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const data = await res.json()
      return Response.json(data, { status: res.status })
    }

    // GET /api/download/:token — faz proxy do PDF da Lambda
    if (url.pathname.startsWith('/api/download/') && request.method === 'GET') {
      const token = url.pathname.slice('/api/download/'.length)
      const res = await fetch(`${LAMBDA}/download/${token}`)
      if (!res.ok) {
        return new Response('PDF não encontrado ou expirado.', { status: 404 })
      }
      const pdf = await res.arrayBuffer()
      const disposition = res.headers.get('Content-Disposition') || 'attachment; filename="curriculo.pdf"'
      return new Response(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': disposition,
        },
      })
    }

    // Demais rotas → arquivos estáticos do Cloudflare Pages
    return env.ASSETS.fetch(request)
  },
}
