import { useEffect, useState } from 'react'
import BoothCanvas from './three/BoothCanvas'
import ErrorBoundary from './ui/ErrorBoundary'
import Cursor from './ui/Cursor'
import Preloader from './ui/Preloader'
import Nav from './ui/Nav'
import Hero from './ui/Hero'
import SessionHUD from './ui/SessionHUD'
import Transport from './ui/Transport'

export default function App() {
  const [ready, setReady] = useState(false)
  // ?bare hides the UI chrome so the 3D set can be art-directed in isolation.
  const bare = typeof location !== 'undefined' && location.search.includes('bare')

  // Safety net: never trap the UI behind the loader if the scene stalls.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 7000)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <div className="stage">
        <ErrorBoundary onError={() => setReady(true)}>
          <BoothCanvas onReady={() => setReady(true)} />
        </ErrorBoundary>
      </div>

      <div className="vignette" />
      <div className="grain" />

      {!bare && (
        <div className={`ui${ready ? ' is-ready' : ''}`}>
          <Nav />
          <div className="mid">
            <Hero />
            <SessionHUD />
          </div>
          <Transport />
        </div>
      )}

      {!bare && <Cursor />}
      {!bare && <Preloader ready={ready} />}
    </>
  )
}
