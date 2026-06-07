import * as THREE from 'three/webgpu'

// A hand-painted equirectangular "studio" — dark walls with a few soft light
// boxes (one warm key, two cool stage washes). Pre-filtered with PMREM so the
// metal mic, chrome stand and satin floor pick up believable, soft studio
// reflections without shipping an HDR file.
function paintEquirect() {
  const w = 1024
  const h = 512
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')

  // base gradient: darker ceiling, slightly lifted floor
  const base = x.createLinearGradient(0, 0, 0, h)
  base.addColorStop(0, '#05060a')
  base.addColorStop(0.5, '#0c0e15')
  base.addColorStop(0.7, '#15171f')
  base.addColorStop(1, '#070809')
  x.fillStyle = base
  x.fillRect(0, 0, w, h)

  // soft light source helper
  const box = (cx, cy, rw, rh, color, a) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rw, rh))
    g.addColorStop(0, color)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    x.globalAlpha = a
    x.fillStyle = g
    x.save()
    x.translate(cx, cy)
    x.scale(rw / Math.max(rw, rh), rh / Math.max(rw, rh))
    x.beginPath()
    x.arc(0, 0, Math.max(rw, rh), 0, Math.PI * 2)
    x.fill()
    x.restore()
    x.globalAlpha = 1
  }

  // warm key (front-right), cool stage washes (left + back), soft top fill
  box(w * 0.66, h * 0.34, 150, 230, '#ffe6c0', 0.95)
  box(w * 0.16, h * 0.42, 150, 260, '#7d6bff', 0.8)
  box(w * 0.9, h * 0.46, 120, 220, '#3fe7c6', 0.6)
  box(w * 0.42, h * 0.12, 320, 90, '#cdd6ff', 0.35)

  const tex = new THREE.CanvasTexture(c)
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function buildEnvironment(renderer, scene) {
  try {
    const pmrem = new THREE.PMREMGenerator(renderer)
    pmrem.compileEquirectangularShader?.()
    const src = paintEquirect()
    const rt = pmrem.fromEquirectangular(src)
    scene.environment = rt.texture
    scene.environmentIntensity = 0.6
    src.dispose()
    return rt
  } catch (e) {
    console.warn('[EchoRoom] PMREM env failed, using flat env:', e)
    scene.environment = paintEquirect()
    scene.environmentIntensity = 0.4
    return null
  }
}
