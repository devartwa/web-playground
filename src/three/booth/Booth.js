import * as THREE from 'three/webgpu'
import { pass, positionWorld, color, mix, smoothstep, vec2 } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'

import { studio } from '../../lib/studio'
import { buildEnvironment } from './env'
import { buildRoom } from './room'
import { buildFoamRoom } from './foam'
import { buildMicrophone } from './microphone'
import { buildHeadphones } from './headphones'
import { buildOnAir } from './onair'
import { buildEq } from './eq'
import { buildLights } from './lights'
import { buildMotes } from './motes'

const lerp = THREE.MathUtils.lerp
const damp = (a, b, l, dt) => lerp(a, b, 1 - Math.exp(-l * dt))

const INK = '#05060a'

// Imperative owner of the WebGPU booth. React just hands it a canvas; the booth
// reads the shared `studio` control surface every frame and eases its lights,
// sign and meter toward that state.
export default class Booth {
  constructor(canvas) {
    this.canvas = canvas
    this.clock = new THREE.Clock()
    this.pointer = new THREE.Vector2(0, 0)
    this.smoothPointer = new THREE.Vector2(0, 0)
    this.ready = false
    this.disposed = false
    // eased control values, primed to the studio defaults
    this.ease = { stage: 1, record: 1, gain: 0.7 }
  }

