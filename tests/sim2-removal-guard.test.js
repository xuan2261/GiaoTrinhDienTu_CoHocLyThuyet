/**
 * Guard: 52 cũ đã gỡ, 3 file physics nguồn-port còn nguyên.
 * Định nghĩa "content-only đạt" ở tầng filesystem + grep runtime.
 * Chạy: node tests/sim2-removal-guard.test.js
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// --- Sim cũ phải biến mất ---
assert.ok(!exists('js/sims'), 'js/sims/ phải bị xóa');
assert.ok(!exists('js/simulations.js'), 'js/simulations.js phải bị xóa');
assert.ok(!exists('js/sim-route-manifest.js'), 'js/sim-route-manifest.js phải bị xóa');

// --- Engine SimNew bỏ dở (dead code orphan) phải biến mất ---
for (const dir of ['js/physics', 'js/render', 'js/routes', 'js/scene', 'js/interaction', 'js/animation']) {
  assert.ok(!exists(dir), `${dir}/ (SimNew orphan) phải bị xóa`);
}

// --- 3 file physics nguồn-port: P0 giữ lại, P5 đã port + xóa.
// Bất biến "đã port + xóa" do [[sim2-no-legacy-physics]] sở hữu (tránh trùng/ngược nhau). ---

// --- index.html không còn nạp sim cũ ---
const indexHtml = read('index.html');
assert.ok(!/js\/sims\//.test(indexHtml), 'index.html không còn script-tag js/sims/');
assert.ok(!/js\/simulations\.js/.test(indexHtml), 'index.html không còn js/simulations.js');
assert.ok(!/js\/sim-route-manifest\.js/.test(indexHtml), 'index.html không còn sim-route-manifest.js');
assert.ok(!/js\/sim-physics-/.test(indexHtml), 'index.html không nạp physics ở browser (chỉ là nguồn port Node)');
assert.ok(!/sim:katex-ready/.test(indexHtml), 'index.html không còn dispatch sim:katex-ready');

// --- loader.js: dead-code động cũ không tái sinh, không trỏ dir sim cũ ---
// (P1 dựng lại initSimulations gọn + dispose qua SIM_MAP — đó là mong muốn, KHÔNG assert vắng mặt.)
const loaderJs = read('js/loader.js');
assert.ok(!/loadSimScript/.test(loaderJs), 'loader.js không tái sinh loadSimScript (dynamic injection dead code)');
assert.ok(!/js\/sims\//.test(loaderJs), 'loader.js không trỏ js/sims/ (dir cũ)');
assert.ok(!/js\/routes\//.test(loaderJs), 'loader.js không trỏ js/routes/ (SimNew orphan)');
assert.ok(!/NO_SIMULATION_PAGE_IDS|SIM_ROUTE_ALIAS_MAP/.test(loaderJs), 'loader.js không còn alias/no-sim map cũ');

console.log('sim2-removal-guard: PASS');
