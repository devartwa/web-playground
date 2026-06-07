import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// EchoRoom renders with three's WebGPU build (`three/webgpu`) and authors all
// materials in TSL (`three/tsl`). Both the renderer and the TSL post-processing
// addons resolve against the same `three/webgpu` core, so we only need to dedupe
// three to guarantee a single module instance (no split node systems).
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['three'],
  },
  // Don't let esbuild pre-bundle three's WebGPU/TSL builds — the bundled form
  // can misbehave under software GL backends. Serve them as native ESM.
  optimizeDeps: {
    exclude: ['three'],
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'esnext', // WebGPU + top-level await in the renderer init path
    chunkSizeWarningLimit: 2000,
  },
})
