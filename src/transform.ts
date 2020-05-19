import { runtimePublicPath } from './serverPlugin'
import { Transform } from 'vite'

const pre = `
import RefreshRuntime from "${runtimePublicPath}"
import { hot } from "vite/hmr"

let prevRefreshReg
let prevRefreshSig

if (__DEV__) {
  prevRefreshReg = window.$RefreshReg$
  prevRefreshSig = window.$RefreshSig$
  window.$RefreshReg$ = (type, id) => {
    RefreshRuntime.register(type, __PATH__ + ' ' + id)
  }
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform
}
`

const post = `
if (__DEV__) {
  window.$RefreshReg$ = prevRefreshReg
  window.$RefreshSig$ = prevRefreshSig

  hot.accept()
  RefreshRuntime.performReactRefresh()
}
`

export const reactRefreshTransform: Transform = {
  test: (path) => /\.(t|j)sx$/.test(path),
  transform: (code, _, isBuild, path) => {
    if (process.env.NODE_ENV === 'production' || isBuild) {
      // do not transform for production builds
      return code
    }
    const result = require('@babel/core').transformSync(code, {
      plugins: [require('react-refresh/babel')]
    })
    return pre.replace(`__PATH__`, JSON.stringify(path)) + result.code + post
  }
}
