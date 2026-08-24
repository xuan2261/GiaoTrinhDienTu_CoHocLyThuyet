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
const contracts = require('./support/simulation-route-contracts.js');
const routeContracts = contracts.sim2;

// 1. Manifest is canonical: count follows it, not a duplicated literal.
assert.ok(Array.isArray(manifest) && manifest.length > 0, 'manifest phải là mảng không rỗng');
const N = manifest.length;
contracts.validateContracts(contracts);
for (const r of manifest) {
  assert.ok(/^ch\d-\d-\d$/.test(r.id), `id ${r.id} sai định dạng ch?-?-?`);
  assert.ok(r.name && r.name.length > 0, `route ${r.id} phải có tên`);
  assert.ok([1, 2, 3].includes(r.chapter), `route ${r.id} chương hợp lệ`);
}
// không trùng id
const ids = manifest.map(r => r.id);
assert.strictEqual(new Set(ids).size, N, 'id không được trùng');

// 2. Every manifest route has a factory in SIM_MAP (factories are not invoked).
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
// SIM_MAP contains exactly the manifest routes (no scaffold residue).
const mapKeys = Object.keys(SIM_MAP).sort();
assert.deepStrictEqual(mapKeys, ids.slice().sort(),
  `SIM_MAP phải chứa đúng route manifest (thừa/thiếu: ${mapKeys.filter(k => !ids.includes(k)).join(',')})`);

// 3. Coverage is contract-driven: every manifest route has executable factory,
// independent oracle metadata, and browser mount evidence. Source-text mentions do not count.
assert.deepStrictEqual(routeContracts.map(item => item.id).sort(), ids.slice().sort(),
  'contract table phải phủ đúng tập route trong manifest');
for (const contract of routeContracts) {
  assert.strictEqual(typeof contract.resolve(sandbox.window), 'function', `${contract.id} phải resolve factory thật`);
  assert.ok(fs.existsSync(path.join(ROOT, contract.oracle.path)), `${contract.id} thiếu independent oracle`);
  assert.ok(fs.existsSync(path.join(ROOT, contract.mountEvidence)), `${contract.id} thiếu mount evidence`);
}

// 4. Không hex màu stroke/fill rải rác trong sims (phải dùng Sim2Palette).
//    Cho phép: hex trong \textcolor{} của KaTeX (literal bắt buộc, mirror palette),
//    #fff (nền lỗ/điểm trắng), rgba(...) cho fill mờ. Kiểm theo dòng (như grep validated).
const hexLine = /#[0-9a-fA-F]{3,6}\b/;
for (const r of manifest) {
  const src = fs.readFileSync(path.join(ROOT, `js/sim2/sims/ch${r.chapter}/${r.id}.js`), 'utf8');
  src.split('\n').forEach((line, i) => {
    if (!hexLine.test(line)) return;
    if (/textcolor/.test(line) || /rgba\(/.test(line)) return;     // KaTeX màu + fill mờ: cho phép
    const stripped = line.replace(/#fff(fff)?\b/gi, '');           // trắng: cho phép
    if (hexLine.test(stripped)) {
      assert.fail(`${r.id}.js:${i + 1} còn hex stroke/fill rải rác (dùng Sim2Palette): ${line.trim()}`);
    }
  });
}

console.log(`sim2-route-coverage: PASS (${N} route, factory + physics + mount + palette đủ)`);
