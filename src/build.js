#!/usr/bin/env node
import { promises as fs, readdirSync, statSync } from "fs";
import path from "path";
import mime from "mime";

import { updateDependencies } from "./walker.js";

const validConfigOutput = ({
  body,
  "Content-Type": contentType,
  postTransform = [],
}) => ({
  body,
  postTransform,
  "Content-Type": contentType,
  extension: mime.getExtension(contentType),
});

export const transform = async (transformers, filePath) => {
  const fileExtension = path.extname(filePath).substring(1);
  const transformer = transformers[fileExtension];
  return validConfigOutput(
    await transformer(await fs.readFile(filePath, "utf-8"))
  );
};

export const transformAvailable = (transformers, filePath) =>
  path.extname(filePath).substring(1) in transformers;

export const build = async (filePath, { transformers, outputDir }) => {
  if (filePath.includes(outputDir)) return;
  if (filePath.includes("node_modules")) return;
  if (filePath.includes("web_modules")) return;
  if (!transformAvailable(transformers, filePath)) return;

  const { body, extension, postTransform } = await transform(
    transformers,
    filePath
  );
  const { body: transformedBody = body } = await postTransform.reduce(
    async (body, extension) => {
      if (extension in transformers) {
        return validConfigOutput(await transformers[extension](await body));
      }
      console.warn(`PostTransform '${extension}' does not exists.`);
      return { body: await body };
    },
    Promise.resolve(body)
  );

  const parsed = path.parse(filePath);
  const newName = [parsed.name, extension].join(".");
  const newPath = path.join(outputDir, parsed.dir, newName);
  const newBody = updateDependencies(transformedBody, (dependency) => {
    const a = path.join(path.resolve(), path.parse(filePath).dir, dependency);
    const b = path.join(outputDir, path.parse(filePath).dir, dependency);
    return `./${path.relative(b, a)}`;
  });

  await fs.mkdir(path.join(outputDir, parsed.dir), { recursive: true });
  await fs.writeFile(newPath, newBody);

  return [
    path.relative(outputDir, filePath),
    path.join(
      path.relative(outputDir, "."),
      path.relative(path.resolve(), newPath)
    ),
  ];
};

const getAllFiles = (dir) =>
  readdirSync(dir)
    .reduce((files, file) => {
      if (file.startsWith(".") || file.includes("/.")) return files;
      const name = path.join(dir, file);
      const isDirectory = statSync(name).isDirectory();
      return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
    }, [])
    .map((file) => path.relative(path.resolve(), file));

export default async ({ outputDir, inputDir, transformers }) => {
  await fs.rmdir(outputDir, { recursive: true });
  await fs.mkdir(outputDir);

  const files = getAllFiles(inputDir);
  const builder = (dependency) =>
    build(dependency, { transformers, outputDir });
  const importMap = (await Promise.all(files.map(builder))).filter((v) => v);
  const imports = Object.fromEntries(importMap);
  const importMapPath = path.join(outputDir, "build-import-map.json");
  await fs.writeFile(importMapPath, JSON.stringify({ imports }, null, 2));
};
