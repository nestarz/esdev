#!/usr/bin/env node
import path from "path";

import serve from "./src/serve.js";
import build from "./src/build.js";

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
      inputGlob = path.join(path.resolve(), "./src/"),
      transformers = {
        jsx: (jsx) => esbuildTransform(jsx, "jsx"),
        tsx: (tsx) => esbuildTransform(tsx, "tsx"),
        ts: (ts) => esbuildTransform(ts, "ts"),
      },
    } = {}) => {
      const [command] = process.argv.slice(2);
      const actions = {
        build: () => build({ outputDir, inputGlob, transformers }),
        serve: () => serve({ transformers }),
      };

      if (command in actions) actions[command]();
      else
        throw Error(
          `${command} ¬¬ Supported Commands: ${Object.keys(actions)}`
        );
    }
  );
