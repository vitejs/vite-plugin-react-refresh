import { Resolver } from 'vite'

export const resolver: Resolver = {
  alias(id) {
    const isProd = process.env.NODE_ENV === 'production'
    if (id === 'react') {
      return isProd ? '@pika/react' : '@pika/react/source.development.js'
    }
    if (id === 'react-dom') {
      return isProd
        ? '@pika/react-dom'
        : '@pika/react-dom/source.development.js'
    }
  }
}
