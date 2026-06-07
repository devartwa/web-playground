import { useMemo, useState } from 'react'
import { useStudio, studio } from '../lib/studio'
import { Play, Pause, Rec, Stop, Light, Music } from './icons'

const AUDIENCES = [
  { key: 'solo', label: 'Solo' },
  { key: 'small', label: 'Small' },
  { key: 'full', label: 'Full house' },
]

export default function Transport() {
  const { recording, stageLights, backingTrack, audience } = useStudio()
  const [playing, setPlaying] = useState(true)

  // A frozen-but-alive scrub bar: heights read like a rendered waveform.
  const timeline = useMemo(
    () => Array.from({ length: 40 }, (_, i) => 18 + (Math.sin(i * 0.6) * 0.5 + 0.5) * (i < 24 ? 70 : 24)),
    [],
  )

  return (
    <div className="transport">
      <div className="dock panel reveal" data-d="5" role="toolbar" aria-label="Session transport">
        <div className="dock__group">
          <button
            className={`ctrl ctrl--rec${recording ? ' is-live' : ''}`}
            onClick={() => studio.toggle('recording')}
            aria-pressed={recording}
            title={recording ? 'Stop recording' : 'Record'}
          >
            {recording ? <Stop /> : <Rec />}
          </button>
          <button
            className="ctrl ctrl--play"
            onClick={() => setPlaying((p) => !p)}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause /> : <Play />}
          </button>
        </div>

        <span className="dock__sep" />

        <div className="seg" role="group" aria-label="Audience size">
          {AUDIENCES.map((a) => (
            <button
              key={a.key}
              className={audience === a.key ? 'is-on' : ''}
              onClick={() => studio.set({ audience: a.key })}
            >
              {a.label}
            </button>
          ))}
        </div>

        <span className="dock__sep" />

        <div className="dock__group">
          <button
            className={`ctrl${stageLights ? ' is-active' : ''}`}
            onClick={() => studio.toggle('stageLights')}
            aria-pressed={stageLights}
            title="Stage lighting"
          >
            <Light />
          </button>
          <button
            className={`ctrl${backingTrack ? ' is-active' : ''}`}
            onClick={() => studio.toggle('backingTrack')}
            aria-pressed={backingTrack}
            title="Backing track"
          >
            <Music />
          </button>
        </div>

        <span className="dock__sep" />

        <div className="dock__meta">
          <span className="k">Take</span>
          <span className="v">03 — A minor</span>
        </div>

        <div className="dock__timeline" aria-hidden="true">
          {timeline.map((h, i) => (
            <i key={i} style={{ height: `${h}%`, opacity: i < 24 ? 0.7 : 0.3 }} />
          ))}
        </div>
      </div>
    </div>
  )
}
