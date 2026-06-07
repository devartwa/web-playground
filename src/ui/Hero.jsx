import { ArrowRight, PlayCircle } from './icons'

export default function Hero() {
  return (
    <section className="hero">
      <p className="eyebrow reveal" data-d="2">
        Virtual Rehearsal Studio
      </p>

      <h1 className="hero__title reveal" data-d="3">
        Rehearse like the&nbsp;room is <em>already&nbsp;full.</em>
      </h1>

      <p className="hero__sub reveal" data-d="4">
        Step into the booth and perform for a simulated crowd. EchoRoom scores your
        timing and confidence in real time, records every take, and shows you the
        progress — take after take.
      </p>

      <div className="hero__cta reveal" data-d="5">
        <a className="btn btn--primary" href="#start" data-interactive>
          Enter the booth
          <ArrowRight />
        </a>
        <a className="btn btn--ghost" href="#demo" data-interactive>
          <PlayCircle />
          Watch a session
        </a>
      </div>

      <div className="hero__proof reveal" data-d="6">
        <div className="avatars" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        <p>
          Trusted by <b>40,000+</b> musicians, speakers &amp; teams in rehearsal.
        </p>
      </div>
    </section>
  )
}
