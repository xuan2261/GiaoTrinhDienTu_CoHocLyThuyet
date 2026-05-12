/**
 * SimNew Physics — RigidBody class
 * Pixel-based 2D rigid body with position, velocity, angle, forces.
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

const Vec2 = root.SimNew ? root.SimNew.Vec2 : require('./simnew-physics-vec2-class');

class RigidBody {
  /**
   * @param {Object} opts
   * @param {number} opts.x  - initial x position (px)
   * @param {number} opts.y  - initial y position (px)
   * @param {number} opts.mass - mass (kg, default 1)
   * @param {number} opts.inertia - moment of inertia (default auto: mass*10)
   * @param {string} opts.shape - 'circle'|'rect'|'point' (default 'point')
   * @param {number} opts.radius - for circle shape (default 20)
   * @param {number} opts.width - for rect shape
   * @param {number} opts.height - for rect shape
   * @param {boolean} opts.isStatic - static body (infinite mass, fixed)
   */
  constructor(opts) {
    opts = opts || {};
    this.id = opts.id || ('body_' + Math.random().toString(36).slice(2, 9));

    this.pos = Vec2.of(opts.x || 0, opts.y || 0);
    this.vel = Vec2.of(opts.vx || 0, opts.vy || 0);
    this.angle = opts.angle || 0;
    this.angularVel = opts.angularVel || 0;

    this.mass = opts.mass || 1;
    this.invMass = opts.isStatic ? 0 : (this.mass > 0 ? 1 / this.mass : 0);

    const r = opts.radius || 10;
    this.inertia = opts.inertia || (opts.isStatic ? Infinity : this.mass * r * r);
    this.invInertia = opts.isStatic ? 0 : (this.inertia > 0 ? 1 / this.inertia : 0);

    this.shape = opts.shape || 'point';
    this.radius = opts.radius || 20;
    this.width = opts.width || 40;
    this.height = opts.height || 20;

    this._force = Vec2.zero();
    this._torque = 0;
    this.isStatic = !!opts.isStatic;
    this.isAwake = true;
    this.sleepThreshold = 0.1;
    this.label = opts.label || '';
    this.color = opts.color || '#e74c3c';
    this.opacity = 1;
  }

  applyForce(fx, fy) {
    if (this.isStatic) return;
    this._force.x += fx;
    this._force.y += fy;
  }

  applyForceAt(fx, fy, px, py) {
    if (this.isStatic) return;
    this._force.x += fx;
    this._force.y += fy;
    const rx = px - this.pos.x;
    const ry = py - this.pos.y;
    this._torque += rx * fy - ry * fx;
  }

  applyForceVec(force) {
    if (this.isStatic) return;
    this._force.addIP(force);
  }

  applyTorque(t) {
    if (this.isStatic) return;
    this._torque += t;
  }

  applyImpulse(jx, jy) {
    if (this.isStatic) return;
    this.vel.x += this.invMass * jx;
    this.vel.y += this.invMass * jy;
  }

  applyImpulseVec(impulse) {
    if (this.isStatic) return;
    this.vel.addIP(impulse.scale(this.invMass));
  }

  clearForces() {
    this._force.x = 0; this._force.y = 0; this._torque = 0;
  }

  get force() { return this._force; }
  get torque() { return this._torque; }

  integrate(dt, integratorFn) {
    if (this.isStatic || !this.isAwake) return;
    integratorFn(this, dt);
  }

  kineticEnergy() {
    const t = 0.5 * this.mass * this.vel.magSq();
    const r = 0.5 * this.inertia * this.angularVel * this.angularVel;
    return t + r;
  }

  momentum() { return this.vel.scale(this.mass); }
  angularMomentum() { return this.inertia * this.angularVel; }
  speed() { return this.vel.mag(); }

  setPosition(x, y) { this.pos.set(x, y); return this; }
  translate(dx, dy) { this.pos.x += dx; this.pos.y += dy; return this; }
  setVelocity(vx, vy) { this.vel.set(vx, vy); return this; }
  setAngle(a) { this.angle = a; return this; }
  rotateBy(da) { this.angle += da; return this; }

  getBounds() {
    if (this.shape === 'circle') {
      return { left: this.pos.x - this.radius, right: this.pos.x + this.radius,
               top: this.pos.y - this.radius, bottom: this.pos.y + this.radius };
    }
    const hw = (this.width || 40) / 2, hh = (this.height || 20) / 2;
    return { left: this.pos.x - hw, right: this.pos.x + hw,
             top: this.pos.y - hh, bottom: this.pos.y + hh };
  }

  collidesWith(other) {
    if (this.shape !== 'circle' || other.shape !== 'circle') return false;
    return this.pos.distSqTo(other.pos) <= (this.radius + other.radius) ** 2;
  }

  contactNormal(other) { return other.pos.sub(this.pos).normalize(); }

  contactPoint(other) {
    return this.pos.add(this.contactNormal(other).scale(this.radius));
  }

  checkSleep() {
    if (this.isStatic) return;
    if (this.speed() < this.sleepThreshold && Math.abs(this.angularVel) < this.sleepThreshold * 0.1) {
      this.isAwake = false; this.vel.set(0, 0); this.angularVel = 0;
    } else {
      this.isAwake = true;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RigidBody;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.RigidBody = RigidBody;
}

})(typeof window !== 'undefined' ? window : this);
