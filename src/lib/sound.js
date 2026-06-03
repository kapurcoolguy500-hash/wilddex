// 8-bit Pokédex-style sound engine, synthesized with the Web Audio API.
// No audio files: every sound is generated from square-wave oscillators, so
// it's tiny, works offline, and dodges any copyrighted-audio concerns.
//
// Browsers block audio until a user gesture, so resumeAudio() is called from
// the scan tap (a trusted gesture) before anything plays.

const MUTE_KEY = 'wilddex-muted'

let ctx = null
let muted = localStorage.getItem(MUTE_KEY) === '1'
let scanTimer = null

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

export function resumeAudio() {
  const c = getCtx()
  if (c && c.state === 'suspended') c.resume()
}

export function isMuted() {
  return muted
}

export function setMuted(value) {
  muted = value
  localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  if (value) stopScanningLoop()
  return muted
}

export function toggleMuted() {
  return setMuted(!muted)
}

// One short square-wave note with a click-free attack/decay envelope.
function blip(freq, startAt, dur, { type = 'square', gain = 0.12 } = {}) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const env = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, startAt)
  env.gain.setValueAtTime(0.0001, startAt)
  env.gain.linearRampToValueAtTime(gain, startAt + 0.008)
  env.gain.exponentialRampToValueAtTime(0.0001, startAt + dur)
  osc.connect(env).connect(c.destination)
  osc.start(startAt)
  osc.stop(startAt + dur + 0.02)
}

// Crisp two-tick "ka-chik" click when the lens is pressed to open the Pokédex.
export function playClick() {
  if (muted) return
  resumeAudio()
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  blip(1600, t, 0.022, { gain: 0.13 })
  blip(820, t + 0.05, 0.06, { gain: 0.13 })
}

// Quick rising two-tone "bweep" when a scan begins.
export function playScanStart() {
  if (muted) return
  resumeAudio()
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  blip(660, t, 0.09)
  blip(990, t + 0.1, 0.13)
}

// Looping pulse that runs for the duration of identification.
export function startScanningLoop() {
  if (muted) return
  resumeAudio()
  stopScanningLoop()
  const notes = [880, 1175, 1397, 1175]
  let i = 0
  const tick = () => {
    if (muted) return stopScanningLoop()
    const c = getCtx()
    if (!c) return
    blip(notes[i % notes.length], c.currentTime, 0.05, { gain: 0.05 })
    i++
  }
  tick()
  scanTimer = setInterval(tick, 250)
}

export function stopScanningLoop() {
  if (scanTimer) {
    clearInterval(scanTimer)
    scanTimer = null
  }
}

// Triumphant ascending arpeggio when something is identified.
export function playSuccess() {
  stopScanningLoop()
  if (muted) return
  resumeAudio()
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  const seq = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  seq.forEach((f, idx) => blip(f, t + idx * 0.085, 0.13, { gain: 0.12 }))
}

// Soft descending "no match" tone.
export function playNoMatch() {
  stopScanningLoop()
  if (muted) return
  resumeAudio()
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  blip(440, t, 0.13, { gain: 0.1 })
  blip(294, t + 0.14, 0.2, { gain: 0.1 })
}
