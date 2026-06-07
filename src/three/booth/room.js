import * as THREE from 'three/webgpu'
import { floorMaterial, rugMaterial, wallMaterial } from './materials'

export function buildRoom({ width = 7.5, depth = 6.6, z = -3.0 } = {}) {
  const room = new THREE.Group()

  // floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width * 2.2, depth * 2.4), floorMaterial())
  floor.rotation.x = -Math.PI / 2
  floor.position.z = z + depth * 0.4
  floor.receiveShadow = true
  room.add(floor)

  // rug under the stand — warm anchor for the composition
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.7, 64), rugMaterial())
  rug.rotation.x = -Math.PI / 2
  rug.position.set(0, 0.004, -0.2)
  rug.scale.set(1, 1.18, 1)
  rug.receiveShadow = true
  room.add(rug)

  // a thin darker border ring on the rug
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.66, 64), rugMaterial())
  ring.rotation.x = -Math.PI / 2
  ring.position.set(0, 0.006, -0.2)
  ring.scale.set(1, 1.18, 1)
  room.add(ring)

  // baseboard along the back wall
  const base = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, 0.06), wallMaterial('#070810'))
  base.position.set(0, 0.06, z + 0.02)
  room.add(base)

  // ceiling closes the box for fog/reflections (mostly out of frame)
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(width * 2.2, depth * 2.4), wallMaterial('#06070b'))
  ceil.rotation.x = Math.PI / 2
  ceil.position.set(0, 4.8, z + depth * 0.4)
  room.add(ceil)

  return room
}
