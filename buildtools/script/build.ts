import * as esbuild from "https://deno.land/x/esbuild@v0.17.0/mod.js";
import { httpImports } from "https://deno.land/x/esbuild_plugin_http_imports@v1.2.4/index.ts";


const projectPath = new URL('../../',import.meta.url).pathname;

async function writeJson(filePath:string, o:unknown) {
    try {
        await Deno.writeTextFile(filePath, JSON.stringify(o, null, 2));
    } catch(e) {
        console.log(e);
    }
}
const decoder = new TextDecoder("utf-8");

const importMetaPlugin : esbuild.Plugin = {
    name: 'import.meta.url',
    setup({ onLoad }) {
      // TODO: change /()/ to smaller range
      onLoad({ filter: /.*d.element.ts$/, namespace: 'file' }, args => {
        
        let code = decoder.decode(Deno.readFileSync(args.path))
        if(args.suffix){
            code = code.replace( /\bimport\.meta\.url\b/g,`(import.meta.url || "").replace(/[#\\?].*$/, '') + "${args.suffix}" `)
        }
        console.log(code)
        return { contents: code }
      })
    }
  }

const target =  `${projectPath}/build`
try {
    await Deno.remove(target, {recursive: true});
} catch {
    /* ignore */
}
esbuild.build({
    entryPoints: [`${projectPath}/src/browser-client/entrypoint.ts`],
    outdir: target,
    format: "esm",
    target: "es2022",
    splitting: true,
    bundle: true,
    packages: "external",
    plugins: [importMetaPlugin, httpImports()],
    metafile: true,
    loader: {
        ".data.html": "copy",
        ".page.html": "file",
        ".page.css": "file",
        ".html": "dataurl"
    }
  })
  .then((result) => writeJson(`${target}/metadata.json`, result.metafile))
  .then((() => console.log("⚡ Done")))
  .then(() => Deno.exit(0))

  esbuild.build({
    entryPoints: [`${projectPath}/src/browser-client/components/i18n/i18n.element.ts`],
    outdir: target,
    format: "esm",
    target: "es2022",
    splitting: true,
    bundle: true,
    packages: "external",
    plugins: [httpImports()],
    metafile: true,
    loader: {
        ".data.html": "copy",
        ".page.html": "file",
        ".page.css": "file",
        ".html": "dataurl"
    }
  })
  .then((result) => writeJson(`${target}/metadata.json`, result.metafile))
  .then((() => console.log("⚡ Done")))