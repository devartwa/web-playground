import * as THREE from 'three/webgpu'
import { texture, uniform } from 'three/tsl'
import { plastic } from './materials'

// A wall-mounted ON AIR box. The lit face is an unlit, tone-mapping-bypassed
// texture so the glyphs blow out into the bloom pass. Intensity is a uniform
// the booth eases between "live" (red) and "standby" (dim).
function sign(text, rgb) {
  const w = 512
  const h = 168
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')
  x.fillStyle = '#070406'
  x.fillRect(0, 0, w, h)
  // inner bezel
  x.strokeStyle = 'rgba(255,255,255,0.06)'
  x.lineWidth = 6
  x.strokeRect(14, 14, w - 28, h - 28)
  x.font = '700 86px "Space Grotesk Variable", system-ui, sans-serif'
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.shadowColor = rgb
  x.shadowBlur = 34
  x.fillStyle = rgb
  x.fillText(text, w / 2, h / 2 + 4)
  x.shadowBlur = 0
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export function buildOnAir() {
  const group = new THREE.Group()

  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.32, 0.06), plastic('#070709', 0.6))
  housing.castShadow = true
  group.add(housing)

  const intensity = uniform(2.4)
  const faceMat = new THREE.MeshBasicNodeMaterial()
  faceMat.colorNode = texture(sign('ON AIR', '#ff5f4d')).mul(intensity)
  faceMat.toneMapped = false
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.28), faceMat)
  face.position.z = 0.031
  group.add(face)

  return {
    group,
    setLive(v) {
      // eased by the booth; just expose the target
      intensity.value = v ? 2.6 : 0.5
    },
    _intensity: intensity,
  }
}
