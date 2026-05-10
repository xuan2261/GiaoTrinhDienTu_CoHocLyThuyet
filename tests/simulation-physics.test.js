const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const context = {
  console,
  window: {},
  document: {
    createElement() {
      return {
        appendChild() {},
        addEventListener() {},
        classList: { add() {} },
        style: {},
      };
    },
  },
};
context.window.window = context.window;
context.window.document = context.document;
context.window.SimCore = { COLORS: {}, dist: Math.hypot };
vm.createContext(context);
for (const script of [
  'js/sim-physics-statics.js',
  'js/sim-physics-kinematics.js',
  'js/sim-physics-dynamics.js',
]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, script), 'utf8'), context);
}
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/sim-professional-lab.js'), 'utf8'), context);

function approx(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected}, got ${actual}`
  );
}

const physics = context.window.SimProfessionalLab.physics;
const statics = context.window.SimPhysicsStatics;
const kinematics = context.window.SimPhysicsKinematics;
const dynamics = context.window.SimPhysicsDynamics;

assert.ok(physics, 'professional lab physics helpers must be exported');
assert.strictEqual(context.window.SimProfessionalLab.helpers.statics, statics);
assert.strictEqual(context.window.SimProfessionalLab.helpers.kinematics, kinematics);
assert.strictEqual(context.window.SimProfessionalLab.helpers.dynamics, dynamics);

assert.strictEqual(physics.forceAcceleration(120, 8), 15);
assert.strictEqual(physics.beamReaction(100, 0.25).ra, 75);
assert.strictEqual(physics.beamReaction(100, 0.25).rb, 25);
assert.ok(Math.abs(physics.frictionMargin(20, 0.4) - (0.4 - Math.tan(20 * Math.PI / 180))) < 1e-9);
const collision = physics.elasticCollision1d(2, 3, 4, -1, 1);
assert.strictEqual(collision.v1, -2);
assert.strictEqual(collision.v2, 3);
assert.strictEqual(physics.transmissionOmega(2, 60, 40), 3);

const components = statics.resolveForceComponents(100, 45);
approx(components.fx, Math.SQRT1_2 * 100, 1e-9, 'resolveForceComponents.fx');
approx(components.fy, Math.SQRT1_2 * 100, 1e-9, 'resolveForceComponents.fy');
approx(statics.computeMoment(100, 50, 90), 5000, 1e-9, 'computeMoment');
const reactions = statics.beamReactions(100, 50, 200);
approx(reactions.ra, 75, 1e-9, 'beamReactions.ra');
approx(reactions.rb, 25, 1e-9, 'beamReactions.rb');
approx(statics.frictionNormal(0.3, 98), 29.4, 1e-9, 'frictionNormal');

const ellipse = kinematics.ellipsePoint(150, 100, Math.PI / 4, 280, 170);
approx(ellipse.x, 280 + 150 * Math.SQRT1_2, 1e-9, 'ellipsePoint.x');
approx(ellipse.y, 170 + 100 * Math.SQRT1_2, 1e-9, 'ellipsePoint.y');
assert.strictEqual(kinematics.tangentialVelocity(2, 50), 100);
assert.strictEqual(kinematics.gearRatio(20, 40), 0.5);
assert.strictEqual(kinematics.coriolisAcceleration(1, 50), 100);
approx(
  kinematics.sliderCrankPos(50, 200, Math.PI / 3),
  25 + Math.sqrt(200 * 200 - 50 * 50 * 0.75),
  1e-9,
  'sliderCrankPos'
);

assert.strictEqual(dynamics.accelerationFromForce(100, 10), 10);
const restitution = dynamics.restitutionVelocity(1, 1, 10, 0, 1);
approx(restitution.v1, 0, 1e-9, 'restitutionVelocity.v1');
approx(restitution.v2, 10, 1e-9, 'restitutionVelocity.v2');
assert.strictEqual(dynamics.kineticEnergy(2, 5), 25);
assert.strictEqual(dynamics.springEnergy(100, 0.2), 2);
assert.strictEqual(dynamics.momentOfInertiaDisk(2, 0.5), 0.25);
const rk4 = dynamics.rk4Step({ x: 1, v: 0 }, 0.1, state => ({ dx: state.v, dv: -state.x }));
approx(rk4.x, Math.cos(0.1), 1e-5, 'rk4Step.x');
approx(rk4.v, -Math.sin(0.1), 1e-5, 'rk4Step.v');

console.log('simulation-physics: PASS');
