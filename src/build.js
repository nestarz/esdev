import fs from "fs";
import path from "path";
import glob from "glob";
import transform from "./transform.js";

const globAll = (src, callback) => glob(src + "/**/*", callback);

const output = "./dist/";
const input = "./";

const is_dir = async (pathName) =>
  (await fs.promises.lstat(pathName)).isDirectory();

globAll(input, async function (err, res) {
  fs.rmdirSync(output, { recursive: true });
  res.forEach(async (filePath) => {
    const parsed = path.parse(filePath);
    if (await is_dir(filePath).catch()) return;
    const [data, extname] = await transform(filePath);
    const newName = [parsed.name, extname].join(".");
    const newPath = path.join(output, parsed.dir, newName);

    await fs.promises
      .mkdir(path.join(output, parsed.dir), { recursive: true })
      .catch(console.error);

    if (data instanceof fs.ReadStream) {
      console.log(filePath, newPath);
      data.pipe(fs.createWriteStream(newPath));
    } else {
      fs.writeFileSync(newPath, data);
    }
  });
});
