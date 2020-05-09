#!/usr/bin/env node
import fs from "fs";
import path from "path";
import glob from "glob";
import transform, { needTransform } from "./transform.js";
import getEsdevConfig from "./config.js";

(async () => {
  const { outputDir, inputGlob } = await getEsdevConfig();

  glob(inputGlob, async (err, res) => {
    fs.rmdirSync(outputDir, { recursive: true });
    const map = await Promise.all(
      res.map(async (filePath) => {
        if (!await needTransform(filePath)) {
          return;
        }
  
        const {body, extension} = await transform(filePath);
  
        const parsed = path.parse(filePath);
        const newName = [parsed.name, extension].join(".");
        const newPath = path.join(outputDir, parsed.dir, newName);
  
        await fs.promises
          .mkdir(path.join(outputDir, parsed.dir), { recursive: true })
          .catch(console.error);
  
        fs.writeFileSync(newPath, body);
        
        return [filePath, "./" + newPath];
      })
    );
  
    await fs.promises.mkdir(outputDir, { recursive: true }).catch(console.error);
    fs.writeFileSync(
      path.join(outputDir, "import-map.json"),
      JSON.stringify({
        imports: {
          ...Object.fromEntries(map.filter((v) => v)),
        },
      })
    );
    const name = "esdev-interceptor.js";
    fs.copyFile(
      path.join(path.parse(import.meta.url.replace("file:", "")).dir, name),
      path.join(outputDir, name),
      (msg) => msg && console.log(msg)
    );
    })
})();