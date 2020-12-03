import { Plugin } from 'vite'
import { reactRefreshServerPlugin } from './serverPlugin'
import { reactRefreshTransform } from './transform'

const plugin: Plugin = {
  configureServer: reactRefreshServerPlugin,
  transforms: [reactRefreshTransform]
}

export = plugin
