import { runtimePublicPath } from './serverPlugin'
import { Transform } from 'vite'

export const reactRefreshTransform: Transform = {
  test: (path) => /\.(t|j)sx?$/.test(path),
  transform: (code, _, isBuild, path) => {
    if (
      isBuild ||
      path.startsWith(`/@modules/`) ||
      process.env.NODE_ENV === 'production'
    ) {
      // do not transform for production builds
      return code
    }
    return transformUtil(code, path)
  }
}

/**
 * Help tools that generate react code (.e.g mdx) to support hmr.
 */
export const transformUtil = (code: string, path: string) => {
  const result = require('@babel/core').transformSync(code, {
    plugins: [require('react-refresh/babel')]
  })

  if (!/\$RefreshReg\$\(/.test(result.code)) {
    // no component detected in the file
    return code
  }

  return `
import RefreshRuntime from "${runtimePublicPath}"
import { hot } from "vite/hmr"

let prevRefreshReg
let prevRefreshSig

if (__DEV__) {
prevRefreshReg = window.$RefreshReg$
prevRefreshSig = window.$RefreshSig$
window.$RefreshReg$ = (type, id) => {
  RefreshRuntime.register(type, ${JSON.stringify(path)} + " " + id)
}
window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform
}

${result.code}

if (__DEV__) {
window.$RefreshReg$ = prevRefreshReg
window.$RefreshSig$ = prevRefreshSig

hot.accept()
RefreshRuntime.performReactRefresh()
}
`
}
