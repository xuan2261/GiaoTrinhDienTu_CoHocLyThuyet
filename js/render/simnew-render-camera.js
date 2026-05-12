/**
 * SimNew Render — Camera (pan/zoom for canvas)
 */
(function(root) {
'use strict';

/** Simple 2D camera: pan + zoom */
class Camera {
  constructor(opts) {
    opts = opts || {};
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.zoom = opts.zoom || 1;
    this.width = opts.width || 760;
    this.height = opts.height || 440;
  }

  /** Apply camera transform to ctx */
  apply(ctx) {
    ctx.translate(this.x, this.y);
    ctx.scale(this.zoom, this.zoom);
  }

  /** Screen → world coordinates */
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.x) / this.zoom,
      y: (sy - this.y) / this.zoom
    };
  }

  /** World → screen coordinates */
  worldToScreen(wx, wy) {
    return {
      x: wx * this.zoom + this.x,
      y: wy * this.zoom + this.y
    };
  }

  /** Pan by delta (pixels) */
  pan(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /** Zoom centered on screen point (sx, sy) */
  zoomAt(factor, sx, sy) {
    const wx = (sx - this.x) / this.zoom;
    const wy = (sy - this.y) / this.zoom;
    this.zoom = Math.max(0.25, Math.min(4, this.zoom * factor));
    this.x = sx - wx * this.zoom;
    this.y = sy - wy * this.zoom;
  }

  /** Zoom centered on canvas center */
  zoomCenter(factor) {
    const cx = this.width / 2, cy = this.height / 2;
    this.zoomAt(factor, cx, cy);
  }

  /** Reset to origin */
  reset() {
    this.x = 0; this.y = 0; this.zoom = 1;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Camera;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Camera = Camera;
}

})(typeof window !== 'undefined' ? window : this);
