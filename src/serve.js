import http from "http";
import fs from "fs";
import mime from "mime";
import transform from "./transform.js";

const server = http.createServer(async (request, response) => {
  const filePath = request.url === "/" ? "index.html" : "." + request.url;

  console.log(filePath);
  if (!fs.existsSync(filePath)) {
    response.writeHeader(404);
    response.end();
    return;
  }

  const [data, extension] = await transform(filePath);
  response.writeHeader(200, { "Content-Type": mime.getType(extension) });
  if (data instanceof fs.ReadStream) {
    data.pipe(response);
  } else {
    response.write(data);
    response.end();
  }
});

server.listen(5000, () => {
  console.log("Running at http://localhost:5000");
});
