// The single source of truth for the structured identification result.
// Shared shape that the frontend relies on. Because every identifier (Claude
// today, specialist APIs tomorrow) must return THIS shape, the UI never changes.

export const CATEGORIES = ['animal', 'bird', 'plant', 'fungi', 'insect', 'other']
export const CONFIDENCES = ['high', 'medium', 'low']
export const RARITIES = ['common', 'uncommon', 'rare', 'legendary']

// JSON Schema used as a Claude tool input_schema to force structured output.
export const ENTRY_TOOL = {
  name: 'record_identification',
  description:
    'Record the identification of the single most prominent living thing in the photo.',
  input_schema: {
    type: 'object',
    properties: {
      identified: {
        type: 'boolean',
        description:
          'true if a living creature/plant/fungus is clearly visible and identifiable; false otherwise.',
      },
      commonName: {
        type: 'string',
        description: 'Everyday common name, e.g. "American Robin". Empty if not identified.',
      },
      scientificName: {
        type: 'string',
        description: 'Latin binomial, e.g. "Turdus migratorius". Empty if unknown.',
      },
      classification: {
        type: 'string',
        description:
          'A short, 2-3 word playful "species classification" in the style of a Pokédex genus, e.g. "Fire Mouse", "Tiny Songbird", "Seed Sower". Do not append the word "Pokémon".',
      },
      category: { type: 'string', enum: CATEGORIES },
      confidence: {
        type: 'string',
        enum: CONFIDENCES,
        description: 'Honest confidence in the identification.',
      },
      rarity: {
        type: 'string',
        enum: RARITIES,
        description:
          'How hard this species is to SPOT in the wild — judged by its typical elusiveness/abundance, NOT this photo. The same species must always get the same tier. common = abundant, seen almost daily with no effort. uncommon = around, but you must be in the right habitat or paying attention. rare = a lucky, memorable sighting (shy, localized, nocturnal or seasonal). legendary = exceptional (highly elusive, endangered, or far from its range).',
      },
      dexEntry: {
        type: 'string',
        description:
          'One or two sentences of fun, encyclopedia-style flavor text, Pokédex tone.',
      },
      diet: {
        type: 'string',
        description:
          'Concise diet, e.g. "Omnivore — insects, worms, seeds and berries". For plants/fungi, describe how it feeds (e.g. "Photosynthesis" or "Decomposer"). Empty only if truly unknown.',
      },
      habitats: {
        type: 'array',
        items: { type: 'string' },
        description:
          '2 to 4 short habitat tags, e.g. ["Woodland", "Gardens", "Hedgerows"].',
      },
      superpowers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Short ability name, e.g. "Night Vision", "Top Speed", "Camouflage".',
            },
            detail: {
              type: 'string',
              description: 'One sentence explaining the ability, with a number/fact where possible.',
            },
          },
          required: ['name', 'detail'],
        },
        description:
          "2 to 3 standout abilities — the creature's \"superpowers\" (special senses, speed, camouflage, venom, strength, etc.), each with a concrete, kid-friendly fact.",
      },
    },
    required: [
      'identified',
      'commonName',
      'scientificName',
      'classification',
      'category',
      'confidence',
      'rarity',
      'dexEntry',
      'diet',
      'habitats',
      'superpowers',
    ],
  },
}

// Normalize/clamp anything we hand back to the client so the UI can trust it.
export function sanitizeEntry(raw = {}) {
  const pick = (val, allowed, fallback) =>
    allowed.includes(val) ? val : fallback
  return {
    identified: Boolean(raw.identified),
    commonName: String(raw.commonName || '').trim(),
    scientificName: String(raw.scientificName || '').trim(),
    classification: String(raw.classification || '').trim(),
    category: pick(raw.category, CATEGORIES, 'other'),
    confidence: pick(raw.confidence, CONFIDENCES, 'low'),
    rarity: pick(raw.rarity, RARITIES, 'common'),
    dexEntry: String(raw.dexEntry || '').trim(),
    diet: String(raw.diet || '').trim(),
    habitats: Array.isArray(raw.habitats)
      ? raw.habitats.map((h) => String(h).trim()).filter(Boolean).slice(0, 4)
      : [],
    superpowers: Array.isArray(raw.superpowers)
      ? raw.superpowers
          .map((s) => ({
            name: String(s?.name || '').trim(),
            detail: String(s?.detail || '').trim(),
          }))
          .filter((s) => s.name && s.detail)
          .slice(0, 3)
      : [],
  }
}
