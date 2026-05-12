const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const PHASE_08_ROUTES = ['ch2-4-1', 'ch2-4-2', 'ch2-4-3', 'ch2-4-4', 'ch2-5-1', 'ch2-5-2', 'ch2-5-3'];

function runScript(context, file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
}

function contextWithBehaviorRegistry(files = ['js/sims/ch2/ch2-kinematics-behaviors-b.js']) {
  const context = { console, window: {} };
  context.window.window = context.window;
  vm.createContext(context);
  runScript(context, 'js/sim-route-behavior-registry.js');
  files.forEach(file => runScript(context, file));
  return context;
}

function mag(vector) {
  return Math.hypot(vector.vx || 0, vector.vy || 0);
}

{
  const context = contextWithBehaviorRegistry();
  for (const route of PHASE_08_ROUTES) {
    assert.ok(context.window.SimRouteBehaviors.get(route), `${route} must register a behavior`);
  }
}

{
  const context = contextWithBehaviorRegistry(['js/sims/ch2/ch2-kinematics-behaviors-a.js']);
  const behavior = context.window.SimRouteBehaviors.get('ch2-1-3');
  const state = { omega: 2, rho: 150, t: 0 };
  behavior.onTick({ routeId: 'ch2-1-3' }, state, 0);
  assert.ok(Math.abs(state.rho - 150) < 1e-9, 'natural-coordinate rho slider must drive path radius');
  assert.ok(Math.abs(state.px - 500) < 1e-9, 'natural-coordinate point must use rho as radius');
  assert.ok(Math.abs(state.an - 600) < 1e-9, 'natural-coordinate normal acceleration must use slider radius');
}

{
  const context = contextWithBehaviorRegistry();
  for (const route of ['ch2-4-1', 'ch2-4-2', 'ch2-4-3']) {
    const behavior = context.window.SimRouteBehaviors.get(route);
    const state = { omega: 1.35, ve: { vx: 48, vy: -12 }, vr: { vx: 24, vy: 36 } };
    behavior.onTick({ routeId: route }, state, 0.25, 0.25);
    assert.ok(state.ve && state.vr && state.va, `${route} must expose ve, vr, and va vectors`);
    assert.ok(Math.abs(state.va.vx - state.ve.vx - state.vr.vx) < 1e-9, `${route} va.x must equal ve.x + vr.x`);
    assert.ok(Math.abs(state.va.vy - state.ve.vy - state.vr.vy) < 1e-9, `${route} va.y must equal ve.y + vr.y`);
    assert.ok(Math.abs(state.vaMag - mag(state.va)) < 1e-9, `${route} vaMag must match |va|`);
  }
}

{
  const context = contextWithBehaviorRegistry();
  const behavior = context.window.SimRouteBehaviors.get('ch2-4-4');
  const state = { omega: 1.8, px: 360, py: 180, vrMag: 50, vrAngle: Math.atan2(40, 30) };
  behavior.onTick({ routeId: 'ch2-4-4' }, state, 0.1, 0.1);
  const expected = 2 * state.omega * Math.hypot(state.vr.vx, state.vr.vy);
  assert.ok(Math.abs(state.coriolis - expected) < 1e-9, 'Coriolis magnitude must be 2*omega*|vr|');
  assert.ok(Math.abs(mag(state.vr) - 50) < 1e-9, 'Coriolis route must use vrMag slider value');
  assert.ok(Math.abs(state.ac.vx + 2 * state.omega * state.vr.vy) < 1e-9, 'Coriolis x must be perpendicular to vr');
  assert.ok(Math.abs(state.ac.vy - 2 * state.omega * state.vr.vx) < 1e-9, 'Coriolis y must be perpendicular to vr');
}

{
  const context = contextWithBehaviorRegistry();
  const behavior = context.window.SimRouteBehaviors.get('ch2-5-1');
  const state = { omega: 1.4, bx: 440, by: 150 };
  behavior.onTick({ routeId: 'ch2-5-1' }, state, 0.2, 0.2);
  assert.ok(state.vA && state.vB && state.vBA, 'plane motion must expose vA, vB, and vBA');
  assert.ok(Math.abs(state.vB.vx - state.vA.vx - state.vBA.vx) < 1e-9, 'vB.x must equal vA.x + vBA.x');
  assert.ok(Math.abs(state.vB.vy - state.vA.vy - state.vBA.vy) < 1e-9, 'vB.y must equal vA.y + vBA.y');
  assert.ok(Math.abs(state.vAMag - mag(state.vA)) < 1e-9, 'plane motion must expose vAMag readout key');
  assert.ok(Math.abs(state.vBMag - mag(state.vB)) < 1e-9, 'plane motion must expose vBMag readout key');
}

{
  const context = contextWithBehaviorRegistry();
  const state = { omega: 1.2, icX: 210, icY: 260, bx: 360, by: 190 };
  context.window.SimRouteBehaviors.get('ch2-5-2').onTick({ routeId: 'ch2-5-2' }, state, 0.2, 0.2);
  const rx = state.bx - state.icX;
  const ry = state.by - state.icY;
  assert.ok(state.vB, 'instant center route must expose vB');
  assert.ok(Math.abs(state.vB.vx + state.omega * ry) < 1e-9, 'IC vB.x must be -omega*rY');
  assert.ok(Math.abs(state.vB.vy - state.omega * rx) < 1e-9, 'IC vB.y must be omega*rX');
}

{
  const context = contextWithBehaviorRegistry();
  const behavior = context.window.SimRouteBehaviors.get('ch2-5-3');
  const state = { omega: 1.5, L: 180, barAngle: Math.PI / 6 };
  behavior.onTick({ routeId: 'ch2-5-3' }, state, 0.1);
  assert.ok(Math.abs(state.L - 180) < 1e-9, 'velocity-distribution L slider must stay canonical');
  assert.ok(Math.abs(Math.hypot(state.bx - state.ax, state.by - state.ay) - 180) < 1e-9,
    'velocity-distribution endpoint geometry must be derived from L');
  assert.ok(Math.abs(state.vBMag - 270) < 1e-9, 'velocity-distribution vB must update from L and omega');
}

{
  const context = contextWithBehaviorRegistry();
  const state = { omega: 1.1, ex: 368, ey: 210 };
  context.window.SimRouteBehaviors.get('ch2-5-3').onTick({ routeId: 'ch2-5-3' }, state, 0.2, 0.2);
  assert.ok(Array.isArray(state.velocitySamples), 'velocity distribution must expose sample vectors');
  assert.strictEqual(state.velocitySamples.length, 5, 'velocity distribution must sample five body points');
  assert.ok(Math.abs(state.vBMag - mag(state.vB)) < 1e-9, 'velocity distribution must expose vBMag readout key');
  for (let i = 1; i < state.velocitySamples.length; i++) {
    assert.ok(state.velocitySamples[i].speed >= state.velocitySamples[i - 1].speed, 'sample speed must increase with radius');
  }
}

console.log('phase-08-tdd: PASS');
