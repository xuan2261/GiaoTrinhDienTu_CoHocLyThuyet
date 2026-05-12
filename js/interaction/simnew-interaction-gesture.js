/**
 * SimNew Interaction — Gesture: pan (1-finger), pinch-zoom (2-finger).
 * Works with InteractionManager pointer data.
 */
(function(root) {
'use strict';

class Gesture {
  /**
   * @param {Object} opts
   * @param {Function} opts.onPan - fn(dx, dy)
   * @param {Function} opts.onZoom - fn(factor, cx, cy)
   * @param {number} opts.pinchThreshold - min distance change to trigger zoom (default 5)
   */
  constructor(opts) {
    opts = opts || {};
    this.onPan = opts.onPan || null;
    this.onZoom = opts.onZoom || null;
    this.pinchThreshold = opts.pinchThreshold || 5;

    this._active = false;
    this._panStart = null;
    this._lastPointers = null;
    this._initialPinchDist = 0;
    this._initialZoom = 1;
  }

  /** Feed pointer data from InteractionManager */
  update(pointers, cx, cy) {
    const count = pointers.size;
    if (count === 0) {
      this._active = false;
      this._panStart = null;
      this._lastPointers = null;
      return;
    }

    if (count === 1) {
      // Pan
      const ptr = [...pointers.values()][0];
      const px = ptr.x, py = ptr.y;

      if (!this._panStart) {
        this._panStart = { x: px, y: py };
      } else {
        const dx = px - this._panStart.x;
        const dy = py - this._panStart.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          this._active = true;
        }
        if (this._active && this.onPan) {
          this.onPan(dx, dy);
        }
        this._panStart = { x: px, y: py };
      }
      this._lastPointers = [...pointers.values()];
    } else if (count >= 2) {
      // Pinch-zoom
      const pts = [...pointers.values()];
      const p0 = pts[0], p1 = pts[1];
      const dist = Math.sqrt(
        Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)
      );

      if (this._initialPinchDist === 0) {
        this._initialPinchDist = dist;
      }

      const delta = dist - this._initialPinchDist;
      if (Math.abs(delta) >= this.pinchThreshold) {
        const factor = dist / this._initialPinchDist;
        this._active = true;
        if (this.onZoom) {
          // Use midpoint between two fingers
          const mx = (p0.x + p1.x) / 2;
          const my = (p0.y + p1.y) / 2;
          this.onZoom(factor, mx, my);
        }
        this._initialPinchDist = dist;
      }

      this._lastPointers = pts;
    }
  }

  reset() {
    this._active = false;
    this._panStart = null;
    this._lastPointers = null;
    this._initialPinchDist = 0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Gesture;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Gesture = Gesture;
}

})(typeof window !== 'undefined' ? window : this);
