const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const deletedRoutes = ['ch1-7-3', 'ch2-7-3', 'ch3-7-3'];
const removedFragments = [
  'chapters/ch1/muc-VII-3.html',
  'chapters/ch2/muc-VII-3.html',
  'chapters/ch3/muc-VII-3.html',
];
const runtimeFiles = [
  'index.html',
  'js/app.js',
  'js/loader.js',
  'js/pages.js',
  'tools/update_nav.py',
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

for (const route of deletedRoutes) {
  for (const file of runtimeFiles) {
    assert.ok(!read(file).includes(route), `${file} must not reference deleted route ${route}`);
  }
}

for (const fragment of removedFragments) {
  assert.ok(!fs.existsSync(path.join(ROOT, fragment)), `${fragment} must be removed`);
  assert.ok(!read('js/pages.js').includes(fragment), `js/pages.js must not bundle ${fragment}`);
}

for (const chapter of ['ch1', 'ch2', 'ch3']) {
  const review = read(`chapters/${chapter}/on-tap.html`);
  assert.ok(review.includes('Câu hỏi ôn tập'), `${chapter}/on-tap.html keeps canonical review content`);
  assert.ok(!review.includes('Ôn tập trắc nghiệm'), `${chapter}/on-tap.html has no trailing quiz heading`);
}

console.log('section-vii-review-route-cleanup: PASS');
