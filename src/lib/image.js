// Client-side image handling: turn a captured File into a compressed JPEG data
// URL (for upload) and a small square thumbnail (for the collection grid).
// Keeping images small protects upload time, API cost, and IndexedDB space.

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

// Downscale so the longest edge is <= maxEdge, encode as JPEG.
export async function compressImage(file, maxEdge = 1024, quality = 0.82) {
  const img = await loadImage(file)
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}

// Center-cropped square thumbnail for grid tiles.
export async function makeThumbnail(file, size = 256, quality = 0.78) {
  const img = await loadImage(file)
  const edge = Math.min(img.width, img.height)
  const sx = (img.width - edge) / 2
  const sy = (img.height - edge) / 2
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  canvas.getContext('2d').drawImage(img, sx, sy, edge, edge, 0, 0, size, size)
  return canvas.toDataURL('image/jpeg', quality)
}
