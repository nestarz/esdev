import fs from "fs";
import path from "path";
import glob from "glob";
import transform, { needTransform } from "./transform.js";

const globAll = (src, callback) => glob(src + "/**/*", callback);

const outputDir = "./build/";
const inputDir = "./";

globAll(inputDir, async function (err, res) {
  fs.rmdirSync(outputDir, { recursive: true });
  const map = await Promise.all(
    res.map(async (filePath) => {
      if (!needTransform(filePath)) {
        return;
      }

      const [data, newExt] = await transform(filePath);

      const parsed = path.parse(filePath);
      const newName = [parsed.name, newExt].join(".");
      const newPath = path.join(outputDir, parsed.dir, newName);

      await fs.promises
        .mkdir(path.join(outputDir, parsed.dir), { recursive: true })
        .catch(console.error);

      if (data instanceof fs.ReadStream) {
        console.log(filePath, newPath);
        data.pipe(fs.createWriteStream(newPath));
      } else {
        fs.writeFileSync(newPath, data);
      }

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
  const name = "fetchReplace.js";
  fs.copyFile(
    path.join(path.parse(import.meta.url.replace("file:", "")).dir, name),
    path.join(outputDir, name),
    (msg) => msg && console.log(msg)
  );
});
