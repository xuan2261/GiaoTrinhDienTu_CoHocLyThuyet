const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function setupContext() {
  const context = {
    console,
    performance: {
        now: () => Date.now()
    },
    window: {
      addEventListener() {},
      removeEventListener() {}
    },
    document: {
      head: {
        appendChild(el) {
          if (el.tagName === 'SCRIPT' && el.onload) {
            setTimeout(el.onload, 10);
          }
        }
      },
      createElement(tag) {
        return {
          tagName: tag.toUpperCase(),
          appendChild() {},
          addEventListener() {},
          setAttribute() {},
          style: {},
          src: '',
          onload: null
        };
      },
    },
    requestAnimationFrame(cb) {
        setTimeout(cb, 16);
    },
    setTimeout,
    clearTimeout
  };
  context.window.window = context.window;
  context.window.document = context.document;
  context.window.requestAnimationFrame = context.requestAnimationFrame;
  vm.createContext(context);
  
  // Load Matter.js
  const matterCode = fs.readFileSync(path.join(ROOT, 'lib/matter.min.js'), 'utf8');
  vm.runInContext(matterCode, context);
  
  return context;
}

async function testFixedStep() {
  console.log('Testing Fixed Step Accumulator...');
  const context = setupContext();
  const engineCode = fs.readFileSync(path.join(ROOT, 'js/sim-engine-v2.js'), 'utf8');
  vm.runInContext(engineCode, context);

  const engine = new context.window.SimulationEngine();
  
  // Mock Matter.Engine.update to track calls
  let updateCalls = 0;
  let lastDelta = 0;
  context.Matter.Engine.update = (mEngine, delta) => {
    updateCalls++;
    lastDelta = delta;
  };

  engine.isRunning = true;
  engine.lastTime = 0;
  
  // Scenario: 100ms passed. 100 / 16.666 = 6 ticks
  engine.tick(100);
  
  assert.strictEqual(updateCalls, 6, 'Should have updated 6 times for 100ms elapsed (fixed 16.66ms)');
  assert.strictEqual(Math.round(lastDelta), 17, 'Matter.js should receive fixed delta (approx 16.66ms)');
  
  // Remaining accumulator (100 - 6 * 16.666 = 0.004)
  // Scenario: Another 10ms passed. Total elapsed = 110ms. 110 / 16.666 = 6.6 ticks.
  // Still 6 total calls.
  engine.tick(110);
  assert.strictEqual(updateCalls, 6, 'Should not have updated again for only 10ms extra');
  
  // Scenario: Another 10ms passed. Total elapsed = 120ms. 120 / 16.666 = 7.2 ticks.
  // Should call 7th time.
  engine.tick(120);
  assert.strictEqual(updateCalls, 7, 'Should have updated a 7th time after 20ms total extra');
  
  console.log('✓ Fixed Step Accumulator passed');
}

async function testIDGen() {
    console.log('Testing SimV2ID Generation...');
    const context = setupContext();
    // We expect this file to be created in Step 1
    try {
        const foundationCode = fs.readFileSync(path.join(ROOT, 'js/sim-v2-foundation.js'), 'utf8');
        vm.runInContext(foundationCode, context);
    } catch (e) {
        throw new Error('Foundation script not found - implementing TDD');
    }

    const id1 = context.window.SimV2ID.next('marker');
    const id2 = context.window.SimV2ID.next('marker');
    const id3 = context.window.SimV2ID.next('arrow');

    assert.ok(id1.startsWith('marker-'), 'ID should start with prefix');
    assert.notStrictEqual(id1, id2, 'IDs should be unique');
    assert.ok(id3.startsWith('arrow-'), 'Different prefixes should work');
    console.log('✓ SimV2ID passed');
}

async function testLoaderLazyLoad() {
    console.log('Testing Loader Lazy Load...');
    const context = setupContext();
    const loaderCode = fs.readFileSync(path.join(ROOT, 'js/loader.js'), 'utf8');
    vm.runInContext(loaderCode, context);

    // We expect loadSimScript to be implemented
    if (typeof context.window.loadSimScript !== 'function') {
        throw new Error('loadSimScript not implemented in loader.js');
    }

    const promise = context.window.loadSimScript('ch1-1-1');
    assert.ok(promise instanceof Promise, 'loadSimScript should return a Promise');
    
    await promise;
    console.log('✓ Loader Lazy Load passed');
}

(async () => {
    try {
        await testFixedStep();
    } catch (e) {
        console.error('FAILED Fixed Step:', e.message);
    }

    try {
        await testIDGen();
    } catch (e) {
        console.error('FAILED ID Gen:', e.message);
    }

    try {
        await testLoaderLazyLoad();
    } catch (e) {
        console.error('FAILED Loader:', e.message);
    }
})();
