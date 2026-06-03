import React from 'react'
import { dexNumber } from '../lib/meta.js'
import CreatureInfoPanel from './CreatureInfoPanel.jsx'

// Full-screen detail for a saved find, opened from the grid.

export default function EntryDetail({ find, number, onClose, onDelete }) {
  const { result, photoDataUrl, thumbnailDataUrl, capturedAt } = find
  const when = new Date(capturedAt).toLocaleString()

  return (
    <div className="detail">
      <header className="detail__bar">
        <button className="iconbtn" onClick={onClose} aria-label="Back">
          ←
        </button>
        <span className="detail__num">{dexNumber(number)}</span>
        <button className="iconbtn" onClick={() => onDelete(find)} aria-label="Release">
          🗑
        </button>
      </header>

      <div className="detail__body">
        <CreatureInfoPanel
          entry={result}
          photo={photoDataUrl || thumbnailDataUrl}
          label={dexNumber(number)}
        />
        <p className="detail__meta">Caught {when}</p>
      </div>
    </div>
  )
}
