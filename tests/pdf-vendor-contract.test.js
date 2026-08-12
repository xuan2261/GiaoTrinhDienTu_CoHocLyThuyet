const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PDF_PATH = path.join(ROOT, 'CoHocLyThuyet.pdf');
const VENDOR_DIR = path.join(ROOT, 'lib', 'pdfjs');
const PROVENANCE_PATH = path.join(VENDOR_DIR, 'provenance.json');

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

assert(fs.existsSync(PDF_PATH), 'Thiếu CoHocLyThuyet.pdf');
assert(fs.existsSync(PROVENANCE_PATH), 'Thiếu lib/pdfjs/provenance.json');

const provenance = JSON.parse(fs.readFileSync(PROVENANCE_PATH, 'utf8'));
assert.strictEqual(provenance.pdfjsVersion, '6.2.108');
assert.strictEqual(provenance.pdfSha256, sha256(PDF_PATH));
assert.strictEqual(provenance.enableScripting, false);
assert.strictEqual(provenance.useWasm, false);
assert.strictEqual(provenance.preloadedWorkerMessageHandler, true);
assert.strictEqual(provenance.fileTransport, 'javascript-wrapped-uint8array');

for (const relativePath of [
  'pdfjs-runtime.iife.min.js',
  'pdf-data.js',
  'LICENSE',
]) {
  const absolutePath = path.join(VENDOR_DIR, relativePath);
  assert(fs.existsSync(absolutePath), `Thiếu lib/pdfjs/${relativePath}`);
  assert(provenance.artifacts[relativePath], `Thiếu hash provenance cho ${relativePath}`);
  assert.strictEqual(provenance.artifacts[relativePath], sha256(absolutePath));
}

const runtime = fs.readFileSync(path.join(VENDOR_DIR, 'pdfjs-runtime.iife.min.js'), 'utf8');
assert(!/<script[^>]+type=["']module/i.test(runtime), 'Runtime file:// không được dùng module script');
assert(!/(cdn\\.jsdelivr|cdnjs|unpkg)\\.com/i.test(runtime), 'Runtime PDF không được phụ thuộc CDN');

const dataSource = fs.readFileSync(path.join(VENDOR_DIR, 'pdf-data.js'), 'utf8');
assert(dataSource.includes('PdfTextbookData'), 'pdf-data.js phải expose PdfTextbookData');
assert(!/https?:\/\//i.test(dataSource), 'PDF data không được phụ thuộc URL từ xa');

console.log('PASS pdf-vendor-contract');
