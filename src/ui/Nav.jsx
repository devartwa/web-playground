import Logo from './Logo'
import { ArrowRight } from './icons'

const LINKS = [
  { label: 'The Booth', href: '#booth' },
  { label: 'Audiences', href: '#audiences' },
  { label: 'Feedback', href: '#feedback' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Nav() {
  return (
    <header className="nav reveal" data-d="1">
      <a className="brand" href="#top" data-interactive aria-label="EchoRoom home">
        <Logo className="brand__mark" />
        <span className="brand__word">
          <b>Echo</b>
          <span>Room</span>
        </span>
      </a>

      <nav className="nav__links" aria-label="Primary">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} data-interactive>
            {l.label}
          </a>
        ))}
      </nav>

      <div className="nav__actions">
        <a className="btn btn--ghost" href="#signin" data-interactive>
          Sign in
        </a>
        <a className="btn btn--primary" href="#start" data-interactive>
          Start free
          <ArrowRight />
        </a>
      </div>
    </header>
  )
}
