import React from 'react'
import { categoryMeta, rarityMeta } from '../lib/meta.js'
import BioSections from './BioSections.jsx'

// The creature info, styled after the classic Pokédex INFO screen:
// red header bars, white framed boxes, a beveled type badge, a light grid
// background, and the iconic red-bordered description box.
// Shared by the fresh-scan result card and the saved-entry detail view.

export default function CreatureInfoPanel({ entry, photo, label = 'INFO', isNew = false }) {
  const cat = categoryMeta(entry.category)
  const rar = rarityMeta(entry.rarity)
  const classLabel = entry.classification || `${cat.label} Creature`

  return (
    <div className="pdx">
      <div className="pdx__topbar">
        <span className="pdx__caret">▼</span>
        <span className="pdx__toplabel">{label}</span>
        {isNew && <span className="pdx__new">★ NEW</span>}
      </div>

      <div className="pdx__main">
        <div className="pdx__photoframe">
          {photo ? (
            <img className="pdx__photo" src={photo} alt={entry.commonName} />
          ) : (
            <div className="pdx__photo pdx__photo--empty">?</div>
          )}
        </div>

        <div className="pdx__id">
          <div className="pdx__namebar">
            <span className="pdx__pokeball" aria-hidden="true" />
            {entry.commonName || 'Unknown'}
          </div>
          <div className="pdx__classbox">
            <div className="pdx__class">{classLabel}</div>
            {entry.scientificName && <div className="pdx__sci">{entry.scientificName}</div>}
          </div>

          <div className="pdx__types">
            <span className="pdx__typeicon">{cat.emoji}</span>
            <span className="pdx__type" style={{ '--c': cat.color }}>
              {cat.label}
            </span>
            <span
              className={`pdx__rarity${entry.rarity === 'legendary' ? ' is-legendary' : ''}`}
              style={{ '--c': rar.color }}
            >
              {rar.label}
            </span>
          </div>
        </div>
      </div>

      {entry.dexEntry && <div className="pdx__desc">{entry.dexEntry}</div>}

      <BioSections entry={entry} />
    </div>
  )
}
