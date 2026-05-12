/**
 * SimNew Physics — Constraint classes (Spring, Pin, Distance, Weld)
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

const Vec2 = root.SimNew ? root.SimNew.Vec2 : require('./simnew-physics-vec2-class');
const RigidBody = root.SimNew ? root.SimNew.RigidBody : require('./simnew-physics-rigid-body-class');

class Constraint {
  constructor() {
    this.enabled = true;
    this.stiffness = 1.0;
  }
  solve(world, dt) {}
  get label() { return 'Constraint'; }
}

/** Spring: connects two bodies (or one body + world anchor) */
class Spring extends Constraint {
  constructor(opts) {
    super();
    this.type = 'spring';
    this.bodyA = opts.bodyA;
    this.bodyB = opts.bodyB || null;
    this.k = opts.k || 0.5;
    this.damping = opts.damping || 0.05;
    this.restLen = opts.restLen || 100;
    this.anchorA = Vec2.of(opts.anchorA ? (opts.anchorA.x || 0) : 0, opts.anchorA ? (opts.anchorA.y || 0) : 0);
    this.anchorB = Vec2.of(opts.anchorB ? (opts.anchorB.x || 0) : 0, opts.anchorB ? (opts.anchorB.y || 0) : 0);
    this.label = 'Spring';
  }

  _worldAnchor(body, local) {
    if (!body) return Vec2.of(this.anchorB.x, this.anchorB.y);
    const c = Math.cos(body.angle), s = Math.sin(body.angle);
    return Vec2.of(
      body.pos.x + local.x * c - local.y * s,
      body.pos.y + local.x * s + local.y * c
    );
  }

  getPointA() { return this._worldAnchor(this.bodyA, this.anchorA); }
  getPointB() { return this._worldAnchor(this.bodyB, this.anchorB); }
  get length() { return this.getPointA().distTo(this.getPointB()); }

  solve(world, dt) {
    if (!this.enabled || this.bodyA.isStatic) return;
    const pA = this.getPointA();
    const pB = this.getPointB();
    const delta = pB.sub(pA);
    const dist = delta.mag();
    if (dist < 1e-6) return;

    const stretch = dist - this.restLen;
    const dir = delta.normalize();
    const springF = dir.scale(this.k * stretch);

    this.bodyA.applyForceVec(springF);
    if (this.bodyB && !this.bodyB.isStatic) {
      this.bodyB.applyForceVec(springF.scale(-1));
    }
  }

  get tension() {
    const d = this.getPointA().distTo(this.getPointB());
    return Math.abs(this.k * (d - this.restLen));
  }
}

/** Pin: pins a body point to a world position */
class Pin extends Constraint {
  constructor(opts) {
    super();
    this.type = 'pin';
    this.body = opts.body;
    this.worldPos = Vec2.of(opts.worldPos.x || 0, opts.worldPos.y || 0);
    this.localOffset = Vec2.of(
      opts.localOffset ? (opts.localOffset.x || 0) : 0,
      opts.localOffset ? (opts.localOffset.y || 0) : 0
    );
    this.label = 'Pin';
  }

  solve(world, dt) {
    if (!this.enabled || this.body.isStatic) return;
    const c = Math.cos(this.body.angle), s = Math.sin(this.body.angle);
    const current = Vec2.of(
      this.body.pos.x + this.localOffset.x * c - this.localOffset.y * s,
      this.body.pos.y + this.localOffset.x * s + this.localOffset.y * c
    );
    const error = this.worldPos.sub(current);
    const correction = error.scale(this.stiffness * this.body.invMass * 0.8);
    this.body.pos.addIP(correction);
    this.body.vel.x += (0 - this.body.vel.x) * 0.3;
    this.body.vel.y += (0 - this.body.vel.y) * 0.3;
  }
}

/** Distance: maintains fixed distance between two body points */
class Distance extends Constraint {
  constructor(opts) {
    super();
    this.type = 'distance';
    this.bodyA = opts.bodyA;
    this.bodyB = opts.bodyB || null;
    this.distance = opts.distance || 100;
    this.localA = Vec2.of(opts.localA ? (opts.localA.x || 0) : 0, opts.localA ? (opts.localA.y || 0) : 0);
    this.localB = Vec2.of(opts.localB ? (opts.localB.x || 0) : 0, opts.localB ? (opts.localB.y || 0) : 0);
    this.label = 'Distance';
  }

  _worldPt(body, local) {
    if (!body) return Vec2.of(this.localB.x, this.localB.y);
    const c = Math.cos(body.angle), s = Math.sin(body.angle);
    return Vec2.of(
      body.pos.x + local.x * c - local.y * s,
      body.pos.y + local.x * s + local.y * c
    );
  }

  solve(world, dt) {
    if (!this.enabled) return;
    const pA = this._worldPt(this.bodyA, this.localA);
    const pB = this._worldPt(this.bodyB, this.localB);
    const delta = pB.sub(pA);
    const dist = delta.mag();
    if (dist < 1e-6) return;
    const diff = (dist - this.distance) / dist;
    const corr = delta.scale(diff * 0.5 * this.stiffness);
    if (!this.bodyA.isStatic) this.bodyA.pos.addIP(corr.scale(this.bodyA.invMass));
    if (this.bodyB && !this.bodyB.isStatic) this.bodyB.pos.addIP(corr.scale(-this.bodyB.invMass));
  }
}

/** Weld: glues two bodies together */
class Weld extends Constraint {
  constructor(opts) {
    super();
    this.type = 'weld';
    this.bodyA = opts.bodyA;
    this.bodyB = opts.bodyB;
    this.localA = Vec2.of(opts.localA ? (opts.localA.x || 0) : 0, opts.localA ? (opts.localA.y || 0) : 0);
    this.localB = Vec2.of(opts.localB ? (opts.localB.x || 0) : 0, opts.localB ? (opts.localB.y || 0) : 0);
    this.label = 'Weld';
  }

  solve(world, dt) {
    if (!this.enabled) return;
    const dist = new Distance({ bodyA: this.bodyA, bodyB: this.bodyB, distance: 0, localA: this.localA, localB: this.localB });
    dist.stiffness = this.stiffness;
    dist.solve(world, dt);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Constraint, Spring, Pin, Distance, Weld };
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Constraint = Constraint;
  root.SimNew.Spring = Spring;
  root.SimNew.Pin = Pin;
  root.SimNew.Distance = Distance;
  root.SimNew.Weld = Weld;
}

})(typeof window !== 'undefined' ? window : this);
