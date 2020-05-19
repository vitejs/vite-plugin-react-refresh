import { resolver } from './resolver'
import { reactRefreshServerPlugin } from './serverPlugin'
import { reactRefreshTransform } from './transform'

module.exports = {
  resolvers: [resolver],
  configureServer: reactRefreshServerPlugin,
  transforms: [reactRefreshTransform]
}
