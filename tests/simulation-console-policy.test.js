'use strict';

const assert = require('assert');
const { fatalConsoleMessage } = require('../tools/sim-validation/browser-console-policy.js');

assert.strictEqual(fatalConsoleMessage('log', 'ready'), null);
assert.strictEqual(fatalConsoleMessage('info', 'mounted'), null);
assert.strictEqual(
  fatalConsoleMessage('warning', '[.WebGL-0x123]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels'),
  null
);
assert.strictEqual(
  fatalConsoleMessage('warning', 'LaTeX-incompatible input'),
  'warning: LaTeX-incompatible input'
);
assert.strictEqual(fatalConsoleMessage('error', 'render failed'), 'error: render failed');

console.log('simulation-console-policy: PASS');
