import * as THREE from 'three/webgpu'
import {
  mx_noise_float,
  positionWorld,
  positionLocal,
  normalLocal,
  color,
  float,
  vec3,
  mix,
  smoothstep,
  clamp,
  fract,
  abs,
  uv,
} from 'three/tsl'

// Small helper: signed simplex noise → 0..1, sampled in world space.
const n01 = (p, s) => mx_noise_float(p.mul(s)).mul(0.5).add(0.5)

// ---- acoustic foam ------------------------------------------------------
// Matte charcoal with panel-to-panel tonal drift and roughness break-up so
// the wall of pyramids doesn't read as one flat colour.
export function foamMaterial() {
  const m = new THREE.MeshStandardNodeMaterial()
  const shade = n01(positionWorld, 1.6)
  const micro = n01(positionWorld, 9.0)
  m.colorNode = mix(color('#191b23'), color('#2a2d39'), shade.mul(0.85))
  m.roughnessNode = clamp(float(0.96).sub(micro.mul(0.12)), 0.7, 1)
  m.metalness = 0
  return m
}

// ---- satin wood floor ---------------------------------------------------
export function floorMaterial() {
  const m = new THREE.MeshPhysicalNodeMaterial()
  const p = positionWorld
  // planks run along Z; seams repeat across X
  const seam = fract(p.x.mul(0.9)).sub(0.5).abs()
  const seamLine = smoothstep(0.44, 0.5, seam)
  const grain = mx_noise_float(vec3(p.x.mul(2.2), p.y, p.z.mul(22.0))).mul(0.5).add(0.5)
  const blotch = n01(p, 0.6)
  const base = mix(color('#0a0b11'), color('#15171f'), grain.mul(0.7).add(blotch.mul(0.2)))
  m.colorNode = base.mul(seamLine.oneMinus().mul(0.45).add(0.55))
  m.roughnessNode = clamp(float(0.32).add(grain.mul(0.18)).add(seamLine.mul(0.25)), 0.18, 0.8)
  m.metalness = 0
  m.clearcoat = 0.45
  m.clearcoatRoughness = 0.35
  return m
}

// ---- rug under the stand ------------------------------------------------
export function rugMaterial() {
  const m = new THREE.MeshStandardNodeMaterial()
  const weave = n01(positionWorld, 22.0)
  const mottle = n01(positionWorld, 2.2)
  m.colorNode = mix(color('#241036'), color('#3a1b46'), mottle).mul(weave.mul(0.25).add(0.8))
  m.roughnessNode = float(0.92).sub(weave.mul(0.08))
  m.metalness = 0
  return m
}

// ---- painted wall / structure ------------------------------------------
export function wallMaterial(hex = '#0c0e15') {
  const m = new THREE.MeshStandardNodeMaterial()
  const v = n01(positionWorld, 1.1)
  m.colorNode = mix(color(hex), color('#05060a'), v.mul(0.4))
  m.roughness = 0.85
  m.metalness = 0
  return m
}

// ---- brushed dark metal (mic body) -------------------------------------
export function metalDark() {
  const m = new THREE.MeshStandardNodeMaterial()
  const brush = mx_noise_float(vec3(positionLocal.y.mul(120), positionLocal.x.mul(6), 0)).mul(0.5).add(0.5)
  m.colorNode = mix(color('#23252e'), color('#34363f'), brush.mul(0.5))
  m.roughnessNode = clamp(float(0.45).add(brush.mul(0.1)), 0.3, 0.6)
  m.metalness = 0.55
  return m
}

// ---- mic grille (perforated metal feel) --------------------------------
export function grilleMaterial() {
  const m = new THREE.MeshStandardNodeMaterial()
  // fine dot pattern from uv → roughness break-up mimicking the mesh
  const g = uv().mul(34)
  const dots = smoothstep(0.35, 0.5, fract(g.x).sub(0.5).abs())
    .mul(smoothstep(0.35, 0.5, fract(g.y).sub(0.5).abs()))
  m.colorNode = mix(color('#070709'), color('#101218'), dots)
  m.roughnessNode = clamp(float(0.62).sub(dots.mul(0.3)), 0.28, 0.8)
  m.metalness = 1
  return m
}

// ---- chrome ------------------------------------------------------------
export function chrome(hex = '#cfd2dc', rough = 0.13) {
  const m = new THREE.MeshStandardNodeMaterial()
  m.color = new THREE.Color(hex)
  m.metalness = 1
  m.roughness = rough
  return m
}

// ---- matte plastic / rubber --------------------------------------------
export function plastic(hex = '#0b0b0e', rough = 0.55) {
  const m = new THREE.MeshStandardNodeMaterial()
  m.color = new THREE.Color(hex)
  m.metalness = 0
  m.roughness = rough
  return m
}

// ---- leather-ish cushion -----------------------------------------------
export function leather(hex = '#171419') {
  const m = new THREE.MeshStandardNodeMaterial()
  const grain = n01(positionLocal, 60)
  m.colorNode = mix(color(hex), color('#000000'), grain.mul(0.25))
  m.roughnessNode = clamp(float(0.62).add(grain.mul(0.12)), 0.4, 0.85)
  m.metalness = 0
  return m
}

// ---- pop-filter screen (thin translucent mesh) -------------------------
export function popMesh() {
  const m = new THREE.MeshStandardNodeMaterial()
  m.color = new THREE.Color('#050507')
  m.roughness = 0.25
  m.metalness = 0
  m.transparent = true
  m.opacity = 0.18
  m.side = THREE.DoubleSide
  m.depthWrite = false
  return m
}

// ---- unlit emissive (signs, holographic readouts) ----------------------
// Bright, lighting-independent surface that drives the bloom pass.
export function unlitEmissive(hex, intensity = 1.4) {
  const m = new THREE.MeshBasicNodeMaterial()
  m.colorNode = color(hex).mul(intensity)
  m.toneMapped = false
  return m
}
