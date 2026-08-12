import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'lib', 'pdfjs');
const PDF_PATH = path.join(ROOT, 'CoHocLyThuyet.pdf');
const RUNTIME_PATH = path.join(OUTPUT_DIR, 'pdfjs-runtime.iife.min.js');
const DATA_PATH = path.join(OUTPUT_DIR, 'pdf-data.js');
const LICENSE_PATH = path.join(OUTPUT_DIR, 'LICENSE');
const PROVENANCE_PATH = path.join(OUTPUT_DIR, 'provenance.json');
const VERSION = '6.2.108';
const BUILD = '0365cbde0';
const CHUNK_SIZE = 64 * 1024;

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function writePdfData(pdf) {
  const encoded = pdf.toString('base64');
  const chunks = [];
  for (let offset = 0; offset < encoded.length; offset += CHUNK_SIZE) {
    chunks.push(encoded.slice(offset, offset + CHUNK_SIZE));
  }
  const source = `/* Generated from CoHocLyThuyet.pdf. Do not edit. */\n` +
    `(function(g){const c=${JSON.stringify(chunks)};let b;` +
    `g.PdfTextbookData=Object.freeze({sha256:${JSON.stringify(sha256(pdf))},` +
    `getBytes:function(){if(!b){const s=c.join('');const r=atob(s);b=new Uint8Array(r.length);` +
    `for(let i=0;i<r.length;i++)b[i]=r.charCodeAt(i);}return b.slice();}});` +
    `})(globalThis);\n`;
  fs.writeFileSync(DATA_PATH, source);
}

function artifactHash(relativePath) {
  return sha256(fs.readFileSync(path.join(OUTPUT_DIR, relativePath)));
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
await build({
  entryPoints: [path.join(import.meta.dirname, 'pdfjs-entry.mjs')],
  bundle: true,
  format: 'iife',
  globalName: 'PdfTextbookBundle',
  minify: true,
  outfile: RUNTIME_PATH,
  platform: 'browser',
  target: ['chrome125', 'firefox115', 'safari18'],
  legalComments: 'none',
  sourcemap: false,
});

const pdf = fs.readFileSync(PDF_PATH);
writePdfData(pdf);
fs.copyFileSync(path.join(ROOT, 'node_modules', 'pdfjs-dist', 'LICENSE'), LICENSE_PATH);

const provenance = {
  pdfjsVersion: VERSION,
  pdfjsBuild: BUILD,
  pdfjsSource: `https://github.com/mozilla/pdf.js/releases/tag/v${VERSION}`,
  buildCommand: 'npm run build:pdf-assets',
  buildTool: 'esbuild@0.28.2',
  enableScripting: false,
  useWasm: false,
  fileTransport: 'javascript-wrapped-uint8array',
  preloadedWorkerMessageHandler: true,
  pdfSource: 'CoHocLyThuyet.pdf',
  pdfSha256: sha256(pdf),
  artifacts: {
    'LICENSE': artifactHash('LICENSE'),
    'pdf-data.js': artifactHash('pdf-data.js'),
    'pdfjs-runtime.iife.min.js': artifactHash('pdfjs-runtime.iife.min.js'),
  },
};
fs.writeFileSync(PROVENANCE_PATH, `${JSON.stringify(provenance, null, 2)}\n`);
console.log(`Built PDF viewer assets (${pdf.length} PDF bytes).`);
