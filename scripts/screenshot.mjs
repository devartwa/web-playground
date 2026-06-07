import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

const url = process.argv[2] || 'http://localhost:5173/'
const out = process.argv[3] || '/tmp/shot.png'
const W = +(process.argv[4] || 1440)
const H = +(process.argv[5] || 900)
const wait = +(process.argv[6] || 6500)

// Enable the GPU path so WebGL works via SwiftShader (instead of --disable-gpu).
chromium.setGraphicsMode = true

const extra = (
  process.env.GLFLAGS ||
  '--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader --ignore-gpu-blocklist --enable-webgl'
)
  .split(' ')
  .concat([`--window-size=${W},${H}`])

const browser = await puppeteer.launch({
  args: [...chromium.args, ...extra],
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
  defaultViewport: { width: W, height: H, deviceScaleFactor: +(process.env.DSF||1) },
})

const page = await browser.newPage()

// Test-only shim: this ANGLE/SwiftShader build returns null for VIEWPORT and
// SCISSOR_BOX, which trips three's WebGLBackend init. Real browsers return
// proper arrays, so we patch the headless context here rather than the app.
await page.evaluateOnNewDocument(() => {
  // Hide WebGPU: under headless SwiftShader the failed WebGPU adapter probe
  // poisons the canvas, so three's WebGL2 fallback context is born lost. With
  // navigator.gpu absent, three creates a clean WebGL2 context (exactly what a
  // no-WebGPU browser does). Verification-only; real browsers are unaffected.
  try {
    Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true })
  } catch (_) {}

  const KNOWN = [
    'EXT_color_buffer_float', 'EXT_color_buffer_half_float', 'OES_texture_float_linear',
    'OES_texture_half_float_linear', 'EXT_float_blend', 'EXT_texture_filter_anisotropic',
    'WEBGL_debug_renderer_info', 'WEBGL_lose_context', 'KHR_parallel_shader_compile',
    'WEBGL_multisampled_render_to_texture', 'OVR_multiview2', 'EXT_disjoint_timer_query_webgl2',
  ]
  const wrap = (proto) => {
    if (!proto) return
    const getParam = proto.getParameter
    proto.getParameter = function (p) {
      const v = getParam.call(this, p)
      if (v === null && (p === this.VIEWPORT || p === this.SCISSOR_BOX)) {
        return new Int32Array([0, 0, this.drawingBufferWidth || 300, this.drawingBufferHeight || 150])
      }
      return v
    }
    const getExts = proto.getSupportedExtensions
    proto.getSupportedExtensions = function () {
      const list = getExts.call(this)
      if (list) return list
      // driver returned null — rebuild by probing a known set
      return KNOWN.filter((n) => {
        try {
          return !!this.getExtension(n)
        } catch (_) {
          return false
        }
      })
    }
  }
  wrap(window.WebGL2RenderingContext && WebGL2RenderingContext.prototype)
  wrap(window.WebGLRenderingContext && WebGLRenderingContext.prototype)
})

const logs = []
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))

await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise((r) => setTimeout(r, wait))
await page.screenshot({ path: out })

const info = await page.evaluate(() => {
  const c = document.createElement('canvas')
  const gl = c.getContext('webgl2') || c.getContext('webgl')
  let r = 'no-gl'
  if (gl) {
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    r = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.VERSION)
  }
  return { gl: r, webgpu: !!navigator.gpu }
})

console.log('--- gfx ---')
console.log(JSON.stringify(info))
console.log('--- console (' + logs.length + ') ---')
console.log(logs.join('\n'))
await browser.close()
console.log('saved', out)
