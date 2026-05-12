/**
 * SimNew Animation — Tween: animate a value from/to with easing.
 */
(function(root) {
'use strict';

const Interpolator = root.SimNew
  ? root.SimNew.Interpolator
  : require('./simnew-animation-interpolator');

class Tween {
  /**
   * @param {Object} opts
   * @param {Object} opts.target - object to animate
   * @param {string} opts.property - property name on target
   * @param {number} opts.from
   * @param {number} opts.to
   * @param {number} opts.duration - ms
   * @param {string|Function} opts.easing - name or fn(t) => t
   * @param {Function} opts.onUpdate - fn(value, target)
   * @param {Function} opts.onComplete
   */
  constructor(opts) {
    opts = opts || {};
    this.target = opts.target || {};
    this.property = opts.property || '';
    this.from = opts.from;
    this.to = opts.to;
    this.duration = opts.duration || 1000;
    this.easingName = opts.easing || 'easeOut';
    this.onUpdate = opts.onUpdate || null;
    this.onComplete = opts.onComplete || null;

    this._elapsed = 0;
    this._running = false;
    this._reversed = false;
  }

  /** Start the tween */
  start() {
    this._elapsed = 0;
    this._running = true;
    return this;
  }

  /** Reverse from/to */
  reverse() {
    this._reversed = !this._reversed;
    const tmp = this.from;
    this.from = this.to;
    this.to = tmp;
    return this;
  }

  /** Update with delta time in ms */
  update(dt) {
    if (!this._running) return;

    this._elapsed += dt;
    const t = Math.min(1, this._elapsed / this.duration);

    const easingFn = typeof this.easingName === 'function'
      ? this.easingName
      : Interpolator.byName(this.easingName, t);

    const value = this.from + (this.to - this.from) * easingFn;

    if (this.property && this.target) {
      this.target[this.property] = value;
    }

    if (this.onUpdate) this.onUpdate(value, this.target);

    if (t >= 1) {
      this._running = false;
      if (this.property && this.target) {
        this.target[this.property] = this.to;
      }
      if (this.onComplete) this.onComplete(this.target);
    }
  }

  /** Stop without completing */
  stop() {
    this._running = false;
  }

  /** Reset to from value */
  reset() {
    this._elapsed = 0;
    this._running = false;
    if (this.property && this.target) {
      this.target[this.property] = this.from;
    }
  }

  isRunning() { return this._running; }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Tween;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Tween = Tween;
}

})(typeof window !== 'undefined' ? window : this);
