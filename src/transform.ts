import { runtimePublicPath } from './serverPlugin'
import { Transform } from 'vite'
import {
  File,
  Identifier,
  isIdentifier,
  isVariableDeclaration
} from '@babel/types'

export const reactRefreshTransform: Transform = {
  test: ({ path, isBuild }) => {
    if (!/\.(t|j)sx?$/.test(path)) {
      return false
    }
    if (isBuild || process.env.NODE_ENV === 'production') {
      // do not transform for production builds
      return false
    }
    if (isDependency(path) && !path.endsWith('x')) {
      // do not transform if this is a dep and is not jsx/tsx
      return false
    }
    return true
  },

  transform: ({ code, path }) => {
    const result = require('@babel/core').transformSync(code, {
      plugins: [require('react-refresh/babel')],
      ast: true,
      sourceMaps: true,
      sourceFileName: path
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
  }`.replace(/[\n]+/gm, '')

    const footer = `
  if (import.meta.hot) {
    window.$RefreshReg$ = prevRefreshReg;
    window.$RefreshSig$ = prevRefreshSig;

    ${isRefreshBoundary(result.ast) ? `import.meta.hot.accept();` : ``}
    if (!window.__vite_plugin_react_timeout) {
      window.__vite_plugin_react_timeout = setTimeout(() => {
        window.__vite_plugin_react_timeout = 0;
        RefreshRuntime.performReactRefresh();
      }, 30);
    }
  }`

    return {
      code: `${header}${result.code}${footer}`,
      map: result.map
    }
  }
}

function isDependency(path: string) {
  return path.startsWith(`/@modules/`) || path.includes('node_modules')
}

function isRefreshBoundary(ast: File) {
  // Every export must be a React component.
  return ast.program.body.every((node) => {
    if (node.type !== 'ExportNamedDeclaration') {
      return true
    }
    const { declaration, specifiers } = node
    if (isVariableDeclaration(declaration)) {
      return declaration.declarations.every(({ id }) => {
        return isIdentifier(id) && isComponentishName(id.name)
      })
    }
    return specifiers.every((spec) => {
      return isComponentishName(spec.exported.name)
    })
  })
}

function isComponentishName(name: Identifier) {
  return typeof name === 'string' && name[0] >= 'A' && name[0] <= 'Z'
}
