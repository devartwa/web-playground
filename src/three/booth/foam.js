import * as THREE from 'three/webgpu'
import { foamMaterial, wallMaterial } from './materials'

// One acoustic-foam panel: a grid of instanced pyramids (apex toward +Z) on a
// solid backing board. Returned as a Group so callers can place/rotate it as a
// wall. A single shared foam material varies tone by world position, so every
// pyramid reads slightly differently.
export function makeFoamPanel(cols, rows, tile = 0.34) {
  const group = new THREE.Group()

  const h = tile * 0.62
  const geo = new THREE.ConeGeometry(tile * 0.66, h, 4)
  geo.rotateX(Math.PI / 2) // apex from +Y to +Z (pointing out of the wall)

  const mat = foamMaterial()
  const mesh = new THREE.InstancedMesh(geo, mat, cols * rows)
  mesh.castShadow = false
  mesh.receiveShadow = true

  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  const pos = new THREE.Vector3()
  const scl = new THREE.Vector3()
  const w = cols * tile
  const ht = rows * tile
  let i = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) * tile - w / 2
      const y = (r + 0.5) * tile - ht / 2
      const jx = (Math.random() - 0.5) * 0.04
      const jy = (Math.random() - 0.5) * 0.04
      pos.set(x + jx, y + jy, (Math.random() - 0.5) * 0.012)
      e.set((Math.random() - 0.5) * 0.07, (Math.random() - 0.5) * 0.07, Math.random() * Math.PI * 0.5)
      q.setFromEuler(e)
      const s = 0.92 + Math.random() * 0.12
      scl.set(s, s, 0.8 + Math.random() * 0.5)
      m.compose(pos, q, scl)
      mesh.setMatrixAt(i++, m)
    }
  }
  mesh.instanceMatrix.needsUpdate = true
  group.add(mesh)

  // backing board so seams never reveal the void behind the foam
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, ht), wallMaterial('#090a10'))
  board.position.z = -h / 2 - 0.005
  board.receiveShadow = true
  group.add(board)

  return group
}

// Wraps the room in foam: a full back wall plus partial returns on both sides.
export function buildFoamRoom({ width = 7.5, height = 4.8, depth = 6.6, z = -3.0, tile = 0.34 } = {}) {
  const room = new THREE.Group()
  const cx = Math.round(width / tile)
  const cy = Math.round(height / tile)
  const cz = Math.round((depth * 0.6) / tile)

  const back = makeFoamPanel(cx, cy, tile)
  back.position.set(0, height / 2, z)
  room.add(back)

  const left = makeFoamPanel(cz, cy, tile)
  left.rotation.y = Math.PI / 2
  left.position.set(-width / 2, height / 2, z + (depth * 0.6) / 2)
  room.add(left)

  const right = makeFoamPanel(cz, cy, tile)
  right.rotation.y = -Math.PI / 2
  right.position.set(width / 2, height / 2, z + (depth * 0.6) / 2)
  room.add(right)

  return room
}
