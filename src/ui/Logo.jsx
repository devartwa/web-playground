// The EchoRoom mark: a sound source (dot) inside the booth, with three echo
// rings radiating out — quiet → bright as they travel. Used in the nav and
// preloader.
export default function Logo({ className }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0.6" y="0.6" width="38.8" height="38.8" rx="11" fill="#0c0e16" />
      <rect x="0.6" y="0.6" width="38.8" height="38.8" rx="11" stroke="white" strokeOpacity="0.1" />
      <circle cx="14" cy="20" r="3.1" fill="#8b7bff" />
      <path d="M20 13.6a9 9 0 0 1 0 12.8" stroke="#8b7bff" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
      <path d="M24.6 10a15 15 0 0 1 0 20" stroke="#36e6c0" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <path d="M29.2 6.6a21 21 0 0 1 0 26.8" stroke="#ff5c4d" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