  async init({ onReady } = {}) {
    // Size the canvas drawing buffer BEFORE the GL context is created. Some
    // drivers won't reallocate the default framebuffer when the canvas resizes
    // after creation, leaving a 0×0 buffer that renders nothing.
    {
      const rect = this.canvas.getBoundingClientRect()
      const pr = Math.min(window.devicePixelRatio || 1, 2)
      this.canvas.width = Math.max(1, Math.floor((rect.width || window.innerWidth) * pr))
      this.canvas.height = Math.max(1, Math.floor((rect.height || window.innerHeight) * pr))
    }

    const renderer = new THREE.WebGPURenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer = renderer

    await renderer.init()
    this._resize()

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(INK)
    scene.fog = new THREE.FogExp2(INK, 0.072)
    this.scene = scene

    const camera = new THREE.PerspectiveCamera(40, this._aspect(), 0.1, 100)
    this.basePos = new THREE.Vector3(0.32, 1.5, 2.5)
    this.lookAt = new THREE.Vector3(0, 1.5, -0.05)
    camera.position.copy(this.basePos)
    camera.lookAt(this.lookAt)
    this.camera = camera

    // Enclosing backdrop paints the background with a graded darkness and a soft
    // pool behind the mic — also robust on backends that ignore the clear colour.
    const backMat = new THREE.MeshBasicNodeMaterial()
    const yy = positionWorld.y.mul(0.06).add(0.5).clamp(0, 1)
    const pool = smoothstep(8, 0, positionWorld.xy.sub(vec2(0, 1.4)).length()).mul(0.5)
    backMat.colorNode = mix(color('#04050a'), color('#0e1018'), yy).add(color('#171a2b').mul(pool))
    backMat.side = THREE.BackSide
    backMat.fog = false
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(60, 40, 24), backMat))

    // studio reflections for the metal and chrome
    this.envRT = buildEnvironment(renderer, scene)

    // Build the set, isolating failures so one broken prop can't blank the room.
    const add = (label, fn) => {
      try {
        return fn()
      } catch (e) {
        console.error(`[EchoRoom] failed to build ${label}:`, e)
        return null
      }
    }

    this.lights = add('lights', buildLights)
    if (this.lights) scene.add(this.lights.group)

    const room = add('room', () => buildRoom())
    if (room) scene.add(room)

    const foam = add('foam', () => buildFoamRoom())
    if (foam) scene.add(foam)

    const mic = add('microphone', buildMicrophone)
    if (mic) scene.add(mic.group)

    const phones = add('headphones', () => {
      const g = buildHeadphones()
      g.position.set(0, 1.0, 0.02)
      g.rotation.set(0.18, 0.5, 0.04)
      return g
    })
    if (phones) scene.add(phones)

    this.onair = add('onair', buildOnAir)
    if (this.onair) {
      this.onair.group.position.set(0.05, 3.02, -2.85)
      this.onair.group.rotation.y = 0.04
      this.onair.group.scale.setScalar(0.72)
      scene.add(this.onair.group)
    }

    this.eq = add('eq', () => buildEq())
    if (this.eq) {
      this.eq.group.position.set(0, 0.62, 0.62)
      scene.add(this.eq.group)
    }

    const motes = add('motes', () => buildMotes())
    if (motes) scene.add(motes)

    this._setupPost()

    renderer.setAnimationLoop(() => this._frame())
    this._onReady = onReady
  }

  _setupPost() {
    try {
      const post = new THREE.PostProcessing(this.renderer)
      const scenePass = pass(this.scene, this.camera)
      const col = scenePass.getTextureNode()
      // threshold keeps the bloom on emissive signs, lights and highlights
      post.outputNode = col.add(bloom(col, 0.6, 0.6, 0.82))
      this.post = post
    } catch (e) {
      console.error('[EchoRoom] post-processing failed, rendering direct:', e)
      this.post = null
    }
  }

  _frame() {
    if (this.disposed) return
    const dt = Math.min(0.05, this.clock.getDelta())
    const t = this.clock.elapsedTime

    // ---- ease the shared control state toward the UI ----
    const s = studio.get()
    const gainTarget = studio.audienceLevel() * 0.6 + (s.backingTrack ? 0.55 : 0.2)
    this.ease.stage = damp(this.ease.stage, s.stageLights ? 1 : 0, 4, dt)
    this.ease.record = damp(this.ease.record, s.recording ? 1 : 0, 5, dt)
    this.ease.gain = damp(this.ease.gain, gainTarget, 3, dt)

    if (this.lights) {
      this.lights.applyStage(this.ease.stage)
      this.lights.applyRecord(this.ease.record)
    }
    if (this.onair) {
      const target = s.recording ? 2.6 : 0.45
      this.onair._intensity.value = damp(this.onair._intensity.value, target, 6, dt)
    }
    if (this.eq) this.eq.update(t, this.ease.gain)

    // ---- cinematic camera: pointer parallax + slow idle breath ----
    this.smoothPointer.x = damp(this.smoothPointer.x, this.pointer.x, 3, dt)
    this.smoothPointer.y = damp(this.smoothPointer.y, this.pointer.y, 3, dt)
    const px = this.smoothPointer.x
    const py = this.smoothPointer.y
    this.camera.position.x = damp(this.camera.position.x, this.basePos.x + px * 0.5 + Math.sin(t * 0.25) * 0.04, 4, dt)
    this.camera.position.y = damp(this.camera.position.y, this.basePos.y - py * 0.28 + Math.sin(t * 0.32) * 0.025, 4, dt)
    this.camera.position.z = this.basePos.z
    this.camera.lookAt(this.lookAt.x + px * 0.12, this.lookAt.y - py * 0.06, this.lookAt.z)

    // ---- render ----
    const done = () => {
      if (!this.ready) {
        this.ready = true
        this._onReady?.()
      }
    }
    const onErr = (e) => {
      if (!this._loggedErr) {
        this._loggedErr = true
        console.error('[EchoRoom] render error:', e?.stack || e)
      }
      done()
    }
    const p = this.post ? this.post.renderAsync() : this.renderer.renderAsync(this.scene, this.camera)
    p.then(done).catch(onErr)
  }

  setPointer(x, y) {
    this.pointer.set(x, y)
  }

  _aspect() {
    const r = this.canvas.getBoundingClientRect()
    return (r.width || window.innerWidth) / (r.height || window.innerHeight)
  }

  _resize() {
    const r = this.canvas.getBoundingClientRect()
    const w = Math.round(r.width || window.innerWidth)
    const h = Math.round(r.height || window.innerHeight)
    // Only touch the drawing buffer when the size actually changes — needlessly
    // re-assigning canvas.width can reset the buffer to 0 on some GL backends.
    if (w !== this._lastW || h !== this._lastH) {
      this._lastW = w
      this._lastH = h
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      this.renderer.setSize(w, h, false)
    }
    if (this.camera) {
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
    }
  }

  resize() {
    if (this.renderer) this._resize()
  }

  dispose() {
    this.disposed = true
    if (this.renderer) this.renderer.setAnimationLoop(null)
    if (this.scene) {
      this.scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose?.()
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          mats.forEach((m) => m.dispose?.())
        }
      })
    }
    this.envRT?.dispose?.()
    this.renderer?.dispose?.()
  }
}
