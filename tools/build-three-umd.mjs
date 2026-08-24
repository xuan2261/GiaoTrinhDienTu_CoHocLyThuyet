import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outfile = path.join(root, 'lib/three/three.umd.min.js');

await build({
  stdin: {
    contents: "export * from 'three';",
    resolveDir: root,
    sourcefile: 'three-umd-entry.js',
    loader: 'js'
  },
  bundle: true,
  format: 'iife',
  globalName: 'THREE',
  legalComments: 'inline',
  minify: true,
  outfile
});

console.log(`Built ${path.relative(root, outfile)} from installed three package.`);
