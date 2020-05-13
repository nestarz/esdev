import { parse, compileTemplate } from "./vue-compiler-sfc.js";

const vueCompile = (string) => {
  const script = /<script.*>((.|\n)*?)<\/script>/g.exec(string);
  const template = /<template.*>((.|\n)*?)<\/template>/gi.exec(string);
  const style = /<style[^>]*>((.|\n)*?)<\/style>/gi.exec(string);

  const html = style ? style[0] + template[0] : template[0];
  const { code: render } = compileTemplate({
    source: parse(html).descriptor.template.content,
  });

  return script[1].replace(
    "export default {",
    `${render}
      export default { render,`
  );
};

export default {
  vue: (source) => ({
    body: vueCompile(source),
    "Content-Type": "application/javascript",
    postTransform: ["ts"],
  }),
};
