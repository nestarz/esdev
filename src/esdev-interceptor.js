const importMap = fetch("./build/import-map.json").then((r) => r.json());
importShim.fetch = async function (url) {
  const path = new URL(url).pathname;
  const newUrl = (await importMap).imports["." + path];
  if (newUrl) {
    const response = await fetch(newUrl);
    const transformed = await response.text();
    return new Response(
      new Blob([transformed], { type: "application/javascript" })
    );
  }
  return await fetch(url);
};
