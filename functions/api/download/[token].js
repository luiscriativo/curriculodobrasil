const LAMBDA_BASE = 'https://0yaig28xc6.execute-api.us-east-2.amazonaws.com/default/gerar-pdf-cv/download'

export async function onRequestGet(context) {
  const { token } = context.params

  const res = await fetch(`${LAMBDA_BASE}/${token}`)

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
