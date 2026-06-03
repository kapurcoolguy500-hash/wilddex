import React from 'react'
import { categoryMeta, dexNumber } from '../lib/meta.js'

// The "Dex": a grid of everything caught, plus a quick tally by category.
// Displayed oldest-first (ascending), so #001 is your very first catch.

export default function CollectionGrid({ finds, onOpen, onGoScan }) {
  if (finds.length === 0) {
    return (
      <div className="empty">
        <div className="empty__icon">📷</div>
        <h2>Your Dex is empty</h2>
        <p>Scan your first creature to start your collection.</p>
        <button className="btn btn--primary" onClick={onGoScan}>
          Start scanning
        </button>
      </div>
    )
  }

  const total = finds.length
  const counts = finds.reduce((acc, f) => {
    const c = f.result.category
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})

  // Store gives newest-first; show oldest-first so #001 leads.
  const ordered = [...finds].reverse()

  return (
    <div className="dex">
      <header className="dex__header">
        <h1>Your Dex</h1>
        <p className="dex__count">{total} caught</p>
      </header>

      <div className="dex__tally">
        {Object.entries(counts).map(([cat, n]) => {
          const m = categoryMeta(cat)
          return (
            <span key={cat} className="chip" style={{ '--c': m.color }}>
              {m.emoji} {n}
            </span>
          )
        })}
      </div>

      <div className="grid">
        {ordered.map((f, i) => {
          const m = categoryMeta(f.result.category)
          // oldest find is #001, ascending
          const number = dexNumber(i + 1)
          return (
            <button key={f.id} className="tile" style={{ '--cat': m.color }} onClick={() => onOpen(f)}>
              <div className="tile__photo">
                <img src={f.thumbnailDataUrl} alt={f.result.commonName} />
                <span className="tile__num">{number}</span>
              </div>
              <div className="tile__label">
                <span className="tile__emoji">{m.emoji}</span>
                <span className="tile__name">{f.result.commonName}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
