import fs from 'fs'
import { ServerPlugin, readBody } from 'vite'

export const runtimePublicPath = '/@react-refresh'

const globalPreamble = `
<script type="module">
import RefreshRuntime from "${runtimePublicPath}"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
</script>
`

function debounce(fn: () => void, delay: number) {
  let handle: any
  return () => {
    clearTimeout(handle)
    handle = setTimeout(fn, delay)
  }
}

export const reactRefreshServerPlugin: ServerPlugin = ({ app }) => {
  const runtimePath = require.resolve(
    'react-refresh/cjs/react-refresh-runtime.development.js'
  )
  // shim the refresh runtime into an ES module
  const runtimeCode = `
const exports = {}
${fs.readFileSync(runtimePath, 'utf-8')}
${debounce.toString()}
exports.performReactRefresh = debounce(exports.performReactRefresh, 16)
export default exports
`

  app.use(async (ctx, next) => {
    // serve react refresh runtime
    if (ctx.path === runtimePublicPath) {
      ctx.type = 'js'
      ctx.status = 200
      ctx.body = runtimeCode
      return
    }

    await next()

    if ((ctx.path.endsWith('/') || ctx.path.endsWith('.html')) && ctx.body) {
      if (typeof ctx.body === 'string') {
        // if the built-in preamble is already injected (pre vite 0.17),
        // inject react-refresh global preamble after the vite built-in preamble
        ctx.body = ctx.body.replace('</script>', '</script>' + globalPreamble)
      } else {
        // Post 0.17 this will be called before the html rewrite from Vite.
        // Just inject before the html, but the html will be strings.
        const html = (await readBody(ctx.body))!
        ctx.body = globalPreamble + html
      }
    }
  })
}
