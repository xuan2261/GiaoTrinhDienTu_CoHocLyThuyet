/**
 * SimNew Scene — ArrowNode, TrailNode, JointNode
 * Specialized scene nodes for vectors, motion trails, and constraint visualization.
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

const SceneNode = root.SimNew ? root.SimNew.SceneNode : require('./simnew-scene-graph-node-base');

/** ArrowNode: draws a vector arrow */
class ArrowNode extends SceneNode {
  /**
   * @param {Object} opts
   * @param {number} opts.x1 - start x
   * @param {number} opts.y1 - start y
   * @param {number} opts.x2 - end x
   * @param {number} opts.y2 - end y
   * @param {string} opts.color
   * @param {string} opts.label
   * @param {number} opts.lineWidth
   * @param {number} opts.glow - shadow blur px
   * @param {boolean} opts.dashed
   * @param {boolean} opts.ghost - semi-transparent for ghost preview
   */
  constructor(opts) {
    super(opts);
    this.x1 = opts.x1 || 0;
    this.y1 = opts.y1 || 0;
    this.x2 = opts.x2 || 100;
    this.y2 = opts.y2 || 0;
    this.color = opts.color || '#e74c3c';
    this.label = opts.label || '';
    this.lineWidth = opts.lineWidth || 2;
    this.glow = opts.glow || 0;
    this.dashed = !!opts.dashed;
    this.ghost = !!opts.ghost;
  }

  render(ctx) {
    if (!this.visible) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;

    if (this.glow > 0) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.glow;
    }

    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = this.lineWidth;

    if (this.dashed || this.ghost) {
      ctx.setLineDash(this.ghost ? [6, 4] : [6, 4]);
      ctx.globalAlpha *= this.ghost ? 0.5 : 1;
    }

    // Line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrowhead
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 5) {
      const angle = Math.atan2(dy, dx);
      const headLen = Math.min(14, len * 0.4);
      const headAngle = Math.PI / 7;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(angle - headAngle), y2 - headLen * Math.sin(angle - headAngle));
      ctx.lineTo(x2 - headLen * Math.cos(angle + headAngle), y2 - headLen * Math.sin(angle + headAngle));
      ctx.closePath();
      ctx.fill();
    }

    // Label
    if (this.label) {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.fillStyle = this.color;
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.label, mx, my - 4);
    }

    ctx.setLineDash([]);
    ctx.restore();
    this._dirty = false;
  }
}

/** TrailNode: renders a fading motion trail */
class TrailNode extends SceneNode {
  /**
   * @param {Object} opts
   * @param {number} opts.maxPoints
   * @param {string} opts.color
   * @param {number} opts.lineWidth
   * @param {number} opts.fadeStart - index to start fading from
   */
  constructor(opts) {
    super(opts);
    this.maxPoints = opts.maxPoints || 60;
    this.color = opts.color || '#e74c3c';
    this.lineWidth = opts.lineWidth || 2;
    this.fadeStart = opts.fadeStart || Math.floor(this.maxPoints * 0.3);
    this.points = [];
  }

  /** Add a world-space point to the trail */
  addPoint(x, y) {
    this.points.push({ x, y });
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
    this.markDirty();
  }

  /** Clear trail */
  clear() {
    this.points.length = 0;
    this.markDirty();
  }

  render(ctx) {
    if (!this.visible || this.points.length < 2) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < this.points.length; i++) {
      const p0 = this.points[i - 1];
      const p1 = this.points[i];
      const t = i / this.points.length;
      const alpha = t < 0.3 ? t / 0.3 : 1;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.lineWidth * t;
      ctx.globalAlpha = alpha * 0.7;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    ctx.restore();
    this._dirty = false;
  }
}

/** JointNode: visualizes constraints (spring coil, pin dot, distance link) */
class JointNode extends SceneNode {
  /**
   * @param {Object} opts
   * @param {string} opts.type - 'spring'|'pin'|'distance'|'anchor'
   * @param {Vec2} opts.p1 - point A
   * @param {Vec2} opts.p2 - point B
   * @param {string} opts.color
   * @param {number} opts.shrinkCoils - spring coil count
   */
  constructor(opts) {
    super(opts);
    this.type = opts.type || 'distance';
    this.p1 = opts.p1 || { x: 0, y: 0 };
    this.p2 = opts.p2 || { x: 100, y: 0 };
    this.color = opts.color || '#888';
    this.coilCount = opts.coilCount || 8;
  }

  render(ctx) {
    if (!this.visible) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1.5;

    if (this.type === 'spring') {
      _drawSpring(ctx, this.p1, this.p2, this.coilCount);
    } else if (this.type === 'pin') {
      ctx.beginPath();
      ctx.arc(this.p1.x, this.p1.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'anchor') {
      // Anchor triangle
      ctx.beginPath();
      ctx.moveTo(this.p1.x, this.p1.y);
      ctx.lineTo(this.p1.x - 8, this.p1.y + 10);
      ctx.lineTo(this.p1.x + 8, this.p1.y + 10);
      ctx.closePath();
      ctx.fill();
    } else {
      // Distance link
      ctx.beginPath();
      ctx.moveTo(this.p1.x, this.p1.y);
      ctx.lineTo(this.p2.x, this.p2.y);
      ctx.stroke();
    }

    ctx.restore();
    this._dirty = false;
  }
}

function _drawSpring(ctx, p1, p2, coils) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return;
  const nx = dx / len, ny = dy / len;
  const px = -ny, py = nx;
  const coilW = Math.min(8, len / (coils * 2));

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  for (let i = 0; i < coils; i++) {
    const t0 = (i * 2 + 1) / (coils * 2);
    const t1 = (i * 2 + 2) / (coils * 2);
    const cx0 = p1.x + nx * len * t0 + px * coilW * (i % 2 === 0 ? 1 : -1);
    const cy0 = p1.y + ny * len * t0 + py * coilW * (i % 2 === 0 ? 1 : -1);
    const cx1 = p1.x + nx * len * t1;
    const cy1 = p1.y + ny * len * t1;
    ctx.lineTo(cx0, cy0);
    ctx.lineTo(cx1, cy1);
  }
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ArrowNode, TrailNode, JointNode };
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.ArrowNode = ArrowNode;
  root.SimNew.TrailNode = TrailNode;
  root.SimNew.JointNode = JointNode;
}

})(typeof window !== 'undefined' ? window : this);
