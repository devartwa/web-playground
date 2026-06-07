import { useEffect, useRef } from 'react'
import Booth from './booth/Booth'

// Thin bridge: owns a plain <canvas> we create ourselves (rather than a
// React-managed element) and mount into a container. The Booth reads the shared
// studio state directly, so there's no per-control plumbing here.
export default function BoothCanvas({ onReady }) {
  const host = useRef(null)

  useEffect(() => {
    const container = host.current
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'width:100%;height:100%;display:block'
    container.appendChild(canvas)

    const booth = new Booth(canvas)
    let alive = true

    booth.init({ onReady: () => alive && onReady?.() }).catch((e) => {
      console.error('[EchoRoom] booth init failed:', e?.stack || e)
      onReady?.() // don't trap the UI behind the loader
    })

    const ro = new ResizeObserver(() => booth.resize())
    ro.observe(container)

    const onMove = (e) => {
      booth.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      alive = false
      window.removeEventListener('pointermove', onMove)
      ro.disconnect()
      booth.dispose()
      canvas.remove()
    }
  }, [onReady])

  return <div className="stage__host" ref={host} style={{ position: 'absolute', inset: 0 }} />
}
