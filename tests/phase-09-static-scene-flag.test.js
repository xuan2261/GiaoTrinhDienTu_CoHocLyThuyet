/**
 * Phase 09 → Phase 03 — concept-diagram routes carry the `static: true` flag.
 *
 * For the routes that intentionally lack temporal evolution (slider-only
 * concept diagrams, FBDs, theorem selectors), the scene metadata must declare
 * `static: true` so the production reader (`js/sim-professional-lab.js`) can
 * suppress the misleading Play button.
 *
 * Three of those 7 also need engine ticks for time-derived readouts and so
 * carry `tickWithoutButton: true` (Phase 03 sub-mode B).
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function loadCh3Registry() {
  const sandbox = { console, window: {} };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'sim-scene-registry.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'sims', 'ch3', 'ch3-dynamics-all-18-scenes.js'), 'utf8'), sandbox);
  return sandbox.window.SimSceneRegistry;
}

function loadCh2Registry() {
  const sandbox = { console, window: {} };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'sim-scene-registry.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'sims', 'ch2', 'ch2-kinematics-scenes.js'), 'utf8'), sandbox);
  return sandbox.window.SimSceneRegistry;
}

const STATIC_CH3 = ['ch3-1-3', 'ch3-2-3', 'ch3-2-5', 'ch3-4-1', 'ch3-6-3'];
const TICK_WITHOUT_BUTTON_CH3 = ['ch3-1-3', 'ch3-2-3', 'ch3-6-3'];

const ch3 = loadCh3Registry();
for (const routeId of STATIC_CH3) {
  const scene = ch3.get(routeId);
  assert.ok(scene, `[ch3 scene catalog] ${routeId} must be registered`);
  assert.strictEqual(
    scene.static,
    true,
    `[ch3 scene catalog] ${routeId} must carry scene.static === true`
  );
}
for (const routeId of TICK_WITHOUT_BUTTON_CH3) {
  const scene = ch3.get(routeId);
  assert.strictEqual(
    scene.tickWithoutButton,
    true,
    `[ch3 scene catalog] ${routeId} must carry scene.tickWithoutButton === true (Phase 03 sub-mode B)`
  );
}

// ch3-2-2 is the positive-control: an animated route that must NOT carry static.
{
  const scene = ch3.get('ch3-2-2');
  assert.ok(scene, '[ch3 scene catalog] ch3-2-2 must be registered');
  assert.notStrictEqual(
    scene.static,
    true,
    '[ch3 scene catalog] ch3-2-2 (animated control) must NOT carry static'
  );
}

const ch2 = loadCh2Registry();

// Phase 07 — ch2-5-2 / ch2-5-3 reclassified intentional-static after journal review.
// ch2-5-2: Option A (static, no engine).
// ch2-5-3: Option C (static + removed from appendTime allowlist).
{
  const scene = ch2.get('ch2-5-2');
  assert.ok(scene, '[ch2 scene catalog] ch2-5-2 must be registered');
  assert.strictEqual(
    scene.static,
    true,
    '[ch2 scene catalog] ch2-5-2 must carry scene.static === true (Phase 07 — instantaneous concept)'
  );
}
{
  const scene = ch2.get('ch2-5-3');
  assert.ok(scene, '[ch2 scene catalog] ch2-5-3 must be registered');
  assert.strictEqual(
    scene.static,
    true,
    '[ch2 scene catalog] ch2-5-3 must carry scene.static === true (Phase 07 — velocity distribution at an instant)'
  );
  const policy = scene.readoutPolicy || {};
  const appendTime = policy.appendTime;
  if (Array.isArray(appendTime)) {
    assert.ok(
      !appendTime.includes('ch2-5-3'),
      '[ch2 scene catalog] appendTime must not include ch2-5-3 (Phase 07 sub-mode C)'
    );
  } else {
    assert.notStrictEqual(
      appendTime,
      true,
      '[ch2 scene catalog] ch2-5-3 readoutPolicy.appendTime must be falsy'
    );
  }
}

// Animated control: ch2-1-1 (trajectory) must not carry static.
{
  const scene = ch2.get('ch2-1-1');
  assert.ok(scene, '[ch2 scene catalog] ch2-1-1 must be registered');
  assert.notStrictEqual(
    scene.static,
    true,
    '[ch2 scene catalog] ch2-1-1 (animated control) must NOT carry static'
  );
}

console.log('phase-09-static-scene-flag.test.js: PASS');
