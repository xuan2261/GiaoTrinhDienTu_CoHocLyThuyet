'use strict';

// This is an inventory of bytes, never an assertion that tests or review passed.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const SOURCE_DIRECTORIES = ['js', 'css', 'chapters', 'lib', 'images', 'assets/gifs', 'tests', 'tools/sim-validation', 'tools/sim2-visual', 'tools/sim3-visual', 'tools/sim-probe'];
const SOURCE_FILES = ['index.html', 'CoHocLyThuyet.pdf', 'package.json', 'package-lock.json', 'data/content-manifest.json', 'data/learning-outcomes.json', 'data/simulation-learning-map.json', 'data/simulation-specifications.json', 'data/sim3-pedagogical-reviews.json', 'data/quiz-learning-map.json', 'data/quiz-ch1.json', 'data/quiz-ch2.json', 'data/quiz-ch3.json'];

function digest(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function sourceSnapshot(root) {
  root = fs.realpathSync(root);
  const files = new Set();
  function add(relative, required = true) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) {
      if (required) throw new Error(`missing source snapshot input: ${relative}`);
      return;
    }
    const info = fs.lstatSync(file);
    if (info.isSymbolicLink()) throw new Error(`source snapshot cannot follow symlink: ${relative}`);
    if (info.isDirectory()) {
      for (const name of fs.readdirSync(file).sort()) {
        if (name === '__pycache__' || name === '.pytest_cache') continue;
        add(`${relative}/${name}`);
      }
    } else if (info.isFile() && !/\.(pyc|log|tmp)$/.test(relative)) files.add(relative);
  }
  for (const relative of SOURCE_DIRECTORIES.concat(SOURCE_FILES)) add(relative);
  const entries = [...files].sort().map(relative => ({ path: relative, sha256: digest(fs.readFileSync(path.join(root, relative))) }));
  return { algorithm: 'sha256-path-and-bytes-v1', sha256: digest(JSON.stringify(entries)), files: entries };
}

if (require.main === module) {
  try { console.log(JSON.stringify(sourceSnapshot(process.argv[2] || path.resolve(__dirname, '../..')), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { sourceSnapshot, SOURCE_DIRECTORIES, SOURCE_FILES };
