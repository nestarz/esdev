import servor from "servor";
import net from "net";

const isPortTaken = (port) =>
  new Promise((resolve, reject) => {
    const tester = net
      .createServer()
      .once("error", (err) =>
        err.code == "EADDRINUSE" ? resolve(false) : reject(err)
      )
      .once("listening", () =>
        tester.once("close", () => resolve(true)).close()
      )
      .listen(port);
  });

export default async () =>
  servor({
    root: ".",
    fallback: "index.html",
    reload: true,
    inject: "",
    port: (await isPortTaken(5000)) ? 5000 : undefined,
  }).then((instance) => {
    console.log(instance);
  });
