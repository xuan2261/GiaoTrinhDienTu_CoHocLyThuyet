/**
 * build-contact-sheet — Node runner: đọc visuals/capture-manifest.json → (merge cờ
 * Claude từ claude-triage.json nếu có) → renderContactSheet → ghi visuals/contact-sheet.html.
 * Kiểm phủ-đủ-route: so capture-manifest ↔ route-manifest (cảnh báo route thiếu).
 *
 * Chạy: node tools/sim2-visual/build-contact-sheet.js
 */
'use strict';

const fs = require('fs');
const { validateCapture } = require('./validate-capture.js');
const path = require('path');
const { renderContactSheet } = require('./contact-sheet.js');

const ROOT = path.resolve(__dirname, '../..');
const routeManifest = require(path.join(ROOT, 'js/sim2/sim2-route-manifest.js'));
const VIS_DIR = path.join(ROOT, 'plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals');
const CAPTURE_JSON = path.join(VIS_DIR, 'capture-manifest.json');
const TRIAGE_JSON = path.join(VIS_DIR, 'claude-triage.json');
const OUT_HTML = path.join(VIS_DIR, 'contact-sheet.html');

function main() {
  if (!fs.existsSync(CAPTURE_JSON)) {
    console.error('LỖI: chưa có capture-manifest.json. Chạy `npm run test:sim:visual:capture` trước.');
    process.exit(1);
  }
  const payload = JSON.parse(fs.readFileSync(CAPTURE_JSON, 'utf8'));
  validateCapture(payload, Date.now(), VIS_DIR);
  const records = payload.routes;

  console.log(`coverage: ${records.length}/${routeManifest.length} route`);

  // Merge cờ Claude nếu đã triage.
  let triageCount = 0;
  if (fs.existsSync(TRIAGE_JSON)) {
    const triage = JSON.parse(fs.readFileSync(TRIAGE_JSON, 'utf8'));
    const byRoute = {};
    for (const t of triage) {
      (byRoute[t.route] = byRoute[t.route] || []).push({
        severity: t.severity || 'ok',
        note: t.note || t.label || ''
      });
    }
    for (const rec of records) {
      rec.flags = byRoute[rec.route] || [{ severity: 'ok', note: 'đạt' }];
    }
    triageCount = triage.length;
    console.log(`triage: merged ${triageCount} cờ Claude cho ${Object.keys(byRoute).length} route`);
  } else {
    for (const rec of records) rec.flags = [];
    console.log('triage: chưa có claude-triage.json → sheet không cờ (build thô).');
  }

  const html = renderContactSheet(records);
  fs.writeFileSync(OUT_HTML, html, 'utf8');
  const totalImgs = records.reduce((a, r) => a + r.images.length, 0);
  console.log(`OK: ${OUT_HTML} (${records.length} route, ${totalImgs} ảnh${triageCount ? ', có cờ' : ''}).`);
}

main();
