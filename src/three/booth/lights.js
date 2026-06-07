import * as THREE from 'three/webgpu'
import { color } from 'three/tsl'

// Cinematic studio rig: a warm key (with shadow), a soft cool fill, two coloured
// stage washes raking the foam, and a cool rim to lift the mic off the wall.
// Stage intensity and the record tint are eased by the booth via apply*().

function makeCone(hex, maxOpacity, from, to, angle) {
  const dir = new THREE.Vector3().subVectors(from, to)
  const len = dir.length()
  const radius = Math.tan(angle) * len
  const geo = new THREE.ConeGeometry(radius, len, 32, 1, true)

  const mat = new THREE.MeshBasicNodeMaterial()
  mat.color = new THREE.Color(hex)
  mat.transparent = true
  mat.opacity = maxOpacity
  mat.blending = THREE.AdditiveBlending
  mat.depthWrite = false
  mat.side = THREE.DoubleSide
  mat.toneMapped = false
  // brighter toward the apex (the source), fading to the floor
  mat.opacityNode = undefined

  const cone = new THREE.Mesh(geo, mat)
  cone.position.copy(from).add(to).multiplyScalar(0.5)
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  cone.userData.baseOpacity = maxOpacity
  cone.userData.mat = mat
  return cone
}

export function buildLights() {
  const group = new THREE.Group()

  const hemi = new THREE.HemisphereLight('#46507a', '#070708', 0.22)
  group.add(hemi)

  const ambient = new THREE.AmbientLight('#20243a', 0.07)
  group.add(ambient)

  // A soft "softbox" the metal mic reflects — the trick that makes chrome read
  // as a lit hero rather than a black silhouette. Sits just off camera-left.
  const softMat = new THREE.MeshBasicNodeMaterial()
  softMat.colorNode = color('#ffe9d6').mul(2.4)
  softMat.toneMapped = false
  const softbox = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.0), softMat)
  softbox.position.set(1.55, 1.8, 1.7)
  softbox.lookAt(0, 1.5, -0.1)
  group.add(softbox)

  const target = new THREE.Object3D()
  target.position.set(0, 1.5, 0)
  group.add(target)

  // warm key — the hero light on the mic
  const key = new THREE.SpotLight('#ffe2bd', 220, 16, 0.55, 0.5, 2)
  key.position.set(2.1, 3.0, 2.7)
  key.target = target
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 14
  key.shadow.bias = -0.0004
  key.shadow.radius = 6
  group.add(key)
  const keyWarm = new THREE.Color('#ffe2bd')
  const keyLive = new THREE.Color('#ffcf9e')

  // cool rim from back-left to separate the mic from the wall
  const rim = new THREE.SpotLight('#9fb8ff', 26, 16, 0.6, 0.7, 2)
  rim.position.set(-2.4, 2.6, -1.6)
  rim.target = target
  group.add(rim)

  // stage washes — rake the back-wall edges to frame the mic with colour
  const stageTargetA = new THREE.Object3D()
  stageTargetA.position.set(-2.7, 1.1, -3.0)
  group.add(stageTargetA)
  const stageA = new THREE.SpotLight('#7d5cff', 10, 18, 0.42, 0.85, 2)
  stageA.position.set(-3.6, 4.1, -1.4)
  stageA.target = stageTargetA
  group.add(stageA)

  const stageTargetB = new THREE.Object3D()
  stageTargetB.position.set(2.7, 1.0, -3.0)
  group.add(stageTargetB)
  const stageB = new THREE.SpotLight('#34e6c0', 8, 18, 0.42, 0.85, 2)
  stageB.position.set(3.6, 3.9, -1.4)
  stageB.target = stageTargetB
  group.add(stageB)

  // visible light shafts for the stage washes
  const coneA = makeCone('#6b54ff', 0.05, stageA.position, stageTargetA.position, 0.26)
  const coneB = makeCone('#2fe0c4', 0.045, stageB.position, stageTargetB.position, 0.26)
  group.add(coneA, coneB)

  const baseKey = key.intensity
  const baseStageA = stageA.intensity
  const baseStageB = stageB.intensity
  const baseRim = rim.intensity

  return {
    group,
    key,
    applyStage(v) {
      stageA.intensity = baseStageA * v
      stageB.intensity = baseStageB * v
      rim.intensity = baseRim * (0.55 + 0.45 * v)
      coneA.userData.mat.opacity = coneA.userData.baseOpacity * v
      coneB.userData.mat.opacity = coneB.userData.baseOpacity * v
    },
    applyRecord(v) {
      key.color.copy(keyWarm).lerp(keyLive, v)
      key.intensity = baseKey * (1 + 0.12 * v)
    },
  }
}
