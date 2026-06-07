import * as THREE from 'three/webgpu'
import { metalDark, grilleMaterial, chrome, plastic, popMesh, unlitEmissive } from './materials'

// A studio condenser on a round-base stand: heavy base, chrome column, a spider
// shock-mount cradling a side-address capsule, and a gooseneck pop filter.
// Returns the group plus the LED material so the booth can pulse it when live.
export function buildMicrophone() {
  const group = new THREE.Group()
  const matMetal = metalDark()
  const matGrille = grilleMaterial()
  const matChrome = chrome('#c8ccd8', 0.14)
  const matChromeDark = chrome('#3b3d47', 0.28)
  const matPlastic = plastic('#0a0a0d', 0.5)

  // ---- stand ----------------------------------------------------------
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.05, 56), matPlastic)
  base.position.y = 0.025
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  const baseTrim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.012, 16, 64), matChromeDark)
  baseTrim.rotation.x = Math.PI / 2
  baseTrim.position.y = 0.05
  group.add(baseTrim)

  const poleH = 1.46
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.027, poleH, 28), matChrome)
  pole.position.y = 0.05 + poleH / 2
  pole.castShadow = true
  group.add(pole)

  const clutch = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.07, 24), matPlastic)
  clutch.position.y = 0.05 + poleH * 0.62
  group.add(clutch)

  // ---- mic head assembly (sits at the top of the pole) ----------------
  const head = new THREE.Group()
  head.position.set(0, 0.05 + poleH + 0.02, 0)
  head.rotation.x = -0.12 // tip the capsule slightly toward the performer
  group.add(head)

  // shock-mount outer ring (faces +Z, toward camera)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.014, 18, 64), matMetal)
  head.add(ring)

  // yoke connecting the ring to the clutch
  const yoke = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.013, 12, 40, Math.PI), matChromeDark)
  yoke.rotation.z = Math.PI
  yoke.position.y = -0.02
  head.add(yoke)

  // capsule: body + mesh basket
  const capsule = new THREE.Group()
  head.add(capsule)

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.17, 40), matMetal)
  body.position.y = -0.03
  body.castShadow = true
  capsule.add(body)

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 40), matChrome)
  collar.position.y = 0.06
  capsule.add(collar)

  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.13, 44, 1, true), matGrille)
  basket.position.y = 0.13
  basket.castShadow = true
  capsule.add(basket)

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.066, 44, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    matGrille,
  )
  dome.position.y = 0.195
  capsule.add(dome)

  const basketBottom = new THREE.Mesh(new THREE.CircleGeometry(0.066, 44), matMetal)
  basketBottom.rotation.x = -Math.PI / 2
  basketBottom.position.y = 0.065
  capsule.add(basketBottom)

  // little "live" LED on the front of the body
  const ledMat = unlitEmissive('#ff5c4d', 2.2)
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 16), ledMat)
  led.position.set(0, -0.01, 0.058)
  capsule.add(led)

  // suspension bands: thin lines from the ring to the capsule
  const bandMat = plastic('#070708', 0.6)
  const bandGeo = new THREE.CylinderGeometry(0.004, 0.004, 1, 8)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const from = new THREE.Vector3(Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0)
    const to = new THREE.Vector3(0, i % 2 ? 0.05 : -0.06, 0)
    const band = new THREE.Mesh(bandGeo, bandMat)
    band.position.copy(from.clone().add(to).multiplyScalar(0.5))
    const dir = to.clone().sub(from)
    band.scale.y = dir.length()
    band.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    head.add(band)
  }

  // ---- pop filter -----------------------------------------------------
  const goosePts = [
    new THREE.Vector3(0.02, 0.05 + poleH * 0.62, 0.03),
    new THREE.Vector3(0.05, 0.05 + poleH * 0.74, 0.16),
    new THREE.Vector3(0.04, 0.05 + poleH * 0.9, 0.3),
    new THREE.Vector3(0.0, 0.05 + poleH + 0.0, 0.33),
  ]
  const goose = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(goosePts), 40, 0.01, 10),
    matPlastic,
  )
  group.add(goose)

  const popPos = new THREE.Vector3(0, 0.05 + poleH + 0.02, 0.34)
  const popRing = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.009, 14, 56), matPlastic)
  popRing.position.copy(popPos)
  group.add(popRing)
  const popScreen = new THREE.Mesh(new THREE.CircleGeometry(0.128, 56), popMesh())
  popScreen.position.copy(popPos)
  group.add(popScreen)

  // ---- cable draping to the floor ------------------------------------
  const cablePts = [
    new THREE.Vector3(0, 0.05 + poleH + 0.0, -0.04),
    new THREE.Vector3(-0.05, 0.05 + poleH * 0.55, -0.06),
    new THREE.Vector3(0.08, 0.05 + poleH * 0.2, -0.02),
    new THREE.Vector3(0.18, 0.03, 0.1),
    new THREE.Vector3(0.5, 0.02, 0.25),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 60, 0.012, 10),
    plastic('#0c0c0f', 0.55),
  )
  cable.castShadow = true
  group.add(cable)

  return { group, led: ledMat }
}
