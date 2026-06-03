import Anthropic from '@anthropic-ai/sdk'
import { ENTRY_TOOL, sanitizeEntry } from './schema.js'

// ── The swappable "brain" ──────────────────────────────────────────────────
// Exposes one function, identify(imageBase64, mediaType) -> sanitized entry.
// Today it calls Claude vision. To add a specialist species-ID API later,
// implement another identifier here and route to it; the returned shape is the
// contract the rest of the app depends on, so nothing downstream changes.

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `You are the identification engine for "WildDex", a real-life Pokédex.
A user has photographed something in nature. Identify the single most prominent
living thing (animal, bird, insect, plant, or fungus) in the image.

Rules:
- Always answer by calling the record_identification tool. Never reply in prose.
- If no living thing is clearly identifiable (blurry, empty scene, an object),
  set identified=false, confidence="low", and leave fields empty.
- Be honest about confidence. Use "low" for genuine guesses, "high" only when sure.
- classification: a short, 2-3 word Pokédex-style genus label (e.g. "Tiny Songbird").
- dexEntry: write 1-2 sentences of warm, fun, encyclopedia-style flavor text.
- diet: a concise summary of what it eats (for plants/fungi, how it gets energy).
- habitats: 2-4 short habitat tags where it lives.
- superpowers: 2-3 of the creature's most impressive special abilities — its
  "superpowers" — such as top speed, camouflage, night vision, venom, strength,
  echolocation, regeneration, etc. Each needs a short name and a one-sentence
  fact, ideally with a concrete number. Make these genuinely wow a curious kid.
- rarity: how hard the species is to SPOT in the wild — judge by its typical
  elusiveness/abundance, NOT this photo's quality, and be consistent (the same
  species always gets the same tier):
    • common — abundant, seen almost daily with no effort (house sparrow, pigeon,
      robin, dandelion, housefly)
    • uncommon — around, but you must be in the right habitat or paying attention
      (woodpecker, hedgehog, jay, common frog, peacock butterfly)
    • rare — a lucky, memorable sighting; shy, localized, nocturnal or seasonal
      (kingfisher, barn owl, fox in daylight, wild orchid)
    • legendary — exceptional; highly elusive, endangered, or far from its range
      (otter, golden eagle, pine marten, a rare migrant or endangered species)`

let client = null
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

export function isMockMode() {
  return process.env.USE_MOCK === '1' || !process.env.ANTHROPIC_API_KEY
}

async function identifyWithClaude(imageBase64, mediaType) {
  const resp = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      // Cache the static instructions so repeated identifications are cheaper/faster.
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
    ],
    tools: [ENTRY_TOOL],
    tool_choice: { type: 'tool', name: ENTRY_TOOL.name },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: 'Identify the creature or plant in this photo.' },
        ],
      },
    ],
  })

  const toolUse = resp.content.find((b) => b.type === 'tool_use')
  if (!toolUse) throw new Error('Model did not return a structured identification')
  return sanitizeEntry(toolUse.input)
}

// Deterministic stand-in so the full UI works without an API key.
const MOCK_ENTRY = {
  identified: true,
  commonName: 'European Robin',
  scientificName: 'Erithacus rubecula',
  classification: 'Friendly Songbird',
  category: 'bird',
  confidence: 'high',
  rarity: 'common',
  dexEntry:
    'A small, round garden bird famous for its bright orange breast and bold, curious nature around humans.',
  diet: 'Omnivore — insects, worms, spiders, seeds and berries.',
  habitats: ['Woodland', 'Gardens', 'Hedgerows', 'Parks'],
  superpowers: [
    {
      name: 'Magnetic Compass',
      detail: 'Robins can sense Earth’s magnetic field to navigate during migration.',
    },
    {
      name: 'Low-Light Vision',
      detail: 'Large eyes let them forage in dim dawn and dusk light better than most birds.',
    },
    {
      name: 'Winter Songster',
      detail: 'One of the few birds to sing all year, even on freezing winter nights.',
    },
  ],
}

export async function identify(imageBase64, mediaType) {
  if (isMockMode()) {
    // tiny delay so the loading state is visible during UI development
    await new Promise((r) => setTimeout(r, 600))
    return sanitizeEntry(MOCK_ENTRY)
  }
  return identifyWithClaude(imageBase64, mediaType)
}
