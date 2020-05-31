import { runtimePublicPath } from './serverPlugin'
import { Transform, resolveConfig } from 'vite'

export const reactRefreshTransform: Transform = {
  test: (path) => /\.(t|j)sx?$/.test(path),
  transform: async (code, _, isBuild, path) => {
    if (
      isBuild ||
      path.startsWith(`/@modules/`) ||
      process.env.NODE_ENV === 'production'
    ) {
      // do not transform for production builds
      return code
    }

    const mode = isBuild ? 'production' : 'development'

    const config = await resolveConfig(mode)
    const sourcemap = mode == 'development' && (config?.sourcemap || false)

    return transformReactCode(code, path, sourcemap)
  }
}

/**
 * Transform React code to inject hmr ability.
 * Help tools that generate react code (.e.g mdx) to support hmr.
 */
export const transformReactCode = (
  code: string,
  path: string,
  sourcemap: boolean
) => {
  const result = require('@babel/core').transformSync(code, {
    plugins: [require('react-refresh/babel')],
    sourceMaps: sourcemap ? 'inline' : false
  })

  if (!/\$RefreshReg\$\(/.test(result.code)) {
    // no component detected in the file
    return code
  }

  const header = `
import RefreshRuntime from "${runtimePublicPath}";

let prevRefreshReg;
let prevRefreshSig;

if (!window.__vite_plugin_react_preamble_installed__) {
  throw new Error(
    "vite-plugin-react can't detect preamble. Something is wrong. See https://github.com/vitejs/vite-plugin-react/pull/11#discussion_r430879201"
  );
}

if (import.meta.hot) {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    RefreshRuntime.register(type, ${JSON.stringify(path)} + " " + id)
  };
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
`

  const footer = `
if (import.meta.hot) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;

  import.meta.hot.accept();
  RefreshRuntime.performReactRefresh();
}
`

  if (sourcemap) {
    return (
      header.replace(/[\n]+/gm, '') +
      result.code +
      '\n' +
      footer.replace(/[\n]+/gm, '')
    )
  }

  return `${header}${result.code}${footer}`
}
