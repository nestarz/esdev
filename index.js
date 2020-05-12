#!/usr/bin/env node
import path from "path";

import serve from "./src/serve.js";
import build from "./src/build.js";
import watch from "./src/watch.js";

const esbuildTransform = async (string, loader) => {
  const esbuild = (await import("esbuild")).default;
  const service = await esbuild.startService();
  const { js } = await service.transform(string, { loader });
  service.stop();
  return { body: js, "Content-Type": "application/javascript" };
};

import(path.join(path.resolve(), "esdev.config.js"))
  .then((module) => module.default)
  .catch(() => {})
  .then(
    async ({
      outputDir = path.join(path.resolve(), "./build/"),
      inputDir = path.join(path.resolve(), "./"),
      transformers = {
        jsx: (jsx) => esbuildTransform(jsx, "jsx"),
        tsx: (tsx) => esbuildTransform(tsx, "tsx"),
        ts: (ts) => esbuildTransform(ts, "ts"),
      },
    } = {}) => {
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
  );
