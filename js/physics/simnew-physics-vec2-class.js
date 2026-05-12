/**
 * SimNew Physics — Vec2 class
 * Pixel-based 2D vector math.
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

class Vec2 {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  /** Create a new Vec2 instance */
  static of(x, y) { return new Vec2(x, y); }

  /** Create zero vector */
  static zero() { return new Vec2(0, 0); }

  /** Create from angle (radians) + magnitude */
  static fromAngle(angle, mag) {
    return new Vec2(mag * Math.cos(angle), mag * Math.sin(angle));
  }

  /** Create random unit vector */
  static random() {
    const a = Math.random() * Math.PI * 2;
    return Vec2.fromAngle(a, 1);
  }

  /** Clone this vector */
  clone() { return new Vec2(this.x, this.y); }

  /** Set x,y and return this (chainable) */
  set(x, y) { this.x = x; this.y = y; return this; }

  /** Add v and return new Vec2 */
  add(v) { return new Vec2(this.x + v.x, this.y + v.y); }

  /** Subtract v and return new Vec2 */
  sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }

  /** Scale by s, return new Vec2 */
  scale(s) { return new Vec2(this.x * s, this.y * s); }

  /** In-place add v */
  addIP(v) { this.x += v.x; this.y += v.y; return this; }

  /** In-place scale */
  scaleIP(s) { this.x *= s; this.y *= s; return this; }

  /** Dot product: this · v */
  dot(v) { return this.x * v.x + this.y * v.y; }

  /** 2D cross product (scalar): this × v */
  cross(v) { return this.x * v.y - this.y * v.x; }

  /** Magnitude (length) */
  mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }

  /** Squared magnitude (faster, for comparisons) */
  magSq() { return this.x * this.x + this.y * this.y; }

  /** Angle in radians (from +x axis, CCW) */
  angle() { return Math.atan2(this.y, this.x); }

  /** Angle in degrees */
  angleDeg() { return this.angle() * 180 / Math.PI; }

  /** Normalized (unit vector) */
  normalize() {
    const m = this.mag();
    return m > 1e-12 ? this.scale(1 / m) : new Vec2(0, 0);
  }

  /** Rotate by angle (radians), return new Vec2 */
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  /** Rotate 90° CCW, return new Vec2 */
  perp() { return new Vec2(-this.y, this.x); }

  /** Project this onto v, return new Vec2 */
  projectOnto(v) {
    const d = v.dot(v);
    if (d < 1e-12) return new Vec2(0, 0);
    return v.scale(this.dot(v) / d);
  }

  /** Reflect this vector about normal n, return new Vec2 */
  reflect(n) {
    return this.sub(n.scale(2 * this.dot(n)));
  }

  /** Linear interpolation toward v by t (0..1) */
  lerp(v, t) {
    return new Vec2(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t
    );
  }

  /** Clamp magnitude to max */
  clampMag(max) {
    const m = this.mag();
    return m > max ? this.normalize().scale(max) : this.clone();
  }

  /** Distance to v */
  distTo(v) { return this.sub(v).mag(); }

  /** Squared distance to v */
  distSqTo(v) { return this.sub(v).magSq(); }

  /** Equals check (with epsilon) */
  equals(v, eps) {
    eps = eps || 1e-9;
    return Math.abs(this.x - v.x) < eps && Math.abs(this.y - v.y) < eps;
  }

  /** String representation */
  toString() { return `Vec2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`; }

  /** Array destructuring */
  toArray() { return [this.x, this.y]; }

  /** Polar representation */
  toPolar() { return { r: this.mag(), theta: this.angle() }; }

  /** Static: magnitude of a vector */
  static mag(v) { return v.mag(); }

  /** Static: angle of a vector in degrees */
  static angleDeg(v) { return v.angleDeg(); }

  /** Static: distance between two vectors */
  static dist(a, b) { return a.distTo(b); }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Vec2;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Vec2 = Vec2;
}

})(typeof window !== 'undefined' ? window : this);
