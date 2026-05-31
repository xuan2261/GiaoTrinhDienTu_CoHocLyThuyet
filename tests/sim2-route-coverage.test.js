/**
 * P5 — Coverage 25 route: manifest ↔ SIM_MAP ↔ physics test ↔ mount case.
 * Đọc length từ manifest (KHÔNG hardcode 25). Chạy: node tests/sim2-route-coverage.test.js
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const manifest = require('../js/sim2/sim2-route-manifest.js');

// 1. Đúng số route + định dạng id
assert.ok(Array.isArray(manifest), 'manifest là mảng');
const N = manifest.length;
assert.strictEqual(N, 25, `manifest phải có 25 route (đang ${N})`);
for (const r of manifest) {
  assert.ok(/^ch\d-\d-\d$/.test(r.id), `id ${r.id} sai định dạng ch?-?-?`);
  assert.ok(r.name && r.name.length > 0, `route ${r.id} phải có tên`);
  assert.ok([1, 2, 3].includes(r.chapter), `route ${r.id} chương hợp lệ`);
}
// không trùng id
const ids = manifest.map(r => r.id);
assert.strictEqual(new Set(ids).size, N, 'id không được trùng');

// 2. Mỗi id có factory trong SIM_MAP — load registry + 25 sim qua vm (factory không bị gọi)
const sandbox = { window: {}, document: {}, console };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
function run(rel) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sandbox, { filename: rel });
}
run('js/sim2/registry.js');
for (const r of manifest) {
  const chDir = 'ch' + r.chapter;
  run(`js/sim2/sims/${chDir}/${r.id}.js`);
}
const SIM_MAP = sandbox.window.SIM_MAP || {};
for (const r of manifest) {
  assert.strictEqual(typeof SIM_MAP[r.id], 'function', `SIM_MAP['${r.id}'] phải là factory`);
}
// SIM_MAP chỉ chứa đúng 25 route manifest (không thừa scaffold sim2-hello)
const mapKeys = Object.keys(SIM_MAP).sort();
assert.deepStrictEqual(mapKeys, ids.slice().sort(),
  `SIM_MAP phải chứa đúng 25 route manifest (thừa/thiếu: ${mapKeys.filter(k => !ids.includes(k)).join(',')})`);

// 3. Mỗi id có ≥1 physics assert + ≥1 mount case (grep test files)
const physicsSrc = [1, 2, 3].map(c =>
  fs.readFileSync(path.join(ROOT, `tests/sim2-ch${c}-physics.test.js`), 'utf8')).join('\n');
const mountSrc = [1, 2, 3].map(c =>
  fs.readFileSync(path.join(ROOT, `tests/sim2-ch${c}-mount.spec.js`), 'utf8')).join('\n');
for (const r of manifest) {
  assert.ok(physicsSrc.includes(r.id), `route ${r.id} phải có physics assert`);
  assert.ok(mountSrc.includes(r.id), `route ${r.id} phải có mount case`);
}

console.log(`sim2-route-coverage: PASS (${N} route, factory + physics + mount đủ)`);
