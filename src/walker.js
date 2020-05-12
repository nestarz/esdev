import acorn from "acorn";

const isNode = (node) => typeof node.type === "string";

const getChilds = (node) =>
  Object.keys(node)
    .filter((key) => node[key] && key !== "parent")
    .flatMap((key) => node[key])
    .filter(isNode);

export function* walk({ node, parent } = {}) {
  for (const child of getChilds(node)) {
    yield* walk({ node: child, parent: node });
  }
  yield { node, parent };
}

export const walker = (source, parser = acorn, options) =>
  walk({
    node: parser.parse(source, {
      sourceType: "module",
      ecmaVersion: 11,
      ...options,
    }),
  });

export const extractImportSource = (node) => {
  const sources = {
    ImportDeclaration: (node) =>
      node.importKind !== "type" && node?.source?.value,
    ExportNamedDeclaration: (node) => node?.source?.value,
    ExportAllDeclaration: (node) => node?.source?.value,
    CallExpression: (node) =>
      node.callee.type === "Import" &&
      node.arguments.length &&
      node.arguments[0].value,
  };

  const getDependencyFn = sources[node.type];
  return getDependencyFn ? getDependencyFn(node) : null;
};

export const updateDependencies = (body, updateFn) => {
  const nodes = walker(body);
  return Array.from(nodes)
    .reduce((chunks, { node }) => {
      const dependency = extractImportSource(node);
      if (dependency && dependency.startsWith(".")) {
        chunks[node.start] = chunks
          .slice(node.start, node.end)
          .join("")
          .replace(dependency, updateFn(dependency));
        for (let i = node.start + 1; i < node.end; i++) {
          chunks[i] = "";
        }
      }

      return chunks;
    }, body.split(""))
    .join("");
};

export default walker;