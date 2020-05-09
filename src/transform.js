import fs from "fs";
import path from "path";

export const jsxTransform = async (jsx, loader) => {
  const esbuild = (await import("esbuild")).default;
  const service = await esbuild.startService();
  const { js } = await service.transform(jsx, { loader });
  service.stop();
  return js;
};

export default async (fileName) => {
  const fileExtension = path.extname(fileName).substring(1);
  return ["jsx", "tsx"].includes(fileExtension)
    ? [await jsxTransform(fs.readFileSync(fileName), fileExtension), "js"]
    : [fs.createReadStream(fileName), fileExtension];
};
