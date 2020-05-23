/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const { createServer } = require("vite");
const reactResolver = require("vite-plugin-react/dist/resolver");
const reactServerPlugin = require("vite-plugin-react/dist/serverPlugin");
const reactTransform = require("vite-plugin-react/dist/transform");

const whitelist = /^\/@modules|^\/vite|\.(j|t)sx?$|\.s?css$/;
const isResource = (p) => whitelist.test(p);

const myPlugin = ({ app }) => {
  app.use(async (ctx, next) => {
    if (!isResource(ctx.request.path)) {
      ctx.request.path = "/";
    }
    await next();
  });
};

createServer({
  jsx: 'react',
  root: path.resolve(process.cwd(), "./src"),
  configureServer: [reactServerPlugin.reactRefreshServerPlugin, myPlugin],
  resolvers: [reactResolver.resolver],
  transforms: [reactTransform.reactRefreshTransform],
}).listen(3000);
