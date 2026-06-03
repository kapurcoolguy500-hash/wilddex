import React, { useRef, useState, useEffect, useCallback } from 'react'
import { resumeAudio, playClick } from '../lib/sound.js'

// The scan screen IS the Pokédex device from the app icon: red body, blue corner
// light, dark center band, and a central lens that acts as the scan button.
// Tapping the lens splits the device open (top/bottom halves) to reveal a live
// in-app camera. If the live camera is unavailable (e.g. an insecure http origin
// on a phone), it gracefully falls back to the native camera/photo picker.

export default function CaptureScreen({ onPick, status, error, onRetry, lastFile }) {
  const inputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [mode, setMode] = useState('closed') // 'closed' | 'opening' | 'camera'
  const [fellBack, setFellBack] = useState(false)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onPick(file)
    e.target.value = '' // allow re-picking the same file
  }

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  // Always release the camera when the screen unmounts.
  useEffect(() => () => stopStream(), [stopStream])

  const fallbackToPicker = useCallback(() => {
    setFellBack(true)
    setMode('closed')
    inputRef.current?.click()
  }, [])

  const openCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setMode('camera')
      requestAnimationFrame(() => {
        const v = videoRef.current
        if (v) {
          v.srcObject = stream
          v.play().catch(() => {})
        }
      })
    } catch {
      fallbackToPicker() // insecure origin, no camera, or permission denied
    }
  }, [fallbackToPicker])

  const handleOpen = () => {
    if (status === 'identifying' || mode !== 'closed') return
    resumeAudio() // unlock audio within this user gesture
    playClick() // audible feedback the moment the lens is pressed
    setMode('opening')
    window.setTimeout(openCamera, 600) // let the split animation play first
  }

  const handleCapture = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        stopStream()
        setMode('closed')
        onPick(blob) // a Blob works the same as a File downstream
      },
      'image/jpeg',
      0.92,
    )
  }

  const handleCloseCamera = () => {
    stopStream()
    setMode('closed')
  }

  const open = mode !== 'closed'

  return (
    <div className={`pokedex ${open ? 'is-open' : ''}`}>
      {/* Camera layer, revealed when the device splits apart */}
      <div className="pokedex__camera">
        {mode === 'camera' ? (
          <>
            <video ref={videoRef} className="pokedex__video" autoPlay playsInline muted />
            <div className="pokedex__viewfinder" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <p className="pokedex__camhint">Center your creature and tap to capture</p>
            <button className="pokedex__capture" onClick={handleCapture} aria-label="Capture photo">
              <span className="pokedex__capture-ring" />
            </button>
          </>
        ) : (
          <div className="pokedex__camera-loading">Opening camera…</div>
        )}
      </div>

      {/* Close/back is available the whole time the device is open. */}
      {open && (
        <button className="pokedex__close" onClick={handleCloseCamera} aria-label="Close camera">
          ←
        </button>
      )}

      {/* Top half of the shell */}
      <div className="pokedex__half pokedex__half--top">
        <span className="pokedex__light" aria-hidden="true" />
        <span className="pokedex__brand">WILDDEX</span>
      </div>

      {/* Bottom half of the shell */}
      <div className="pokedex__half pokedex__half--bottom">
        <span className="pokedex__hint">
          {fellBack ? 'Opening your phone camera…' : 'Tap the lens to scan'}
        </span>
      </div>

      {/* The lens = scan button, centered over the seam */}
      <button
        className="pokedex__lens"
        onClick={handleOpen}
        disabled={status === 'identifying'}
        aria-label="Open camera to scan a creature"
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

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        hidden
      />
    </div>
  )
}
