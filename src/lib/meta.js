// Presentation metadata for categories and rarities — shared so the card, grid,
// and detail views stay visually consistent.

export const CATEGORY_META = {
  bird: { label: 'Bird', emoji: '🐦', color: '#5dade2' },
  animal: { label: 'Animal', emoji: '🦊', color: '#e67e22' },
  insect: { label: 'Insect', emoji: '🐞', color: '#27ae60' },
  plant: { label: 'Plant', emoji: '🌿', color: '#2ecc71' },
  fungi: { label: 'Fungi', emoji: '🍄', color: '#af7ac5' },
  other: { label: 'Other', emoji: '✨', color: '#95a5a6' },
}

export const RARITY_META = {
  common: { label: 'Common', color: '#95a5a6' },
  uncommon: { label: 'Uncommon', color: '#3498db' },
  rare: { label: 'Rare', color: '#f1c40f' },
  legendary: { label: 'Legendary', color: '#9b59b6' },
}

export function categoryMeta(category) {
  return CATEGORY_META[category] || CATEGORY_META.other
}

export function rarityMeta(rarity) {
  return RARITY_META[rarity] || RARITY_META.common
}

export function dexNumber(n) {
  return `#${String(n).padStart(3, '0')}`
}

// Whether two identified results are the same species — used to decide if a
// scan is "NEW" to the Dex. Prefers scientific name; falls back to common name.
function norm(s) {
  return String(s || '').trim().toLowerCase()
}
export function sameSpecies(a, b) {
  if (!a || !b) return false
  const sciA = norm(a.scientificName)
  const sciB = norm(b.scientificName)
  if (sciA && sciB) return sciA === sciB
  const comA = norm(a.commonName)
  const comB = norm(b.commonName)
  return !!comA && comA === comB
}
