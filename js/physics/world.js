/**
 * SimNew Physics — PhysicsWorld
 * Manages bodies, constraints, and runs physics step.
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

const Vec2 = root.SimNew ? root.SimNew.Vec2 : require('./simnew-physics-vec2-class');
const RigidBody = root.SimNew ? root.SimNew.RigidBody : require('./simnew-physics-rigid-body-class');
const { Spring, Pin, Distance, Weld } = root.SimNew
  ? root.SimNew
  : require('./simnew-physics-spring-pin-distance-weld-constraints');
const { integrateEuler } = root.SimNew ? root.SimNew : require('./simnew-physics-euler-verlet-rk4-integrators');

class PhysicsWorld {
  constructor() {
    this.bodies = [];
    this.constraints = [];
    this.gravity = Vec2.of(0, 0);
    this.iterations = 3;
    this.damping = 0.99;
    this._nextId = 1;
  }

  addBody(opts) {
    opts = opts || {};
    if (!opts.id) opts.id = 'body_' + (this._nextId++);
    const body = new RigidBody(opts);
    this.bodies.push(body);
    return body;
  }

  removeBody(body) {
    const idx = this.bodies.indexOf(body);
    if (idx >= 0) this.bodies.splice(idx, 1);
    this.constraints = this.constraints.filter(c =>
      c.body !== body && c.bodyA !== body && c.bodyB !== body
    );
  }

  addConstraint(constraint) {
    this.constraints.push(constraint);
    return constraint;
  }

  removeConstraint(constraint) {
    const idx = this.constraints.indexOf(constraint);
    if (idx >= 0) this.constraints.splice(idx, 1);
  }

  clear() {
    this.bodies.length = 0;
    this.constraints.length = 0;
  }

  applyGravity() {
    if (this.gravity.magSq() < 1e-12) return;
    for (const b of this.bodies) {
      if (b.isStatic) continue;
      b.applyForceVec(this.gravity.scale(b.mass));
    }
  }

  integrate(dt, integratorFn) {
    integratorFn = integratorFn || integrateEuler;
    for (const b of this.bodies) { b.integrate(dt, integratorFn); }
  }

  solveConstraints() {
    for (let iter = 0; iter < this.iterations; iter++) {
      for (const c of this.constraints) {
        if (!c.enabled) continue;
        c.solve(this, null);
      }
    }
  }

  clampVelocities(maxSpeed) {
    maxSpeed = maxSpeed || 2000;
    for (const b of this.bodies) {
      if (b.isStatic) continue;
      if (b.speed() > maxSpeed) {
        const s = b.vel.normalize().scale(maxSpeed);
        b.vel.x = s.x; b.vel.y = s.y;
      }
      if (Math.abs(b.angularVel) > maxSpeed * 0.5) {
        b.angularVel = Math.sign(b.angularVel) * maxSpeed * 0.5;
      }
    }
  }

  step(dt, integratorFn) {
    dt = Math.min(dt, 0.033);
    this.applyGravity();
    this.integrate(dt, integratorFn);
    this.solveConstraints();
    this.clampVelocities();
    for (const b of this.bodies) { b.clearForces(); b.checkSleep(); }
  }

  getBody(id) { return this.bodies.find(b => b.id === id) || null; }
  getDynamicBodies() { return this.bodies.filter(b => !b.isStatic); }
  getBodiesByShape(shape) { return this.bodies.filter(b => b.shape === shape); }

  findCollisionPairs() {
    const pairs = [];
    const circles = this.getBodiesByShape('circle');
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const a = circles[i], b = circles[j];
        const dist = a.pos.distTo(b.pos);
        const minDist = a.radius + b.radius;
        if (dist < minDist) {
          pairs.push({ a, b, dist, minDist, penetration: minDist - dist });
        }
      }
    }
    return pairs;
  }

  resolveCollision(pair, restitution) {
    restitution = restitution !== undefined ? restitution : 0.8;
    const { a, b, penetration } = pair;
    if (a.isStatic && b.isStatic) return;
    const n = b.pos.sub(a.pos).normalize();
    const sep = n.scale(penetration * 0.5);
    if (!a.isStatic) a.pos.subIP(sep);
    if (!b.isStatic) b.pos.addIP(sep);
    const relVel = b.vel.sub(a.vel);
    const relVelN = relVel.dot(n);
    if (relVelN > 0) return;
    const e = restitution, invMassSum = a.invMass + b.invMass;
    const j = -(1 + e) * relVelN / invMassSum;
    const impulse = n.scale(j);
    if (!a.isStatic) a.applyImpulseVec(impulse.scale(-1));
    if (!b.isStatic) b.applyImpulseVec(impulse);
  }

  setGravity(gx, gy) { this.gravity = Vec2.of(gx, gy); }

  /** Set gravity in real m/s² — converts to px/s² (scale px/m) */
  setGravityReal(gx_mps2, gy_mps2, scale) {
    scale = scale || 50;
    this.gravity = Vec2.of(gx_mps2 * scale, gy_mps2 * scale);
  }

  serialize() {
    return {
      bodies: this.bodies.map(b => ({
        id: b.id, x: b.pos.x, y: b.pos.y,
        vx: b.vel.x, vy: b.vel.y,
        angle: b.angle, angularVel: b.angularVel,
        mass: b.mass, inertia: b.inertia
      })),
      gravity: { x: this.gravity.x, y: this.gravity.y }
    };
  }

  deserialize(data) {
    for (const bd of (data.bodies || [])) {
      const b = this.getBody(bd.id);
      if (!b) continue;
      b.pos.set(bd.x, bd.y);
      b.vel.set(bd.vx, bd.vy);
      b.angle = bd.angle; b.angularVel = bd.angularVel;
    }
    if (data.gravity) this.gravity = Vec2.of(data.gravity.x, data.gravity.y);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhysicsWorld;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.PhysicsWorld = PhysicsWorld;
}

})(typeof window !== 'undefined' ? window : this);
