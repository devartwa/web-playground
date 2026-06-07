import { useSyncExternalStore } from 'react'

// A tiny shared control surface that bridges the React UI and the imperative
// WebGPU booth. The UI mutates it on interaction; the 3D scene subscribes and
// eases its parameters toward the new state every frame. Audience is a 0..1
// "fullness" the scene maps to back-wall glow + ambience.
const AUDIENCE = { solo: 0, small: 0.5, full: 1 }

const state = {
  recording: true,
  stageLights: true,
  backingTrack: false,
  audience: 'full',
}

const listeners = new Set()

export const studio = {
  get: () => state,
  audienceLevel: () => AUDIENCE[state.audience] ?? 1,
  set(patch) {
    Object.assign(state, patch)
    listeners.forEach((l) => l())
  },
  toggle(key) {
    studio.set({ [key]: !state[key] })
  },
  subscribe(l) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

// React binding so UI chrome reflects the same state the scene reads.
export function useStudio() {
  return useSyncExternalStore(studio.subscribe, studio.get)
}
