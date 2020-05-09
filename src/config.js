import path from "path";

const defaultConfigPath = path.join(path.resolve(), "esdev.config.js");

export default async (configPath = defaultConfigPath) => {
  const { outputDir, inputGlob, ...transformers } = (
    await import(configPath)
  ).default;
  return {
    outputDir: outputDir ?? path.join(path.resolve(), "./build/"),
    inputGlob: inputGlob ?? path.join(path.resolve(), "./src/"),
    ...transformers,
  };
};
