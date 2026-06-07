import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'

const STEPS = ['Calibrating room', 'Hanging acoustics', 'Warming the mic', 'Cueing audience']

// Determinate-feeling loader. Climbs to ~92% on its own, then snaps to 100%
// the moment the booth reports its first rendered frame.
export default function Preloader({ ready, onDone }) {
  const [pct, setPct] = useState(8)
  const [done, setDone] = useState(false)
  const fill = useRef(null)

  useEffect(() => {
    if (ready) return
    const id = setInterval(() => {
      setPct((p) => (p < 92 ? p + Math.max(1, (92 - p) * 0.08) : p))
    }, 90)
    return () => clearInterval(id)
  }, [ready])

  useEffect(() => {
    if (!ready) return
    setPct(100)
    const t = setTimeout(() => {
      setDone(true)
      onDone?.()
    }, 520)
    return () => clearTimeout(t)
  }, [ready, onDone])

  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length))]

  return (
    <div className={`preloader${done ? ' is-done' : ''}`}>
      <div className="preloader__inner">
        <div className="preloader__mark">
          <Logo />
          <span>
            <b style={{ fontWeight: 600 }}>Echo</b>
            <span style={{ color: 'var(--mist)' }}>Room</span>
          </span>
        </div>
        <div className="preloader__bar">
          <i ref={fill} style={{ width: `${pct}%` }} />
        </div>
        <div className="preloader__status">
          <span>{ready ? 'Ready' : step}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      </div>
    </div>
  )
}
