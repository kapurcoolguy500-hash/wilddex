import React, { useEffect, useState, useCallback } from 'react'
import CaptureScreen from './components/CaptureScreen.jsx'
import ResultCard from './components/ResultCard.jsx'
import CollectionGrid from './components/CollectionGrid.jsx'
import EntryDetail from './components/EntryDetail.jsx'
import { compressImage, makeThumbnail } from './lib/image.js'
import { identifyImage } from './lib/api.js'
import { addFind, getAllFinds, deleteFind } from './lib/storage.js'
import { sameSpecies } from './lib/meta.js'
import {
  playScanStart,
  startScanningLoop,
  stopScanningLoop,
  playSuccess,
  playNoMatch,
  isMuted,
  toggleMuted,
} from './lib/sound.js'

export default function App() {
  const [tab, setTab] = useState('scan') // 'scan' | 'dex'
  const [muted, setMutedState] = useState(isMuted())

  // scan flow state
  const [status, setStatus] = useState('idle') // idle | identifying | result
  const [photo, setPhoto] = useState(null)
  const [entry, setEntry] = useState(null)
  const [error, setError] = useState(null)
  const [lastFile, setLastFile] = useState(null)
  const [saved, setSaved] = useState(false)
  const [isNew, setIsNew] = useState(false) // species not yet in the Dex

  // collection state
  const [finds, setFinds] = useState([])
  const [openFind, setOpenFind] = useState(null)

  const refreshFinds = useCallback(async () => {
    setFinds(await getAllFinds())
  }, [])

  useEffect(() => {
    refreshFinds()
  }, [refreshFinds])

  const runIdentify = useCallback(async (file) => {
    setLastFile(file)
    setError(null)
    setSaved(false)
    setStatus('identifying')
    playScanStart()
    startScanningLoop()
    const startedAt = performance.now()
    const MIN_SCAN_MS = 1400 // let the animation + sound land even on fast IDs
    try {
      const [full, thumb] = await Promise.all([compressImage(file), makeThumbnail(file)])
      setPhoto(full) // show the photo under the scanner animation right away
      const result = await identifyImage(full)
      const elapsed = performance.now() - startedAt
      if (elapsed < MIN_SCAN_MS) {
        await new Promise((r) => setTimeout(r, MIN_SCAN_MS - elapsed))
      }
      stopScanningLoop()
      setEntry({ ...result, _thumb: thumb })
      setIsNew(result.identified && !finds.some((f) => sameSpecies(f.result, result)))
      setStatus('result')
      if (result.identified) playSuccess()
      else playNoMatch()
    } catch (err) {
      stopScanningLoop()
      setError(err.message || 'Something went wrong.')
      setStatus('idle')
    }
  }, [finds])

  const handleToggleMute = useCallback(() => {
    setMutedState(toggleMuted())
  }, [])

  const handleSave = useCallback(async () => {
    if (!entry) return
    const { _thumb, ...result } = entry
    await addFind({ photoDataUrl: photo, thumbnailDataUrl: _thumb, result })
    setSaved(true)
    await refreshFinds()
  }, [entry, photo, refreshFinds])

  const resetScan = useCallback(() => {
    setStatus('idle')
    setPhoto(null)
    setEntry(null)
    setError(null)
    setSaved(false)
    setIsNew(false)
  }, [])

  const handleDelete = useCallback(
    async (find) => {
      await deleteFind(find.id)
      setOpenFind(null)
      await refreshFinds()
    },
    [refreshFinds],
  )

  // Detail overlay sits above everything when a find is open.
  if (openFind) {
    const idx = finds.findIndex((f) => f.id === openFind.id)
    const number = finds.length - idx
    return (
      <EntryDetail
        find={openFind}
        number={number}
        onClose={() => setOpenFind(null)}
        onDelete={handleDelete}
      />
    )
  }

  return (
    <div className="app">
      <button
        className="mutebtn"
        onClick={handleToggleMute}
        aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
        title={muted ? 'Unmute sounds' : 'Mute sounds'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      <main className="app__main">
        {tab === 'scan' &&
          (status === 'result' && entry ? (
            <ResultCard
              photo={photo}
              entry={entry}
              saved={saved}
              isNew={isNew}
              onSave={handleSave}
              onDiscard={resetScan}
            />
          ) : (
            <CaptureScreen
              onPick={runIdentify}
              status={status}
              error={error}
              lastFile={lastFile}
              onRetry={() => lastFile && runIdentify(lastFile)}
            />
          ))}

        {tab === 'dex' && (
          <CollectionGrid finds={finds} onOpen={setOpenFind} onGoScan={() => setTab('scan')} />
        )}
      </main>

      {status === 'identifying' && (
        <div className="scanning" role="status" aria-live="polite">
          <div className="scanner">
            {photo ? (
              <img className="scanner__photo" src={photo} alt="" />
            ) : (
              <div className="scanner__photo scanner__photo--placeholder" />
            )}
            <div className="scanner__grid" />
            <div className="scanner__reticle">
              <span />
              <span />
              <span />
              <span />
            </div>
            <span className="scanner__line" />
          </div>
          <p className="scanning__label">
            ANALYZING<span className="scanning__dots" />
          </p>
        </div>
      )}

      <nav className="tabbar">
        <button
          className={`tabbar__btn ${tab === 'scan' ? 'is-active' : ''}`}
          onClick={() => {
            // Tapping Scan always returns to a fresh camera, never a stuck result.
            if (status === 'result') resetScan()
            setTab('scan')
          }}
        >
          <span className="tabbar__icon">◎</span>
          Scan
        </button>
        <button
          className={`tabbar__btn ${tab === 'dex' ? 'is-active' : ''}`}
          onClick={() => setTab('dex')}
        >
          <span className="tabbar__icon">▦</span>
          Dex{finds.length ? ` · ${finds.length}` : ''}
        </button>
      </nav>
    </div>
  )
}
