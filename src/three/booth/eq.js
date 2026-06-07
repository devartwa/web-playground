import * as THREE from 'three/webgpu'
import { unlitEmissive } from './materials'

// A floating holographic level meter near the stand — the "live feedback" made
// physical. Bars are individual emissive meshes (per-bar colour) anchored at
// their base; the booth animates their height each frame.
const lerpColor = (a, b, t) => a.clone().lerp(b, t)

export function buildEq({ count = 28 } = {}) {
  const group = new THREE.Group()
  const violet = new THREE.Color('#8b7bff')
  const teal = new THREE.Color('#36e6c0')

  const span = 0.74
  const step = span / count
  const bars = []

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const mat = unlitEmissive('#ffffff', 1.6)
    mat.colorNode = undefined // set explicit color below via material.color
    mat.color = lerpColor(violet, teal, t)
    mat.transparent = true
    mat.opacity = 0.92
    mat.blending = THREE.AdditiveBlending
    mat.depthWrite = false

    const geo = new THREE.BoxGeometry(0.012, 1, 0.012)
    geo.translate(0, 0.5, 0) // anchor base at y=0 so scale.y grows upward
    const bar = new THREE.Mesh(geo, mat)
    bar.position.x = i * step - span / 2
    bar.scale.y = 0.04
    group.add(bar)
    bars.push(bar)
  }

  // baseline glow
  const baseMat = unlitEmissive('#9fb0ff', 1.1)
  baseMat.transparent = true
  baseMat.opacity = 0.5
  baseMat.blending = THREE.AdditiveBlending
  baseMat.depthWrite = false
  const baseline = new THREE.Mesh(new THREE.BoxGeometry(span + 0.04, 0.006, 0.02), baseMat)
  group.add(baseline)

  return {
    group,
    update(t, gain = 1) {
      for (let i = 0; i < bars.length; i++) {
        const env =
          0.5 +
          0.5 * Math.sin(t * 6 + i * 0.55) * Math.sin(t * 2.3 + i * 0.2) +
          0.25 * Math.sin(t * 11 + i)
        const h = THREE.MathUtils.clamp(0.03 + Math.abs(env) * 0.19 * (0.4 + gain), 0.02, 0.24)
        bars[i].scale.y += (h - bars[i].scale.y) * 0.35
      }
    },
  }
}
