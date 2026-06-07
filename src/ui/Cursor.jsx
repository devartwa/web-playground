import { useEffect, useRef } from 'react'

// A two-part cursor (dot + trailing ring) that swells over interactive chrome.
// Disabled on coarse pointers via CSS.
export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const d = dot.current
    const r = ring.current
    let dx = innerWidth / 2
    let dy = innerHeight / 2
    let rx = dx
    let ry = dy
    let raf

    const move = (e) => {
      dx = e.clientX
      dy = e.clientY
      d.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`
      const hover = !!e.target.closest('[data-interactive], a, button')
      r.classList.toggle('is-hover', hover)
    }

    const loop = () => {
      rx += (dx - rx) * 0.18
      ry += (dy - ry) * 0.18
      r.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', move)
    loop()
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="cursor" ref={dot} />
      <div className="cursor-ring" ref={ring} />
    </>
  )
}
