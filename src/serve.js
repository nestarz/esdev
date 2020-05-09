#!/usr/bin/env node
import http from "http";
import path from "path";
import fs from "fs";
import mime from "mime";
import transform, { needTransform } from "./transform.js";

const server = http.createServer(async (request, response) => {
  const configPath = path.join(path.resolve(), "esdev.config.js");
  const config = (await import(configPath)).default;

  const filePath = request.url === "/" ? "index.html" : "." + request.url;

  if (!fs.existsSync(filePath)) {
    response.writeHeader(404);
    response.end();
    return;
  }

  if (
    path.join(filePath) === path.join(config.outputDir, "esdev-interceptor.js")
  ) {
    response.writeHeader(200, { "Content-Type": "application/javascript" });
    response.write("");
    response.end();
    return;
  }

  if (!(await needTransform(filePath))) {
    const fileExtension = path.extname(filePath).substring(1);
    response.writeHeader(200, { "Content-Type": mime.getType(fileExtension) });
    fs.createReadStream(filePath).pipe(response);
    return;
  }

  const { body, "Content-Type": contentType } = await transform(filePath);
  response.writeHeader(200, { "Content-Type": contentType });
  response.write(body);
  response.end();
});

const listen = (port) =>
  server
    .listen(port)
    .on("listening", () => console.log(`Running at http://localhost:${port}`));

listen(5000).on("error", () => {
  console.warn("Already running at port 5000.");
  listen(5001 + Math.floor(Math.random() * 10000));
});
