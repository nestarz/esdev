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

```html
<script type="module-shim" src="build/fetchReplace.js"></script>
```
