import React from 'react'
import CreatureInfoPanel from './CreatureInfoPanel.jsx'

// The reveal: a Pokédex INFO panel for a freshly identified subject.
// When the model couldn't identify anything, we show a gentle retry prompt.

export default function ResultCard({ photo, entry, onSave, onDiscard, saved, isNew }) {
  if (!entry.identified) {
    return (
      <div className="result">
        <img className="result__photo" src={photo} alt="Your capture" />
        <div className="result__miss">
          <h2>Hmm, couldn’t quite tell 🔍</h2>
          <p>I couldn’t spot a clear creature or plant. Try a closer, sharper shot.</p>
          <button className="btn btn--primary" onClick={onDiscard}>
            Scan again
          </button>
        </div>
      </div>
    )
  }

  const lowConfidence = entry.confidence === 'low'

  return (
    <div className="result">
      <div className="reveal">
        <CreatureInfoPanel entry={entry} photo={photo} label="NEW ENTRY" isNew={isNew} />
      </div>

      {lowConfidence && (
        <p className="result__confidence">Best guess — not fully sure on this one.</p>
      )}

      {saved ? (
        <div className="result__saved">
          <div className="notice notice--success">Added to your Dex! ✓</div>
          <button className="btn btn--primary" onClick={onDiscard}>
            Scan another
          </button>
        </div>
      ) : (
        <div className="result__actions">
          <button className="btn btn--ghost" onClick={onDiscard}>
            Discard
          </button>
          <button className="btn btn--primary" onClick={onSave}>
            Add to Dex
          </button>
        </div>
      )}
    </div>
  )
}
