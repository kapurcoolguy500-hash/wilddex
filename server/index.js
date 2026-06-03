import 'dotenv/config'
import express from 'express'
import { identify, isMockMode } from './identify.js'

const app = express()
// Photos arrive as base64 data URLs; allow a generous body size.
app.use(express.json({ limit: '12mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mock: isMockMode() })
})

// Core endpoint: receive an image, return a structured IdentifiedEntry.
app.post('/identify', async (req, res) => {
  try {
    const { image, mediaType } = req.body || {}
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Missing image data.' })
    }

    // Accept either a raw base64 string or a full data URL.
    let base64 = image
    let type = mediaType || 'image/jpeg'
    const dataUrl = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.*)$/)
    if (dataUrl) {
      type = dataUrl[1]
      base64 = dataUrl[2]
    }

    const entry = await identify(base64, type)
    res.json({ entry })
  } catch (err) {
    console.error('[identify] failed:', err)
    res.status(502).json({ error: 'Identification failed. Please try again.' })
  }
})

const port = Number(process.env.PORT) || 8787
app.listen(port, () => {
  console.log(
    `WildDex API on http://localhost:${port}  (${isMockMode() ? 'MOCK mode' : 'Claude mode'})`,
  )
})
