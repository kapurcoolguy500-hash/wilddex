import React from 'react'

// Shared bio blocks (diet, habitat, superpowers), styled as Pokédex-style
// framed boxes with a red label header. Used by the result card and the
// saved-entry detail view, so they always render identically.
// Gracefully handles older saved finds that only have the legacy `funFacts`.

export default function BioSections({ entry }) {
  const diet = entry.diet
  const habitats = entry.habitats || []
  const superpowers = entry.superpowers || []
  const legacyFacts = !superpowers.length && Array.isArray(entry.funFacts) ? entry.funFacts : []

  return (
    <>
      {diet && (
        <section className="bio">
          <h3 className="bio__heading">🍽️ Diet</h3>
          <div className="bio__content">
            <p className="bio__text">{diet}</p>
          </div>
        </section>
      )}

      {habitats.length > 0 && (
        <section className="bio">
          <h3 className="bio__heading">📍 Habitat</h3>
          <div className="bio__content">
            <div className="bio__tags">
              {habitats.map((h, i) => (
                <span key={i} className="bio__tag">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {superpowers.length > 0 && (
        <section className="bio">
          <h3 className="bio__heading">⚡ Superpowers</h3>
          <div className="bio__content">
            <ul className="powers">
              {superpowers.map((p, i) => (
                <li key={i} className="power">
                  <span className="power__name">{p.name}</span>
                  <span className="power__detail">{p.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {legacyFacts.length > 0 && (
        <section className="bio">
          <h3 className="bio__heading">✨ Fun facts</h3>
          <div className="bio__content">
            <ul className="powers">
              {legacyFacts.map((f, i) => (
                <li key={i} className="power">
                  <span className="power__detail">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
