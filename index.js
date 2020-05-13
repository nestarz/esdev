#!/usr/bin/env node
import path from "path";
import { promises as fs } from "fs";

import serve from "./src/serve.js";
import build from "./src/build.js";
import watch from "./src/watch.js";

import defaultVueTransformer from "./src/transformers/vue/vue.js";
import defaultTsxTransformer from "./src/transformers/ts-jsx-tsx/ts-jsx-tsx.js";

const esdevConfigPath = path.join(path.resolve(), "esdev.config.js");

new Promise((r) => fs.access(esdevConfigPath, fs.F_OK, (e) => r(!e)))
  .catch(() => {})
  .then(async () => (await import(esdevConfigPath)).default)
  .then(
    async ({
      outputDir = path.join(path.resolve(), "./build/"),
      inputDir = path.join(path.resolve(), "./"),
      transformers: inputTransformers = {},
    } = {}) => {
      const transformers = {
        ...defaultTsxTransformer,
        ...defaultVueTransformer,
        ...inputTransformers,
      };
      console.log(transformers);
      const [command] = process.argv.slice(2);
      const actions = {
        watch: () =>
          watch({ inputDir, outputDir }, (event, file) => {
            const fileExtension = path.extname(file).substring(1);
            if (fileExtension in transformers) {
              build({ outputDir, inputDir, transformers }).then(() =>
                console.log("Build Succeed. Ok.")
              );
            }
          }),
        build: () =>
          build({ outputDir, inputDir, transformers }).then(() =>
            console.log(
              "Succeed.\n\nDon't forget to add to your index.html file this line:" +
                `\n<script type="importmap" src="${path.join(
                  path.relative(path.resolve(), outputDir),
                  "build-import-map.json"
                )}"></script>`
            )
          ),
        serve: () => serve({ transformers }),
      };

      if (command in actions) {
        return actions[command]();
      } else
        throw Error(
          `${command} ¬¬ Supported Commands: ${Object.keys(actions)}`
        );
    }
  )
  .catch((err) => console.error(err));
