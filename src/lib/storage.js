import { openDB } from 'idb'

// On-device collection. No accounts in v1 — every find lives in IndexedDB on
// this device. One store, keyed by a generated id, indexed by capture time.

const DB_NAME = 'wilddex'
const STORE = 'finds'

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    const store = db.createObjectStore(STORE, { keyPath: 'id' })
    store.createIndex('capturedAt', 'capturedAt')
  },
})

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// item: { thumbnailDataUrl, photoDataUrl, result, location? }
export async function addFind(item) {
  const record = {
    id: newId(),
    capturedAt: new Date().toISOString(),
    ...item,
  }
  const db = await dbPromise
  await db.put(STORE, record)
  return record
}

export async function getAllFinds() {
  const db = await dbPromise
  const all = await db.getAllFromIndex(STORE, 'capturedAt')
  // newest first
  return all.reverse()
}

export async function getFind(id) {
  const db = await dbPromise
  return db.get(STORE, id)
}

export async function deleteFind(id) {
  const db = await dbPromise
  await db.delete(STORE, id)
}
