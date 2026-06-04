import React, { useRef } from 'react'
import { resumeAudio, playClick } from '../lib/sound.js'

// The scan screen IS the Pokédex device from the app icon. Tapping the central
// lens opens the phone's NATIVE camera (via a file input with capture), so you
// get pinch-to-zoom, focus, and flash. The Upload button (no capture) opens the
// photo library instead. Both hand the chosen image to onPick().
//
// The camera input is clicked synchronously inside the tap handler — iOS Safari
// only opens the camera from a direct user gesture, so no animation/delay first.

export default function CaptureScreen({ onPick, status, error, onRetry, lastFile }) {
  const cameraRef = useRef(null)
  const uploadRef = useRef(null)
  const busy = status === 'identifying'

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onPick(file)
    e.target.value = '' // allow re-picking the same file
  }

  const openCamera = () => {
    if (busy) return
    resumeAudio() // unlock audio within this user gesture
    playClick()
    cameraRef.current?.click() // synchronous → opens the native camera on mobile
  }

  return (
    <div className="pokedex">
      {/* Top half of the shell */}
      <div className="pokedex__half pokedex__half--top">
        <span className="pokedex__light" aria-hidden="true" />
        <span className="pokedex__brand">WILDDEX</span>
      </div>

      {/* Bottom half of the shell */}
      <div className="pokedex__half pokedex__half--bottom">
        <span className="pokedex__hint">Tap the lens to scan</span>
      </div>

      {/* Upload an existing photo instead of using the camera. */}
      <button
        className="pokedex__upload"
        onClick={() => uploadRef.current?.click()}
        disabled={busy}
        aria-label="Upload a photo from your device"
      >
        ⬆ Upload
      </button>

      {/* The lens = scan button → opens the native camera. */}
      <button
        className="pokedex__lens"
        onClick={openCamera}
        disabled={busy}
        aria-label="Open the camera to scan a creature"
      >
        <span className="pokedex__lens-glow" />
      </button>

      {error && (
        <div className="pokedex__error notice notice--error" role="alert">
          <span>{error}</span>
          {lastFile && (
            <button className="link" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      )}

      {/* Native camera (rear-facing on mobile). */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        hidden
      />
      {/* Photo library — no `capture`, so it offers existing photos/files. */}
      <input ref={uploadRef} type="file" accept="image/*" onChange={handleChange} hidden />
    </div>
  )
}
