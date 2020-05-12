# esdev

Tiny process to transform files and serve them transformed, that's all.
The rest is up to you. 

```bash
yarn add esdev -D
```

- Default support to Typescript and JSX files. Ready to use out-of-the-box.
- Small footprint. Esdev only relies on **two** packages, `acorn` and `mime`, with `esbuild` as the default transformer.
- No need to serve the `build` folder. Everything works from the root of your package.
- Extendable. Use your own transformers. Your own serve tool, your own minifier... No lock-in at all !
- Rely on the Modern Web specification, from modules to [WICG/import-maps](https://github.com/WICG/import-maps).
- No resolver algorithm. It's handled natively by the browser, **without extra-cost**.

Can be seen as an alternative to [vite](https://github.com/vuejs/vite) or [snowpack](https://github.com/pikapkg/snowpack).

## Use

1. Build. Transpilation of files (using registered transformers from `esdev.config.js` or the default ones, see below).

```
esdev build
```
or build on changes:
```
esdev watch
```

2. Add `build-import-map.json` to map original files with transpiled ones.

```html
<script type="module" src="build/build-import-map.json"></script>
```

3. (Optional) Create a server with automatic transpilation of files and serve them.

```
esdev serve
```

## Config API

A `esdev.config.js` file at the root of your project (same directory as `index.html`) is used to configure the transformers and other esdev options.

```js
module.exports = {
  outputDir: "./build/",   // Where to store the compiled native files and the build import-map
  inputDir: "./src/", // Where to apply the transformers
  transformers: {
    [EXTENSION_NAME]: (string) => {
      body: [NEW_STRING],
      "Content-Type": [NEW_NATIVE_CONTENT_TYPE] // Must be a Content-Type known by the browser
    },
  }
};
```

Below the default `esdev.config.js`, it registers transformers for JSX and Typescript files using `esbuild`:

```js
const esbuildTransform = async (string, loader) => {
  const esbuild = (await import("esbuild")).default;
  const service = await esbuild.startService();
  const { js } = await service.transform(string, { loader });
  service.stop();
  return { body: js, "Content-Type": "application/javascript" };
};

module.exports = {
  outputDir: "./build/",
  inputGlob: "./src/**/*",
  jsx: (jsx) => esbuildTransform(jsx, "jsx"),
  tsx: (tsx) => esbuildTransform(tsx, "tsx"),
  ts: (ts) => esbuildTransform(ts, "ts"),
};
```

## Import Maps

For now you may need to polyfill the [WICG/import-maps](https://github.com/WICG/import-maps) spec.
You can add the `es-module-shims` polyfill using the [Heritage](https://github.com/nestarz/heritage) package manager, using Snowpack or via the CDN.

```bash
heritage add es-module-shims
```

```html
<script defer src="web_modules/es-module-shims/0.4.6/es-module-shims.js"></script>
<script type="importmap-shim" src="build/build-import-map.json"></script>
<script type="module-shim">
  import App from "./index.tsx";
</script>
```

That's all.

## Information

To have the command `esdev` available you need to have `yarn bin`or `npm bin` in your `PATH` like so:

```
export PATH=$(yarn bin):$PATH
```

Otherwise you need to use this command `./node_modules/.bin/esdev` from the root of your package.
