#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";
import mime from "mime";
import globSync from "glob";

import { updateDependencies } from "./walker.js";

const validConfigOutput = ({ body, "Content-Type": contentType }) => ({
  body,
  "Content-Type": contentType,
  extension: mime.getExtension(contentType),
});

export const transform = async (transformers, filePath) => {
  const fileExtension = path.extname(filePath).substring(1);
  const transformer = transformers[fileExtension];
  return validConfigOutput(await transformer(await fs.readFile(filePath)));
};

export const transformAvailable = (transformers, filePath) =>
  path.extname(filePath).substring(1) in transformers;

export const build = async (filePath, { transformers, outputDir }) => {
  if (filePath.includes(outputDir)) return;
  if (filePath.includes("node_modules")) return;
  if (filePath.includes("web_modules")) return;
  if (!transformAvailable(transformers, filePath)) return;

  const { body, extension } = await transform(transformers, filePath);
  const parsed = path.parse(filePath);
  const newName = [parsed.name, extension].join(".");
  const newPath = path.join(outputDir, parsed.dir, newName);
  const newBody = updateDependencies(
    body,
    (dependency) =>
      `./${path.join(
        path.relative(outputDir, ".."),
        path.parse(filePath).dir,
        dependency
      )}`
  );

  await fs.mkdir(path.join(outputDir, parsed.dir), { recursive: true });
  await fs.writeFile(newPath, newBody);

  return [
    path.relative(outputDir, filePath),
    path.join(path.relative(outputDir, "."), newPath),
  ];
};

const glob = (pattern) =>
  new Promise((resolve, reject) =>
    globSync(pattern, (_, results) => resolve(results), reject)
  );

export default async ({ outputDir, inputGlob, transformers }) => {
  await fs.rmdir(outputDir, { recursive: true });
  await fs.mkdir(outputDir);

  const files = await glob(inputGlob);
  const builder = (dependency) =>
    build(dependency, { transformers, outputDir });
  const importMap = (await Promise.all(files.map(builder))).filter((v) => v);

  const importMapPath = path.join(outputDir, "build-import-map.json");
  await fs.writeFile(
    importMapPath,
    JSON.stringify({
      imports: Object.fromEntries(importMap),
    })
  );
};
