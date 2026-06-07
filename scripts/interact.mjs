import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
chromium.setGraphicsMode = true
const b = await puppeteer.launch({ args:[...chromium.args,'--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist'], executablePath: await chromium.executablePath(), headless: chromium.headless, defaultViewport:{width:1440,height:900,deviceScaleFactor:1} })
const pg = await b.newPage()
await pg.evaluateOnNewDocument(() => {
  try { Object.defineProperty(navigator,'gpu',{value:undefined,configurable:true}) } catch(_){}
  const K=['EXT_color_buffer_float','EXT_color_buffer_half_float','OES_texture_float_linear','OES_texture_half_float_linear','EXT_float_blend','WEBGL_debug_renderer_info','WEBGL_lose_context','KHR_parallel_shader_compile']
  const w=p=>{if(!p)return;const gp=p.getParameter;p.getParameter=function(x){const v=gp.call(this,x);if(v===null&&(x===this.VIEWPORT||x===this.SCISSOR_BOX))return new Int32Array([0,0,this.drawingBufferWidth||300,this.drawingBufferHeight||150]);return v};const ge=p.getSupportedExtensions;p.getSupportedExtensions=function(){const l=ge.call(this);if(l)return l;return K.filter(n=>{try{return!!this.getExtension(n)}catch(_){return false}})}}
  w(window.WebGL2RenderingContext&&WebGL2RenderingContext.prototype);w(window.WebGLRenderingContext&&WebGLRenderingContext.prototype)
})
await pg.goto('http://localhost:5173/', { waitUntil:'networkidle2', timeout:30000 })
await new Promise(r=>setTimeout(r,5000))
// toggle stage lighting OFF and record OFF
await pg.click('[title="Stage lighting"]').catch(()=>{})
await pg.click('[aria-pressed][title="Stop recording"], .ctrl--rec').catch(()=>{})
// also pick Solo audience
await new Promise(r=>setTimeout(r,2500))
await pg.screenshot({ path:'/tmp/interact_off.png' })
console.log('interaction captured')
await b.close()
