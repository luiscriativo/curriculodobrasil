import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { randomUUID } from 'crypto'

// jobs: dados aguardando renderização   { id → { data, name } }
// ready: PDFs prontos aguardando download { token → { pdf, filename } }
const jobs  = new Map()
const ready = new Map()

// Limpa PDFs prontos não baixados após 2 minutos
const scheduleCleanup = (token) => {
  setTimeout(() => ready.delete(token), 2 * 60 * 1000)
}

const pdfPlugin = () => ({
  name: 'pdf-export',
  configureServer(server) {
    let devPort = 5173
    server.httpServer?.once('listening', () => {
      const addr = server.httpServer.address()
      if (addr && typeof addr === 'object') devPort = addr.port
    })

    // GET /api/data/:id — devolve os dados do job para o PrintPage
    server.middlewares.use('/api/data', (req, res) => {
      const id = req.url.replace(/^\//, '')
      const data = jobs.get(id)
      if (!data) { res.writeHead(404); res.end('Not found'); return }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
    })

    // GET /api/download/:token — serve o PDF pronto (GET puro, IDM-friendly)
    server.middlewares.use('/api/download', (req, res) => {
      const token = req.url.replace(/^\//, '')
      const entry = ready.get(token)
      if (!entry) { res.writeHead(404); res.end('PDF não encontrado ou expirado'); return }

      ready.delete(token)  // consumido — cada token é de uso único

      const filename = encodeURIComponent(entry.filename)
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
        'Content-Length': entry.pdf.length,
      })
      res.end(entry.pdf)
    })

    // POST /api/pdf — gera o PDF com Puppeteer e devolve o token de download
    server.middlewares.use('/api/pdf', (req, res) => {
      if (req.method !== 'POST') { res.writeHead(405); res.end(); return }

      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        const jobId = randomUUID()
        try {
          const data = JSON.parse(body)
          jobs.set(jobId, data)

          const { default: puppeteer } = await import('puppeteer')

          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          })

          const page = await browser.newPage()
          await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })

          await page.goto(`http://localhost:${devPort}/print?job=${jobId}`, {
            waitUntil: 'networkidle2',
            timeout: 30000,
          })

          await page.waitForSelector('#resume-preview', { timeout: 10000 })
          await page.evaluate(() => document.fonts.ready)

          // Aguarda imagens (foto de perfil base64)
          await page.evaluate(() => new Promise(resolve => {
            const imgs = [...document.querySelectorAll('img')]
            if (!imgs.length) return resolve()
            let done = 0
            const check = () => { if (++done === imgs.length) resolve() }
            imgs.forEach(img => {
              if (img.complete) check()
              else { img.onload = check; img.onerror = check }
            })
          }))

          const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          })

          await browser.close()
          jobs.delete(jobId)

          // Armazena o PDF pronto e devolve o token ao browser
          const downloadToken = randomUUID()
          const filename = (data.name || 'curriculo').replace(/\s+/g, '_') + '_curriculo.pdf'
          ready.set(downloadToken, { pdf, filename })
          scheduleCleanup(downloadToken)

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ token: downloadToken, filename }))

        } catch (err) {
          console.error('[pdf-export]', err)
          jobs.delete(jobId)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    })
  },
})

export default defineConfig({
  plugins: [react(), pdfPlugin()],
})
