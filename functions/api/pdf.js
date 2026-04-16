const LAMBDA_URL = 'https://0yaig28xc6.execute-api.us-east-2.amazonaws.com/default/gerar-pdf-cv/pdf'

export async function onRequestPost(context) {
  const body = await context.request.text()

  const res = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
