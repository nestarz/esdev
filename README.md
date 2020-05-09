# esdev

Serve and build TypeScript and JSX files, that's all.
The rest is up to you.

## Requirement
- es-module-shims=^0.4.6

## Use

```bash
yarn add esdev -D
```

```json
"scripts": {
  "dev": "node node_modules/esdev/src/serve.js",
  "build": "node node_modules/esdev/src/build.js"
}
```

Add this line to your `index.html` file. It will intercept all request to non-native files (jsx, ts and tsx) and send the compiled js if it exists in the `build` directory built after `yarn build` use.
```html
<script type="module" src="build/fetchReplace.js"></script>
```
