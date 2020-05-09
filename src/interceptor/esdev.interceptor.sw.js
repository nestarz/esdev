const transformer = async (url) => {
  const importMap = await fetch("./build/_esdev/import-map.json").then((r) =>
    r.json()
  );
  const path = `.${new URL(url).pathname}`;
  const newUrl = importMap.imports[path];
  if (newUrl) {
    const response = await fetch(newUrl);
    const transformed = await response.text();
    return new Response(
      new Blob([transformed], { type: "application/javascript" })
    );
  }
  return await fetch(url);
};

self.addEventListener("fetch", (event) => {
  event.respondWith(transformer(event.request.url));
});
