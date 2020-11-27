import { reactRefreshServerPlugin } from './serverPlugin'
import { reactRefreshTransform } from './transform'

module.exports = {
  configureServer: reactRefreshServerPlugin,
  transforms: [reactRefreshTransform]
}
