import { useEffect, useMemo, useRef, useState } from 'react'
import { useStudio } from '../lib/studio'
import { Spark, Metronome, Users } from './icons'

const AUDIENCE_COUNT = { solo: 1, small: 48, full: 312 }

function fmt(t) {
  const m = String(Math.floor(t / 60)).padStart(2, '0')
  const s = String(Math.floor(t % 60)).padStart(2, '0')
  return `${m}:${s}`
}

export default function SessionHUD() {
  const { recording, audience } = useStudio()
  const [elapsed, setElapsed] = useState(42)
  // Live-feeling metrics drift gently inside believable bands.
  const [live, setLive] = useState({ conf: 87, timing: 94, score: 8.6 })

  // REC timer.
  useEffect(() => {
    if (!recording) return
    const id = setInterval(() => setElapsed((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [recording])

  // Subtle metric drift.
  useEffect(() => {
    const id = setInterval(() => {
      setLive((v) => ({
        conf: Math.min(96, Math.max(78, v.conf + (Math.random() * 6 - 3))),
        timing: Math.min(99, Math.max(85, v.timing + (Math.random() * 5 - 2.5))),
        score: Math.min(9.4, Math.max(8.1, v.score + (Math.random() * 0.4 - 0.2))),
      }))
    }, 1400)
    return () => clearInterval(id)
  }, [])

  // 24 waveform bars; deterministic timing so a still frame still reads as audio.
  const bars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        dur: 0.7 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 0.7,
        delay: -((Math.sin(i * 0.9) * 0.5 + 0.5) * 1.4),
      })),
    [],
  )

  const ref = useRef(null)

  return (
    <aside className="hud reveal" data-d="4" ref={ref}>
      <div className="panel">
        <div className="hud__head">
          <span className="hud__rec">
            <i className="dot" />
            {recording ? 'Rec • Live' : 'Standby'}
          </span>
          <span className="hud__time">{fmt(elapsed)}</span>
        </div>

        <div className="hud__body">
          <div className="wave" aria-hidden="true">
            {bars.map((b, i) => (
              <i key={i} style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
            ))}
          </div>

          <div className="metric">
            <span className="metric__label">
              <Spark /> Confidence
            </span>
            <span className="metric__val">
              {Math.round(live.conf)}<small>%</small>
            </span>
            <span className="metric__bar is-violet">
              <i style={{ width: `${live.conf}%` }} />
            </span>
          </div>

          <div className="metric">
            <span className="metric__label">
              <Metronome /> Timing
            </span>
            <span className="metric__val">
              {Math.round(live.timing)}<small>% in pocket</small>
            </span>
            <span className="metric__bar">
              <i style={{ width: `${live.timing}%` }} />
            </span>
          </div>

          <div className="metric">
            <span className="metric__label">
              <Users /> Audience
            </span>
            <span className="metric__val">{AUDIENCE_COUNT[audience].toLocaleString()}</span>
            <span className="metric__bar is-amber">
              <i style={{ width: `${28 + (AUDIENCE_COUNT[audience] / 312) * 72}%` }} />
            </span>
          </div>
        </div>

        <div className="hud__foot">
          <span>Session score</span>
          <span className="hud__score">{live.score.toFixed(1)}</span>
        </div>
      </div>
    </aside>
  )
}
