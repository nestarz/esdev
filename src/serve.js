#!/usr/bin/env node
import http from "http";
import path from "path";
import fs from "fs";
import mime from "mime";

const createServer = ({ transformers }) =>
  http.createServer(async (request, response) => {
    const filePath = request.url === "/" ? "index.html" : "." + request.url;
    const extension = path.extname(filePath).substring(1);

    if (!fs.existsSync(filePath)) {
      response.writeHeader(404);
      response.end();
      return;
    }

    if (extension in transformers) {
      const { body, "Content-Type": contentType } = await transform(filePath);
      response.writeHeader(200, { "Content-Type": contentType });
      response.write(body);
      response.end();
      return;
    }

    const type = mime.getType(extension);
    const contentType = extension === "html" ? `${type}; charset=utf-8` : type;
    response.writeHeader(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(response);
  });

const listen = (config, port) =>
  createServer(config)
    .listen(port)
    .on("listening", () => console.log(`Running at http://localhost:${port}`));

export default (config) =>
  listen(config, 5000).on("error", () => {
    console.warn("Already running at port 5000.");
    listen(config, 5001 + Math.floor(Math.random() * 10000));
  });
