import fs from 'fs'
import { ServerPlugin, readBody } from 'vite'

export const runtimePublicPath = '/@react-refresh'

const globalPreamble = `
<script type="module">
import RefreshRuntime from "${runtimePublicPath}"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
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

    if (ctx.response && ctx.response.type === 'text/html' && ctx.body) {
      const html = (await readBody(ctx.body))!
      ctx.body = globalPreamble + html
    }
  })
}
