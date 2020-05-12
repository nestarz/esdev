import fs from "fs";
import path from "path";

const getAllDirs = (dir) =>
  fs
    .readdirSync(dir)
    .reduce((files, file) => {
      if (file.startsWith(".") || file.includes("/.")) return files;
      const name = path.join(dir, file);
      const isDirectory = fs.statSync(name).isDirectory();
      return isDirectory ? [...files, name, ...getAllDirs(name)] : [...files];
    }, [])
    .map((file) => path.relative(path.resolve(), file));

const isDirectory = (dir) =>
  fs.promises
    .stat(dir)
    .then((stat) => stat.isDirectory())
    .catch(() => false);

const isNotIgnored = (outputDir, dir) =>
  path.resolve(dir) !== path.resolve(outputDir) &&
  !dir.includes("node_modules") &&
  !dir.includes("web_modules");

let time = Date.now();
const watchers = {};
const addWatch = (dir, callback) => {
  watchers[dir] = fs.watch(dir, async (event, filename) => {
    if (!fs.existsSync(path.join(dir, filename))) {
      return;
    }

    if (await isDirectory(path.join(dir, filename))) {
      const childDir = path.join(dir, filename);
      if (!(childDir in watchers)) {
        addWatch(childDir, callback);
      }

      return;
    }

    const delta = Date.now() - time;
    if (delta > 300) {
      callback(event, filename);
      time = Date.now();
    }
  });
};

export default ({ inputDir, outputDir }, callback) => {
  [inputDir, ...getAllDirs(inputDir)]
    .filter((dir) => isNotIgnored(outputDir, dir))
    .forEach((dir) => addWatch(dir, callback));
};
