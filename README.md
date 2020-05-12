# esdev

Process to transform files and serve them transformed, that's all.
The rest is up to you.

## Use

1. Install
```bash
yarn add esdev -D
```

2. Create `esdev.config.json` at the root of your project (same as `index.html`).

Here an example of `esdev.config.json` that declare transformers for JSX and Typescript files using `esbuild`:
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
  // vue: (vue) => ...,
  // sass: (sass) => ...,
};
```

3. Build. Transpilation of files with registered `Transformers` in `esdev.config.json`.
```
esdev build
```

4. Add `build-import-map.json` to map original files with transpiled ones.
```html
<script type="module" src="build/build-import-map.json"></script>
```

5. (Optional) Serve with automatic transpilation of files with registered `Transformer`
```
esdev serve
```

## Config API
You must create a `esdev.config.js` file at the root of your project (same as `index.html`).
```js
module.exports = {
  outputDir: "./build/",   // Where to store the compiled native files and the interceptor map
  inputGlob: "./src/**/*", // Where to apply the transformers
  [EXTENSION_NAME]: (string) => {
    body: [NEW_STRING],
    "Content-Type": [NEW_NATIVE_CONTENT_TYPE] // Must be a Content-Type known by the browser
  },
};
```

6. Optional. For now you may need to polyfill the [WICG/import-maps](https://github.com/WICG/import-maps) spec.
Here a working example:
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

To have the command `heritage` available you need to have `yarn bin`or `npm bin` in your `PATH` like so:
```
export PATH=$(yarn bin):$PATH
```
Otherwise you need to use this command `./node_modules/.bin/heritage` from the root of your package.
