import fs from 'fs'
import { ServerPlugin } from 'vite'

export const runtimePublicPath = '/@react-refresh'

const globalPreamble = `
<script type="module">
import RefreshRuntime from "${runtimePublicPath}"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
</script>
`

export const reactRefreshServerPlugin: ServerPlugin = ({ app }) => {
  const runtimePath = require.resolve(
    'react-refresh/cjs/react-refresh-runtime.development.js'
  )
  const runtimeCode =
    `const exports = {}\n` +
    fs.readFileSync(runtimePath, 'utf-8') +
    `\nexport default exports`

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
      // inject global preamble
      ctx.body = globalPreamble + ctx.body
    }
  })
}
