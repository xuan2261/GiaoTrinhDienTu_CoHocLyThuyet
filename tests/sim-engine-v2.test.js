const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const context = {
  console,
  window: {},
  document: {
    createElement(tag) {
      return {
        tagName: tag.toUpperCase(),
        appendChild() {},
        addEventListener() {},
        setAttribute() {},
        style: {},
      };
    },
  },
  requestAnimationFrame(cb) {
    setTimeout(cb, 16);
  },
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);

// Load Matter.js
const matterCode = fs.readFileSync(path.join(ROOT, 'lib/matter.min.js'), 'utf8');
vm.runInContext(matterCode, context);

// Test Instantiation (will fail because js/sim-engine-v2.js doesn't exist yet)
try {
  const engineCode = fs.readFileSync(path.join(ROOT, 'js/sim-engine-v2.js'), 'utf8');
  vm.runInContext(engineCode, context);
} catch (e) {
  console.log('EXPECTED FAILURE: js/sim-engine-v2.js not found');
}

if (context.window.SimulationEngine) {
  const engine = new context.window.SimulationEngine();
  assert.ok(engine.matterEngine, 'Matter engine should be initialized');
  console.log('✓ Instantiation passed');

  // Test addBody
  const body = context.Matter.Bodies.rectangle(100, 200, 50, 50);
  const element = context.document.createElement('g');
  let transformValue = '';
  element.setAttribute = (name, value) => {
    if (name === 'transform') transformValue = value;
  };
  
  engine.addBody(body, element);
  assert.strictEqual(engine.bodies.length, 1, 'Body should be added');
  console.log('✓ addBody passed');

  // Test sync
  engine.defaultSync(body, element);
  assert.strictEqual(transformValue, 'translate(100, 200) rotate(0)', 'Initial transform should match body position');
  console.log('✓ defaultSync passed');

  console.log('Matter version:', context.Matter.version);
  console.log('Gravity Y:', engine.world.gravity.y);

  // Test tick (physics update)
  engine.isRunning = true;
  engine.lastTime = 0;
  console.log('Y before:', body.position.y);
  for(let i=1; i<=10; i++) {
    engine.tick(i * 16); 
  }
  console.log('Y after 10 ticks:', body.position.y);
  
  // After a tick with gravity, the body should have moved down (Y increases in Matter.js default)
  assert.ok(body.position.y > 200, 'Body should move down after tick with gravity');
  engine.defaultSync(body, element);
  assert.notStrictEqual(transformValue, 'translate(100, 200) rotate(0)', 'Transform should update after physics tick');
  console.log('✓ physics tick sync passed');

  // Test flipY
  const engineFlip = new context.window.SimulationEngine({ flipY: true, viewHeight: 500 });
  const body2 = context.Matter.Bodies.rectangle(100, 100, 50, 50);
  const element2 = context.document.createElement('g');
  let transformFlip = '';
  element2.setAttribute = (name, value) => {
    if (name === 'transform') transformFlip = value;
  };
  engineFlip.defaultSync(body2, element2);
  // viewHeight(500) - y(100) = 400
  assert.strictEqual(transformFlip, 'translate(100, 400) rotate(0)', 'flipY should invert Y coordinate');
  console.log('✓ flipY passed');

  console.log('ALL Phase 02 functional tests passed');
} else {
  console.error('SimulationEngine NOT found in window');
  process.exit(1);
}
