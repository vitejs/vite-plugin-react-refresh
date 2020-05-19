# vite-plugin-react

Provides React Fast Refresh support for Vite.

Note: Vite requires using `@pika/react` and `@pika/react-dom` which are ESM mirrors of the official React packages. This plugin automatically injects the correct alias for you so you can just `import React from 'react'` as usual.

This plugin is included by default in the [create-vite-app](https://github.com/vitejs/create-vite-app) React template.

``` js
// vite.config.js
module.exports = {
  jsx: 'react',
  plugins: [require('vite-plugin-react')]
}
```
