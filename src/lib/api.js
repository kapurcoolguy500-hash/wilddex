// Thin client over the backend /identify endpoint. The frontend only ever knows
// this call and the entry shape it returns — never anything about Claude.

export async function identifyImage(dataUrl) {
  const res = await fetch('/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl }),
  })
  if (!res.ok) {
    let message = 'Identification failed. Please try again.'
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* keep default */
    }
    throw new Error(message)
  }
  const { entry } = await res.json()
  return entry
}
