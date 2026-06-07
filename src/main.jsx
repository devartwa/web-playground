import { createRoot } from 'react-dom/client'

// Fonts are bundled (no runtime CDN) so the experience is self-contained.
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/inter'

import './styles/global.css'
import App from './App.jsx'

// StrictMode is intentionally omitted: it double-invokes effects in dev, which
// fights with the single WebGPU context we set up imperatively in BoothCanvas.
createRoot(document.getElementById('root')).render(<App />)
