import * as esbuild from "https://deno.land/x/esbuild@v0.17.0/mod.js";
import { httpImports } from "https://deno.land/x/esbuild_plugin_http_imports@v1.2.4/index.ts";


const projectPath = new URL('../../',import.meta.url).pathname;

async function writeJson(filePath:string, o:any) {
    try {
        await Deno.writeTextFile(filePath, JSON.stringify(o, null, 2));
    } catch(e) {
        console.log(e);
    }
}

const target =  `${projectPath}/build`
esbuild.build({
    entryPoints: [`${projectPath}/src/browser-client/entrypoint.ts`],
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
  .then(() => Deno.exit(0))
  