# With react router

## Summary

By default, Vite doesn't accept route like `/projects` (it will return 404), so we need to custom the vite server to:
* Detect that the path is resource, continue to serve the resource
* Otherwise, serve the index page

## Getting started

`yarn dev`

Actually it will run `node server.js` instead of `vite serve src`

Everything should work normally
