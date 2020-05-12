#!/usr/bin/env node
import path from "path";

import serve from "./src/serve.js";
import build from "./src/build.js";

import(path.join(path.resolve(), "esdev.config.js"))
  .then((module) => module.default)
  .then(
    async ({
      outputDir = path.join(path.resolve(), "./build/"),
      inputGlob = path.join(path.resolve(), "./src/"),
      ...transformers
    }) => {
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
