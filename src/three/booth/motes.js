import * as THREE from 'three/webgpu'
import { positionLocal, time, vec3, sin, cos, color } from 'three/tsl'

// Dust drifting in the light. Position drift, twinkle and the round sprite mask
// are all computed on the GPU in TSL — no per-frame CPU work, and the motes
// feed the bloom pass for a soft volumetric glow.
export function buildMotes({ count = 460 } = {}) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 5.6
    positions[i * 3 + 1] = Math.random() * 3.1 + 0.15
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3.6 - 0.5
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const mat = new THREE.PointsNodeMaterial()
  const p = positionLocal
  const t = time
  const drift = vec3(
    sin(t.mul(0.2).add(p.y.mul(2.0))).mul(0.09),
    sin(t.mul(0.16).add(p.x.mul(1.6))).mul(0.06),
    cos(t.mul(0.18).add(p.x.mul(1.2))).mul(0.07),
  )
  mat.positionNode = p.add(drift)

  const twinkle = sin(t.mul(1.6).add(p.x.mul(7.0)).add(p.z.mul(5.0))).mul(0.5).add(0.5)
  mat.opacityNode = twinkle.mul(0.5).add(0.12).mul(0.5)
  mat.colorNode = color('#ffe9cf')

  mat.size = 0.045
  mat.sizeAttenuation = true
  mat.transparent = true
  mat.depthWrite = false
  mat.blending = THREE.AdditiveBlending
  mat.toneMapped = false

  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  return points
}
