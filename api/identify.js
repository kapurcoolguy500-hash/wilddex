import { identifyFromImageField } from '../server/identify.js'

// Vercel serverless function served at /api/identify.
// Holds the Claude API key (via the ANTHROPIC_API_KEY env var on Vercel) and
// returns a structured IdentifiedEntry. Shares its core logic with the dev
// Express server (server/index.js) through identifyFromImageField().

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    // Vercel parses JSON bodies, but be defensive if it arrives as a string.
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const { image, mediaType } = body
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'Missing image data.' })
      return
    }
    const entry = await identifyFromImageField(image, mediaType)
    res.status(200).json({ entry })
  } catch (err) {
    console.error('[identify] failed:', err)
    res.status(502).json({ error: 'Identification failed. Please try again.' })
  }
}
