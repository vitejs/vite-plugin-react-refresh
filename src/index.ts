import type { Plugin } from 'vite'
import { resolver } from './resolver'
import { reactRefreshServerPlugin } from './serverPlugin'
import { reactRefreshTransform } from './transform'

const plugin: Plugin = {
  resolvers: [resolver],
  configureServer: reactRefreshServerPlugin,
  transforms: [reactRefreshTransform]
}

export = plugin
