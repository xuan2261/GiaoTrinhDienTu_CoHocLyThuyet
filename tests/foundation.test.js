const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

// Mock Browser Context
const context = {
  console,
  performance: { now: () => Date.now() },
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 16),
  window: {
    addEventListener: () => {}
  },
  document: {
    createElement(tag) {
      return {
        tag,
        appendChild() {},
        addEventListener() {},
        classList: { add() {} },
        style: {},
        setAttribute() {},
        parentNode: { replaceChild() {} }
      };
    },
    getElementById() { return null; },
    querySelectorAll() { return []; }
  },
  Matter: {
    Engine: {
      create: () => ({ world: { gravity: {} } }),
      update: () => {}
    },
    Composite: { add: () => {} }
  }
};
context.window.window = context.window;
context.window.document = context.document;
context.window.Matter = context.Matter;
context.window.performance = context.performance;
context.window.requestAnimationFrame = context.requestAnimationFrame;

vm.createContext(context);

// Helper to load script into context
function loadScript(file) {
  const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
  vm.runInContext(code, context);
}

// 1. Test SimV2ID (Should fail initially because file doesn't exist)
console.log('Testing SimV2ID...');
try {
  loadScript('js/sim-v2-foundation.js');
  const SimV2ID = context.window.SimV2ID;
  assert.ok(SimV2ID, 'SimV2ID should be defined');
  const id1 = SimV2ID.next('marker');
  const id2 = SimV2ID.next('marker');
  assert.ok(id1.startsWith('marker-'), 'ID should have prefix');
  assert.notStrictEqual(id1, id2, 'IDs should be unique');
  console.log('SimV2ID: PASS');
} catch (err) {
  console.log('SimV2ID: FAIL', err.message);
}

// 2. Test SimulationEngine Fixed Step
console.log('Testing SimulationEngine Fixed Step...');
try {
  loadScript('js/sim-engine-v2.js');
  const SimulationEngine = context.window.SimulationEngine;
  
  let updateCount = 0;
  context.Matter.Engine.update = () => { updateCount++; };

  const engine = new SimulationEngine();
  engine.start();
  
  // Simulate 50ms passing
  engine.tick(performance.now() + 50);
  
  // With 16.66ms steps, 50ms should trigger 3 updates
  assert.ok(updateCount >= 3, `Should trigger at least 3 updates, got ${updateCount}`);
  engine.stop();
  console.log('SimulationEngine Fixed Step: PASS');
} catch (err) {
  console.log('SimulationEngine Fixed Step: FAIL', err.message);
}

// 3. Test loadSimScript
console.log('Testing loadSimScript...');
try {
  loadScript('js/loader.js');
  const loadSimScript = context.window.loadSimScript;
  assert.strictEqual(typeof loadSimScript, 'function', 'loadSimScript should be a function');
  console.log('loadSimScript: PASS');
} catch (err) {
  console.log('loadSimScript: FAIL', err.message);
}
