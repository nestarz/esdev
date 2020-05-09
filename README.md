# esdev

Serve and build TypeScript and JSX files, that's all.
The rest is up to you.

## Requirement
- es-module-shims=^0.4.6

## Use

1. Install
```bash
yarn add esdev -D
```

2. Create esdev.config.json, here an example
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

3. Build
```
./node_modules/.bin/esdev-build
```

4. Intercept non-native files
Add this line to your `index.html` file. It will intercept all request to non-native files (jsx, ts and tsx) and send the compiled js if it exists in the `build` directory built after `yarn build` use.
```html
<script type="module" src="build/fetchReplace.js"></script>
```

5. (Optional) Serve
```
./node_modules/.bin/esdev-serve
```