# esdev

Process to transform files and serve them compiled, that's all.
The rest is up to you.

## Information

This library add a Service Worker at the root of your app. It is used to intercept calls to files that have been transformed and send instead the transformed version. I'm very interesting to know if there is other way to acheive the intercept without a Service Worker put at the root of the app.

## Motivation
There is no simple tooling to transform files and make them work with a native feeling. The interceptor is used to give the feeling any transformation is native. The library consist of a transformer and interceptor process.

## Use

1. Install
```bash
yarn add esdev -D
```

2. Create `esdev.config.json` at the root of your project (same as `index.html`).

Here an example of `esdev.config.json` that declare transformers for JSX and Typescript files:
```js
const esbuildTransform = async (jsx, loader) => {
  const esbuild = (await import("esbuild")).default;
  const service = await esbuild.startService();
  const { js } = await service.transform(jsx, { loader });
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

3. Build. It will transform files using the transformers you declared in your `esdev.config.json` file.
```
./node_modules/.bin/esdev-build
```

4. Intercept non-native files

Add this line to your `index.html` file. It's a Service Worker that intercept all request to files with transformers available and send the transformed version stored in the `outputDir` directory.
```html
<script type="module" src="esdev.interceptor.register.js"></script>
```

5. (Optional) Serve
```
./node_modules/.bin/esdev-serve
```

## Config API
You must create a `esdev.config.js` file at the root of your project (same as `index.html`).
```js
module.exports = {
  outputDir: "./build/",   // Where to store the compiled native files and the interceptor script
  inputGlob: "./src/**/*", // Where to apply the transformers
  [EXTENSION_NAME]: (string) => {
    body: [NEW_STRING],
    "Content-Type": [NEW_NATIVE_CONTENT_TYPE]
  },
};
```
