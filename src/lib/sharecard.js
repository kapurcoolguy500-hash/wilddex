import { categoryMeta, rarityMeta } from './meta.js'

// Renders a shareable "collectible card" PNG for a creature (photo + name +
// scientific name + rarity/category badges + WildDex branding) on a canvas,
// then shares it via the native Web Share sheet. Falls back to downloading the
// card and copying a caption when Web Share (with files) isn't available.

const RED = '#e3350d'
const RED_D = '#b21d09'
const INK = '#23272e'
const FONT = '-apple-system, system-ui, "Segoe UI", Roboto, Arial, sans-serif'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Draw a rounded pill with centered text; returns its width.
function pill(ctx, text, x, y, h, { bg, fg, font, padX = 24, align = 'left', shadow }) {
  ctx.font = font
  const tw = ctx.measureText(text).width
  const w = tw + padX * 2
  const dx = align === 'right' ? x - w : x
  if (shadow) {
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 2
  }
  roundRect(ctx, dx, y, w, h, h / 2)
  ctx.fillStyle = bg
  ctx.fill()
  if (shadow) ctx.restore()
  ctx.fillStyle = fg
  ctx.textBaseline = 'middle'
  ctx.fillText(text, dx + padX, y + h / 2 + 1)
  ctx.textBaseline = 'alphabetic'
  return w
}

function wrapLines(ctx, text, maxW, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[\s.]+$/, '')}…`
  }
  return lines
}

// Build the card image as a PNG Blob.
export async function buildCardBlob(entry, photoDataUrl) {
  const W = 1080
  const H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const cat = categoryMeta(entry.category)
  const rar = rarityMeta(entry.rarity)

  // Light grid background
  ctx.fillStyle = '#f6f7f9'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(0,0,0,0.05)'
  ctx.lineWidth = 2
  for (let x = 0; x <= W; x += 60) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y <= H; y += 60) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }

  // Outer red frame
  ctx.strokeStyle = RED
  ctx.lineWidth = 16
  roundRect(ctx, 8, 8, W - 16, H - 16, 36)
  ctx.stroke()

  // Header bar
  const hbY = 28
  const hbH = 110
  const grad = ctx.createLinearGradient(0, hbY, 0, hbY + hbH)
  grad.addColorStop(0, '#f24a32')
  grad.addColorStop(1, RED_D)
  roundRect(ctx, 28, hbY, W - 56, hbH, 20)
  ctx.fillStyle = grad
  ctx.fill()
  // Pokéball glyph
  const cy = hbY + hbH / 2
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(96, cy, 27, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = RED_D
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(69, cy)
  ctx.lineTo(123, cy)
  ctx.stroke()
  ctx.fillStyle = RED
  ctx.beginPath()
  ctx.arc(96, cy, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = `900 56px ${FONT}`
  ctx.textBaseline = 'middle'
  ctx.fillText('WILDDEX', 150, cy + 2)
  ctx.textBaseline = 'alphabetic'

  // Photo frame
  const px = 44
  const py = 168
  const pw = W - 88
  const ph = 700
  ctx.fillStyle = '#fff'
  roundRect(ctx, px, py, pw, ph, 18)
  ctx.fill()
  ctx.save()
  roundRect(ctx, px + 10, py + 10, pw - 20, ph - 20, 12)
  ctx.clip()
  try {
    const img = await loadImage(photoDataUrl)
    const tw = pw - 20
    const th = ph - 20
    const scale = Math.max(tw / img.width, th / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    ctx.drawImage(img, px + 10 + (tw - dw) / 2, py + 10 + (th - dh) / 2, dw, dh)
  } catch {
    ctx.fillStyle = '#e7eaee'
    ctx.fillRect(px + 10, py + 10, pw - 20, ph - 20)
  }
  ctx.restore()

  // Rarity badge (top-right of photo) + category badge (bottom-left)
  pill(ctx, rar.label.toUpperCase(), px + pw - 22, py + 22, 56, {
    bg: rar.color,
    fg: '#ffffff',
    font: `900 30px ${FONT}`,
    align: 'right',
    shadow: true,
  })
  pill(ctx, `${cat.emoji} ${cat.label}`, px + 22, py + ph - 22 - 56, 56, {
    bg: 'rgba(0,0,0,0.6)',
    fg: '#ffffff',
    font: `800 30px ${FONT}`,
    shadow: true,
  })

  // Name + classification + scientific name
  let ty = py + ph + 76
  ctx.fillStyle = INK
  ctx.font = `800 66px ${FONT}`
  ctx.fillText(entry.commonName || 'Unknown', 48, ty)
  ty += 46
  ctx.fillStyle = RED
  ctx.font = `800 34px ${FONT}`
  ctx.fillText(entry.classification || `${cat.label} Creature`, 48, ty)
  if (entry.scientificName) {
    ty += 40
    ctx.fillStyle = '#7a828c'
    ctx.font = `italic 32px Georgia, "Times New Roman", serif`
    ctx.fillText(entry.scientificName, 48, ty)
  }

  // Flavor text (up to 2 lines)
  if (entry.dexEntry) {
    ty += 56
    ctx.fillStyle = INK
    ctx.font = `32px ${FONT}`
    for (const line of wrapLines(ctx, entry.dexEntry, W - 96, 2)) {
      ctx.fillText(line, 48, ty)
      ty += 44
    }
  }

  // Footer URL
  ctx.fillStyle = '#9aa3ad'
  ctx.font = `700 30px ${FONT}`
  ctx.textAlign = 'center'
  const host = (typeof location !== 'undefined' && location.host) || 'wilddex'
  ctx.fillText(`Caught on ${host}`, W / 2, H - 46)
  ctx.textAlign = 'left'

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.92))
}

function slug(name) {
  return String(name || 'creature').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Build the card and share it. Returns { ok, cancelled?, fallback? }.
export async function shareCreature(entry, photoDataUrl) {
  const name = entry.commonName || 'this creature'
  const url = (typeof location !== 'undefined' && location.origin) || ''
  const sci = entry.scientificName ? ` (${entry.scientificName})` : ''
  const text =
    `I found a ${name}${sci} on WildDex! ` +
    `${rarityMeta(entry.rarity).label} · ${categoryMeta(entry.category).label}` +
    (url ? `\nIdentify real creatures at ${url}` : '')
  const title = `WildDex — ${name}`

  let blob = null
  try {
    blob = await buildCardBlob(entry, photoDataUrl)
  } catch {
    blob = null
  }
  const file = blob ? new File([blob], `wilddex-${slug(name)}.png`, { type: 'image/png' }) : null

  try {
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title, text })
      return { ok: true }
    }
    if (navigator.share) {
      await navigator.share({ title, text, url })
      return { ok: true }
    }
  } catch (err) {
    if (err && err.name === 'AbortError') return { ok: false, cancelled: true }
    // otherwise fall through to the download fallback
  }

  // Fallback (e.g. desktop browsers without Web Share): save the card + copy text.
  if (file) downloadBlob(file, file.name)
  try {
    await navigator.clipboard?.writeText(text)
  } catch {
    /* ignore */
  }
  return { ok: true, fallback: true }
}
