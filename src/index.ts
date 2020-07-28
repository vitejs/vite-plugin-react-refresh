import { resolver } from './resolver'
import { reactRefreshServerPlugin } from './serverPlugin'
import { reactRefreshTransform } from './transform'

module.exports = ({ babelPlugins }: { babelPlugins: any[] }) => ({
  resolvers: [resolver],
  configureServer: reactRefreshServerPlugin,
  transforms: [reactRefreshTransform(babelPlugins)]
})
