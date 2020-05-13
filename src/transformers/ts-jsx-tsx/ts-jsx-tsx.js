const esbuildTransform = async (string, loader) => {
  const esbuild = (await import("esbuild")).default;
  const service = await esbuild.startService();
  const { js } = await service.transform(string, { loader });
  service.stop();
  return { body: js, "Content-Type": "application/javascript" };
};

export default {
  jsx: (jsx) => esbuildTransform(jsx, "jsx"),
  tsx: (tsx) => esbuildTransform(tsx, "tsx"),
  ts: (ts) => esbuildTransform(ts, "ts"),
};
