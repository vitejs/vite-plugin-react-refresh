import { runtimePublicPath } from './serverPlugin'
import { Transform } from 'vite'

export const reactRefreshTransform: Transform = {
  test: (path) => /\.(t|j)sx?$/.test(path),
  transform: (code, _, isBuild, path) => {
    if (isBuild || process.env.NODE_ENV === 'production') {
      // do not transform for production builds
      return code
    }
    if (path.startsWith(`/@modules/`) && path.endsWith('.js')) {
      // for files imported as modules, only transform jsx/tsx
      // to avoid the babel call on heavy dependencies.
      return code
    }
    return transformReactCode(code, path)
  }
}

/**
 * Transform React code to inject hmr ability.
 * Help tools that generate react code (.e.g mdx) to support hmr.
 */
export const transformReactCode = (code: string, path: string) => {
  const result = require('@babel/core').transformSync(code, {
    plugins: [require('react-refresh/babel')]
  })

  if (!/\$RefreshReg\$\(/.test(result.code)) {
    // no component detected in the file
    return code
  }

  return `
import RefreshRuntime from "${runtimePublicPath}"

let prevRefreshReg
let prevRefreshSig

if (!window.__vite_plugin_react_preamble_installed__) {
  throw new Error(
    "vite-plugin-react can't detect preamble. Something is wrong. See https://github.com/vitejs/vite-plugin-react/pull/11#discussion_r430879201"
  )
}

if (import.meta.hot) {
  prevRefreshReg = window.$RefreshReg$
  prevRefreshSig = window.$RefreshSig$
  window.$RefreshReg$ = (type, id) => {
    RefreshRuntime.register(type, ${JSON.stringify(path)} + " " + id)
  }
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform
}

${result.code}

if (import.meta.hot) {
  window.$RefreshReg$ = prevRefreshReg
  window.$RefreshSig$ = prevRefreshSig

  import.meta.hot.accept()
  RefreshRuntime.performReactRefresh()
}
`
}
