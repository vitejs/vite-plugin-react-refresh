import { Resolver } from 'vite'
import path from 'path'

export const resolver: Resolver = {
  alias(id) {
    if (/^(@pika\/)?react(-dom)?$/.test(id)) {
      if (process.env.NODE_ENV !== 'production') {
        id += '/source.development.js'
      }
      return path.join(
        process.cwd(),
        'node_modules',
        id.replace(/^(@pika\/)?/, '@pika' + path.sep)
      )
    }
  }
}
