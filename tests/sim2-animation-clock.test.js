'use strict';

const assert = require('assert');
const Clock = require('../js/sim2/core/animation-clock.js');

function makeClock(options) {
  const updates = [];
  const clock = Clock.createClock({
    stepSeconds: 1 / 60,
    maxFrameSeconds: 0.25,
    maxSubSteps: 15,
    update(dt, simulationTime) { updates.push({ dt, simulationTime }); },
    ...(options || {})
  });
  return { clock, updates };
}

for (const hz of [30, 60, 120, 144]) {
  const { clock, updates } = makeClock();
  for (let i = 0; i <= hz; i += 1) clock.advance(i * 1000 / hz);
  assert.strictEqual(updates.length, 60, `${hz} Hz must produce 60 fixed updates in one second`);
  assert.ok(Math.abs(clock.getSimulationTime() - 1) < 1e-12, `${hz} Hz simulation time`);
}

{
  const { clock, updates } = makeClock();
  assert.strictEqual(clock.advance(100), 0, 'first timestamp anchors without update');
  assert.strictEqual(clock.advance(116.6666667), 1, 'next timestamp drains one fixed step');
  assert.ok(Math.abs(updates[0].dt - 1 / 60) < 1e-12, 'fixed dt');
  assert.ok(Math.abs(updates[0].simulationTime - 1 / 60) < 1e-12, 'callback receives advanced time');
}

{
  const { clock, updates } = makeClock();
  clock.advance(0);
  clock.advance(500);
  assert.strictEqual(updates.length, 15, 'single frame is bounded by maxFrame/maxSubSteps');
  clock.resetTimestamp();
  clock.advance(2500);
  assert.strictEqual(updates.length, 15, 'resume anchor does not catch up paused wall time');
  clock.advance(3000);
  assert.strictEqual(updates.length, 30, 'post-resume frame remains bounded');
}

{
  const { clock, updates } = makeClock();
  clock.advance(0);
  assert.strictEqual(clock.advance(2000), 15, 'long stall bounded to 15 substeps');
  assert.strictEqual(updates.length, 15, 'stall never enters spiral of death');
  assert.strictEqual(clock.advance(1999), 0, 'non-monotonic timestamp ignored');
  assert.strictEqual(clock.advance(Number.NaN), 0, 'invalid timestamp ignored');
}

{
  const { clock, updates } = makeClock();
  for (let i = 0; i < 60; i += 1) assert.strictEqual(clock.stepOnce(), 1, 'one click is one step');
  assert.strictEqual(updates.length, 60, '60 clicks produce 60 updates');
  assert.ok(Math.abs(clock.getSimulationTime() - 1) < 1e-12, '60 clicks produce one simulated second');
}

{
  const { clock, updates } = makeClock();
  for (let i = 0; i < 10; i += 1) clock.stepOnce();
  clock.resetTimestamp();
  clock.advance(1000);
  clock.advance(1100);
  clock.resetTimestamp();
  clock.stepOnce();
  assert.strictEqual(updates.length, 17, 'mixed step/play/pause/step has exact update count');
  assert.ok(Math.abs(clock.getSimulationTime() - 17 / 60) < 1e-12, 'mixed simulation time is monotonic and exact');
  clock.resetSimulationTime();
  assert.strictEqual(clock.getSimulationTime(), 0, 'simulation time reset is exact');
}

console.log('sim2-animation-clock: PASS');
