import fs from "fs";
import path from "path";
import mime from "mime";
import getEsdevConfig from "./config.js";

export const needTransform = async (fileName) => {
  const config = await getEsdevConfig();
  const fileExtension = path.extname(fileName).substring(1);
  return Object.keys(config).includes(fileExtension);
};

const validConfigOutput = ({ body, "Content-Type": contentType }) => ({
  body,
  "Content-Type": contentType,
  extension: mime.getExtension(contentType),
});

export default async (fileName) => {
  const fileExtension = path.extname(fileName).substring(1);
  const { [fileExtension]: transformer } = await getEsdevConfig();
  return validConfigOutput(await transformer(fs.readFileSync(fileName)));
};
