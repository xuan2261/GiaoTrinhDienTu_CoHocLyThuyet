const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const authorFragment = fs.readFileSync(path.join(ROOT, 'chapters', 'tac-gia.html'), 'utf8');
const pageBundle = fs.readFileSync(path.join(ROOT, 'js', 'pages.js'), 'utf8');

const forbiddenFrontMatter = [
  'QUÂN CHỦNG HẢI QUÂN',
  'GIÁO TRÌNH ĐIỆN TỬ',
  'HỘI ĐỒNG THẨM ĐỊNH',
  'Quyết định ban hành'
];

for (const text of forbiddenFrontMatter) {
  assert.ok(!authorFragment.includes(text), `author fragment should not include front matter: ${text}`);
}

for (const text of ['Nguyễn Lê Văn', 'Đinh Văn Tứ', 'Bùi Thanh Xuân']) {
  assert.ok(authorFragment.includes(text), `author fragment should include ${text}`);
}

const cardCount = (authorFragment.match(/class="ac2/g) || []).length;
assert.strictEqual(cardCount, 3, 'author fragment should render exactly 3 author cards');
assert.ok(authorFragment.includes('PAGES["authors"]') === false, 'fragment should stay plain HTML');
assert.ok(pageBundle.includes('PAGES["authors"]'), 'offline bundle should include authors page');

const authorsBundleMatch = pageBundle.match(/PAGES\["authors"\] = "([\s\S]*?)";/);
assert.ok(authorsBundleMatch, 'offline bundle should expose authors HTML');
const authorsBundleHtml = authorsBundleMatch[1];
for (const text of forbiddenFrontMatter) {
  assert.ok(!authorsBundleHtml.includes(text), `authors bundle should not include front matter: ${text}`);
}

console.log('author page content regression: PASS');
