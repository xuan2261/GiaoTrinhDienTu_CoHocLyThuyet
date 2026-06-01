/**
 * TDD — renderContactSheet (pure logic, Node → HTML string).
 * Chạy: node tests/sim2-visual-contact-sheet.test.js
 */
'use strict';

const assert = require('assert');
const { renderContactSheet } = require('../tools/sim2-visual/contact-sheet.js');

function mkRecords(n) {
  const recs = [];
  for (let i = 0; i < n; i++) {
    recs.push({
      route: 'ch1-1-' + i,
      chapter: 1,
      section: '1.' + i,
      name: 'Sim test ' + i,
      kind: i % 2 ? 'dynamic' : 'static',
      images: [
        { label: 'init', src: 'ch1-1-' + i + '__init.png' },
        { label: 'live', src: 'ch1-1-' + i + '__live.png' }
      ],
      flags: []
    });
  }
  return recs;
}

const N = 7;
const records = mkRecords(N);
const html = renderContactSheet(records);

// 1. HTML hợp lệ: đúng 1 <html> + có </html>.
assert.strictEqual((html.match(/<html/g) || []).length, 1, 'đúng 1 <html>');
assert.ok(/<\/html>/.test(html), 'có thẻ đóng </html>');

// 2. Chứa đủ N route id + section badge mỗi route.
for (const r of records) {
  assert.ok(html.includes(r.route), `chứa route id ${r.route}`);
  assert.ok(html.includes(r.section), `chứa section badge ${r.section}`);
}

// 3. Số <img> === tổng shots toàn bộ record.
const totalImgs = records.reduce((a, r) => a + r.images.length, 0);
const imgCount = (html.match(/<img\b/g) || []).length;
assert.strictEqual(imgCount, totalImgs, `số <img> = tổng shots (${totalImgs})`);

// 4. Cờ Claude render kèm class phân mức + note hiển thị.
const flagged = mkRecords(2);
flagged[0].flags = [{ severity: 'high', note: 'canvas trắng toàn phần' }];
flagged[1].flags = [{ severity: 'low', note: 'nhãn lệch nhẹ' }];
const html2 = renderContactSheet(flagged);
assert.ok(/flag-high/.test(html2), 'cờ high có class flag-high');
assert.ok(/flag-low/.test(html2), 'cờ low có class flag-low');
assert.ok(html2.includes('canvas trắng toàn phần'), 'note high hiển thị');
assert.ok(html2.includes('nhãn lệch nhẹ'), 'note low hiển thị');

// 5. Escape: route/note độc hại KHÔNG phá markup (nguồn tin cậy nhưng vẫn escape).
const evil = [{
  route: 'x<script>', chapter: 1, section: '1.1', name: 'n', kind: 'static',
  images: [{ label: 'init', src: 'a.png' }],
  flags: [{ severity: 'high', note: '<b>boom</b>' }]
}];
const html3 = renderContactSheet(evil);
assert.ok(!html3.includes('<script>'), 'route id <script> bị escape, không tiêm thẻ');
assert.ok(html3.includes('&lt;script&gt;'), 'route id escape thành &lt;script&gt;');
assert.ok(!html3.includes('<b>boom</b>'), 'note escape, không tiêm <b>');

// 6. Records rỗng → vẫn ra HTML hợp lệ (không nổ).
const empty = renderContactSheet([]);
assert.ok(/<html/.test(empty) && /<\/html>/.test(empty), 'records rỗng vẫn ra HTML hợp lệ');

console.log(`sim2-visual-contact-sheet: PASS (${N} route, ${totalImgs} img)`);
