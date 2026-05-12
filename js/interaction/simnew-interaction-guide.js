/**
 * SimNew Interaction — Guide: snap-to-grid, snap-to-angle, snap-to-point.
 * Visual guides + magnetic snapping during drag operations.
 */
(function(root) {
'use strict';

const Guide = root.Guide || class Guide {
  constructor(opts) {
    opts = opts || {};
    this.snapEnabled = opts.snapEnabled !== undefined ? opts.snapEnabled : true;
    this.snapThreshold = opts.snapThreshold || 8; // px
    this.snapX = null; // fn(wx) => snapped wx
    this.snapY = null; // fn(wy) => snapped wy
    this.snapPoint = null; // fn(wx,wy) => {x,y} or null
    this.showGrid = opts.showGrid !== undefined ? opts.showGrid : false;
    this.gridStepX = opts.gridStepX || 30;
    this.gridStepY = opts.gridStepY || 30;
    this.showAngleGuides = opts.showAngleGuides !== undefined ? opts.showAngleGuides : false;
    this.showPointGuides = opts.showPointGuides !== undefined ? opts.showPointGuides : true;
    this.guideColor = opts.guideColor || 'rgba(201,150,58,0.4)';

    // Registered snap points
    this.points = []; // [{x, y, label}]

    // Current active guides (rendered this frame)
    this._activeGuides = [];
  }

  /** Register a snap point */
  addPoint(x, y, label) {
    this.points.push({ x, y, label: label || '' });
    return this;
  }

  /** Remove all snap points */
  clearPoints() {
    this.points = [];
  }

  /** Snap x coordinate to grid */
  snapXToGrid(wx) {
    if (!this.snapEnabled) return wx;
    return Math.round(wx / this.gridStepX) * this.gridStepX;
  }

  /** Snap y coordinate to grid */
  snapYToGrid(wy) {
    if (!this.snapEnabled) return wy;
    return Math.round(wy / this.gridStepY) * this.gridStepY;
  }

  /** Snap to nearest registered point */
  snapToPoint(wx, wy) {
    if (!this.snapEnabled || !this.showPointGuides) return null;
    let best = null, bestDist = this.snapThreshold;
    for (const p of this.points) {
      const dx = p.x - wx, dy = p.y - wy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = p;
      }
    }
    return best;
  }

  /** Snap to angle (multiples of 45 deg from origin) */
  snapAngle(wx, wy, originX, originY) {
    if (!this.snapEnabled || !this.showAngleGuides) return null;
    const dx = wx - originX, dy = wy - originY;
    const angle = Math.atan2(dy, dx);
    const snapAngles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4,
                         Math.PI, -3 * Math.PI / 4, -Math.PI / 2, -Math.PI / 4];
    const snapDelta = Math.PI / 12; // 15 degree tolerance
    let bestAngle = null;
    for (const sa of snapAngles) {
      if (Math.abs(angle - sa) < snapDelta) {
        bestAngle = sa;
        break;
      }
    }
    if (bestAngle !== null) {
      const mag = Math.sqrt(dx * dx + dy * dy);
      return {
        x: originX + mag * Math.cos(bestAngle),
        y: originY + mag * Math.sin(bestAngle)
      };
    }
    return null;
  }

  /** Full snap: grid + point (cascading) */
  snap(wx, wy) {
    let sx = this.snapXToGrid(wx);
    let sy = this.snapYToGrid(wy);
    let snapped = false;

    const pt = this.snapToPoint(sx, sy);
    if (pt) {
      sx = pt.x; sy = pt.y;
      snapped = true;
    }

    this._activeGuides = [];
    if (snapped && this.showPointGuides) {
      this._activeGuides.push({ type: 'point', x: sx, y: sy });
    }
    if (this.showGrid && (Math.abs(wx - sx) > 0.5 || Math.abs(wy - sy) > 0.5)) {
      this._activeGuides.push({ type: 'cross', x: sx, y: sy });
    }

    return { x: sx, y: sy, snapped };
  }

  /** Render visual guides */
  render(ctx) {
    for (const g of this._activeGuides) {
      ctx.save();
      ctx.strokeStyle = this.guideColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);

      if (g.type === 'point') {
        const r = 6;
        ctx.beginPath();
        ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(g.x - r, g.y);
        ctx.lineTo(g.x + r, g.y);
        ctx.moveTo(g.x, g.y - r);
        ctx.lineTo(g.x, g.y + r);
        ctx.stroke();
      } else if (g.type === 'cross') {
        const len = 12;
        ctx.beginPath();
        ctx.moveTo(g.x - len, g.y);
        ctx.lineTo(g.x + len, g.y);
        ctx.moveTo(g.x, g.y - len);
        ctx.lineTo(g.x, g.y + len);
        ctx.stroke();
      }

      ctx.setLineDash([]);
      ctx.restore();
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Guide;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Guide = Guide;
}

})(typeof window !== 'undefined' ? window : this);
