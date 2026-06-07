// Minimal 24×24 stroke icons, sized by CSS. currentColor everywhere so they
// inherit the control's state colour.
const s = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}
const Svg = (p) => <svg viewBox="0 0 24 24" {...s} {...p} />

export const Play = (p) => (
  <Svg {...p}><path d="M7 5.5v13l11-6.5z" fill="currentColor" stroke="none" /></Svg>
)
export const Pause = (p) => (
  <Svg {...p}><path d="M8 5v14M16 5v14" /></Svg>
)
export const Rec = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" /></Svg>
)
export const Stop = (p) => (
  <Svg {...p}><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" /></Svg>
)
export const Skip = (p) => (
  <Svg {...p}><path d="M7 6v12M19 6v12M9 12l8-6v12z" fill="currentColor" /></Svg>
)
export const Mic = (p) => (
  <Svg {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" /></Svg>
)
export const Light = (p) => (
  <Svg {...p}><path d="M12 3v2M5 6l1.4 1.4M19 6l-1.4 1.4M4 12h2M18 12h2" /><circle cx="12" cy="13" r="3.4" /><path d="M10 19h4M10.5 21.5h3" /></Svg>
)
export const Music = (p) => (
  <Svg {...p}><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></Svg>
)
export const Users = (p) => (
  <Svg {...p}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3 3 0 0 1 0 5.6M17 14.2a5.5 5.5 0 0 1 3.5 5.1" /></Svg>
)
export const Spark = (p) => (
  <Svg {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></Svg>
)
export const Metronome = (p) => (
  <Svg {...p}><path d="M9 4h6l3 16H6zM12 4l-2 12M12 9l4 5" /></Svg>
)
export const Gauge = (p) => (
  <Svg {...p}><path d="M4 18a8 8 0 1 1 16 0" /><path d="M12 14l4-3" /></Svg>
)
export const ArrowRight = (p) => (
  <Svg {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Svg>
)
export const PlayCircle = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" /></Svg>
)
