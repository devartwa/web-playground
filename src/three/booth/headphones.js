import * as THREE from 'three/webgpu'
import { plastic, leather, chrome } from './materials'

// Studio cans, modelled to drape over the mic stand. Built around the origin
// with the headband arching up in +Y and ear cups on ±X; the booth tilts and
// places the group on the pole.
export function buildHeadphones() {
  const g = new THREE.Group()
  const shell = plastic('#0b0b0e', 0.5)
  const pad = leather('#161318')
  const steel = chrome('#9aa0ad', 0.3)

  const R = 0.16

  // headband arch
  const band = new THREE.Mesh(new THREE.TorusGeometry(R, 0.018, 16, 48, Math.PI), shell)
  band.castShadow = true
  g.add(band)
  const bandPad = new THREE.Mesh(new THREE.TorusGeometry(R - 0.014, 0.012, 12, 48, Math.PI), pad)
  g.add(bandPad)

  const cup = (sx) => {
    const c = new THREE.Group()
    c.position.set(sx * R, 0, 0)

    const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.07, 0.05), steel)
    yoke.position.y = 0.03
    c.add(yoke)

    const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.05, 40), shell)
    outer.rotation.z = Math.PI / 2
    outer.position.x = sx * 0.02
    outer.castShadow = true
    c.add(outer)

    const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.026, 16, 36), pad)
    cushion.rotation.y = Math.PI / 2
    cushion.position.x = sx * 0.045
    c.add(cushion)

    const plate = new THREE.Mesh(new THREE.CircleGeometry(0.05, 36), pad)
    plate.rotation.y = sx * Math.PI / 2
    plate.position.x = sx * 0.058
    c.add(plate)

    return c
  }

  g.add(cup(-1))
  g.add(cup(1))

  return g
}
