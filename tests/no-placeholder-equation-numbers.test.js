const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const targets = [];

function collectHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectHtml(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      targets.push(fullPath);
    }
  }
}

collectHtml(path.join(ROOT, 'chapters'));
targets.push(path.join(ROOT, 'js', 'pages.js'));

for (const target of targets) {
  const content = fs.readFileSync(target, 'utf8');
  assert.ok(!/(?:^|>)\s*\(\.\)\s*(?:<|$)/m.test(content), `${path.relative(ROOT, target)} must not contain placeholder equation number (.)`);
}

console.log('no placeholder equation numbers: PASS');
