/**
 * Physics-source guard (Phase 01 TDD harness).
 *
 * Proves that route `derived()` readouts come from the shared SimPhysics
 * modules (RC1), not inline pixel heuristics. Loads behaviors in a vm context
 * exactly like tests/sim-review-2026-05-19/physics-invariants.test.js, then for
 * each in-scope route compares the derived physical quantity against the value
 * the shared module returns for the same inputs.
 *
 * State is compared RAW (float), never against formatted DOM strings, so
 * toFixed()/label remapping cannot mask a mismatch.
 *
 * RED until Phases 02/06 wire the shared modules. The browser guards in
 * sim-theory-fidelity.spec.js cover the lab-level readouts (e.g. ch2-4-4 a_e).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function loadShared() {
  const context = { console, window: {} };
  context.window.window = context.window;
  vm.createContext(context);
  ['js/sim-physics-statics.js', 'js/sim-physics-kinematics.js', 'js/sim-physics-dynamics.js']
    .forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), context, { filename: f }));
  return context.window;
}

function loadBehaviors(files, shared) {
  const behaviors = {};
  const context = {
    console,
    window: {
      SimPhysicsStatics: shared.SimPhysicsStatics,
      SimPhysicsKinematics: shared.SimPhysicsKinematics,
      SimPhysicsDynamics: shared.SimPhysicsDynamics,
      SimRouteBehaviors: { registerMany(entries) { Object.assign(behaviors, entries); } },
    },
  };
  context.window.window = context.window;
  vm.createContext(context);
  for (const file of files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
  }
  return behaviors;
}

const shared = loadShared();
const statics = shared.SimPhysicsStatics;
const behaviors = loadBehaviors([
  'js/sims/ch1/ch1-support-spatial-behaviors.js',
  'js/sims/ch2/ch2-kinematics-behaviors-b.js',
], shared);

const failures = [];
function expectGreen(cond, label) { if (!cond) failures.push(label); }

// ── ch1-4-1: spatial resultant must be ONE |R| from a true 3D vector sum ──────
// RC1/RC: current derived returns resultantMagnitude = hypot(spatialX,spatialY,
// spatialZ) of clamped pixel coords. A correct route builds a real force list
// (spatialForceComponents) and reduces it with resultant3D → single magnitude.
{
  const b = behaviors['ch1-4-1'];
  assert.ok(b && typeof b.derived === 'function', 'ch1-4-1 behavior present');
  const state = { routeId: 'ch1-4-1', force: 120, alpha: 30, primary: { x: 320, y: 180 } };
  const d = b.derived({ routeId: 'ch1-4-1' }, state);
  // The resultant must equal resultant3D of the force decomposition the route
  // exposes (dx,dy,dz are the component readouts). Pixel hypot of clamped
  // coords does not satisfy this once the route sums real force vectors.
  const expected = statics.resultant3D([{ Fx: d.dx, Fy: d.dy, Fz: d.dz }]).magnitude;
  // Guard against the "2 resultant" defect: there must be a single source of |R|.
  expectGreen(
    Number.isFinite(d.resultantMagnitude) && Math.abs(d.resultantMagnitude - expected) < 1e-6,
    `ch1-4-1: resultant must equal resultant3D(components)=${expected.toFixed(3)}, got ${d.resultantMagnitude}`
  );
  // The component readouts must themselves be a real force decomposition (N),
  // i.e. derived from spatialForceComponents(force, alpha, beta), not raw px.
  expectGreen(
    d.forceComponents && Number.isFinite(d.forceComponents.Fx),
    'ch1-4-1: derived must expose forceComponents {Fx,Fy,Fz} from spatialForceComponents'
  );
}

// ── ch1-4-4: spatial equilibrium residual must come from checkEquilibrium ─────
// RC3: current derived returns residual = |spatialX - spatialY|/100 (fabricated,
// never converges). A correct route sums a real force list via checkEquilibrium
// so a balanced configuration yields ΣF→0, ΣM→0.
{
  const b = behaviors['ch1-4-4'];
  assert.ok(b && typeof b.derived === 'function', 'ch1-4-4 behavior present');
  const state = { routeId: 'ch1-4-4', force: 100, alpha: 20, primary: { x: 300, y: 220 } };
  const d = b.derived({ routeId: 'ch1-4-4' }, state);
  // A real equilibrium model exposes signed sums, not a pixel-difference residual.
  expectGreen(
    Number.isFinite(d.sumFx) && Number.isFinite(d.sumFy) && Number.isFinite(d.sumM),
    'ch1-4-4: derived must expose ΣFx, ΣFy, ΣM from checkEquilibrium'
  );
  // At the balanced configuration the residual must vanish.
  if (typeof b.balancedState === 'function') {
    const balanced = b.balancedState({ routeId: 'ch1-4-4' });
    const db = b.derived({ routeId: 'ch1-4-4' }, balanced);
    expectGreen(
      Math.abs(db.residual || 0) < 1e-6,
      `ch1-4-4: balanced config residual must be ~0, got ${db.residual}`
    );
  } else {
    expectGreen(false, 'ch1-4-4: behavior must expose balancedState() for the equilibrium gate');
  }
}

// ── ch2-5-2: instant centre must be the velocity-normal intersection ──────────
// The IC is not a free-drag point: locateInstantCenter gives the rectangle
// corner so v_B ⟂ (B−IC), i.e. perpendicularResidual ≈ 0 (muc-V-2). A static
// snapshot — derived must produce IC without any tick.
{
  const b = behaviors['ch2-5-2'];
  assert.ok(b && typeof b.derived === 'function', 'ch2-5-2 behavior present');
  assert.ok(typeof b.onTick !== 'function', 'ch2-5-2 must NOT define onTick (static snapshot)');
  const d = b.derived({ routeId: 'ch2-5-2' }, { omega: 1.5, theta: 40 });
  expectGreen(
    Number.isFinite(d.perpendicularResidual) && d.perpendicularResidual < 1e-6,
    `ch2-5-2: v_B must be ⟂ (B−IC), perpendicularResidual=${d.perpendicularResidual}`
  );
  // IC must sit at the geometric corner (x = B.x, y = A.y), not a hand-placed point.
  expectGreen(
    Math.abs(d.icX - d.bx) < 1e-6 && Math.abs(d.icY - d.ay) < 1e-6,
    `ch2-5-2: IC must be the velocity-normal intersection, got (${d.icX},${d.icY})`
  );
}

if (failures.length) {
  console.error('physics-source guard RED (expected until Phase 02/06):');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('sim physics-source guard: PASS');
