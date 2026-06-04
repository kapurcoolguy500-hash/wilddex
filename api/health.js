import { isMockMode } from '../server/identify.js'

// Health check at /api/health. `mock` is true when ANTHROPIC_API_KEY is not set
// on Vercel — handy for confirming the key is configured on the live site.

export default function handler(_req, res) {
  res.status(200).json({ ok: true, mock: isMockMode() })
}
