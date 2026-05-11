const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js')) {
      let c = fs.readFileSync(p, 'utf8');
      const newC = c.replace(/([a-zA-Z0-9_]+)\.className\s*=\s*['"](.*?)['"];/g, '$1.setAttribute(\'class\', \'$2\');');
      if (c !== newC) {
        fs.writeFileSync(p, newC);
        console.log('Updated ' + p);
      }
    }
  }
}

walk('js/routes');
walk('js/deprecated');
console.log('Done');
