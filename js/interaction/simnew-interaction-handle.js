/**
 * SimNew Interaction — Draggable handle with ghost preview.
 * A handle is a small interactive control point on the canvas.
 */
(function(root) {
'use strict';

const Handle = root.Handle || class Handle {
  /**
   * @param {Object} opts
   * @param {number} opts.x - world x
   * @param {number} opts.y - world y
   * @param {string} opts.type - 'circle'|'square'|'diamond'|'arrow'
   * @param {string} opts.color
   * @param {number} opts.radius - hit-test radius (default 10)
   * @param {string} opts.cursor
   * @param {boolean} opts.visible
   * @param {string} opts.label
   * @param {Function} opts.onDragStart
   * @param {Function} opts.onDrag
   * @param {Function} opts.onDragEnd
   * @param {Function} opts.constraint - fn(x,y) => {x,y}
   */
  constructor(opts) {
    opts = opts || {};
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.startX = this.x;
    this.startY = this.y;
    this.type = opts.type || 'circle';
    this.color = opts.color || '#c9963a';
    this.hoverColor = opts.hoverColor || '#f0c060';
    this.activeColor = opts.activeColor || '#fff';
    this.radius = opts.radius !== undefined ? opts.radius : 10;
    this.cursor = opts.cursor || 'grab';
    this.visible = opts.visible !== undefined ? opts.visible : true;
    this.label = opts.label || '';
    this.draggable = opts.draggable !== undefined ? opts.draggable : true;
    this.snapEnabled = opts.snapEnabled !== undefined ? opts.snapEnabled : true;

    // Callbacks
    this.onDragStart = opts.onDragStart || null;
    this.onDrag = opts.onDrag || null;
    this.onDragEnd = opts.onDragEnd || null;
    this.constraint = opts.constraint || null;

    // State
    this.isHovered = false;
    this.isDragging = false;
    this.isFocused = false;
    this._ghostX = null;
    this._ghostY = null;
    this._screenRadius = this.radius;
  }

  /** Hit-test against world-space point */
  hitTest(wx, wy) {
    const dx = wx - this.x, dy = wy - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }

  /** Start dragging */
  startDrag() {
    this.isDragging = true;
    this.startX = this.x;
    this.startY = this.y;
    this._ghostX = null;
    this._ghostY = null;
    if (this.onDragStart) this.onDragStart(this);
  }

  /** Update position while dragging */
  drag(wx, wy) {
    if (!this.isDragging) return;
    let nx = wx, ny = wy;
    if (this.constraint) {
      const constrained = this.constraint(wx, wy, this);
      nx = constrained.x;
      ny = constrained.y;
    }
    this.x = nx;
    this.y = ny;
    if (this.onDrag) this.onDrag(this, nx, ny);
  }

  /** End dragging */
  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this._ghostX = null;
    this._ghostY = null;
    if (this.onDragEnd) this.onDragEnd(this);
  }

  /** Set ghost preview (shown during drag before committing) */
  setGhost(wx, wy) {
    if (!this.isDragging) return;
    this._ghostX = wx;
    this._ghostY = wy;
  }

  /** Render the handle */
  render(ctx) {
    if (!this.visible) return;
    const x = this.x, y = this.y;
    let color = this.color;
    if (this.isDragging) color = this.activeColor;
    else if (this.isHovered || this.isFocused) color = this.hoverColor;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = this.isDragging ? 0.6 : (this.isHovered ? 0.9 : 0.7);

    if (this.type === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.globalAlpha *= 0.5;
      ctx.stroke();
    } else if (this.type === 'square') {
      const r = this.radius * 0.8;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.globalAlpha *= 0.5;
      ctx.strokeRect(x - r, y - r, r * 2, r * 2);
    } else if (this.type === 'diamond') {
      const r = this.radius * 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'arrow') {
      const r = this.radius;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r * 0.7, y + r * 0.5);
      ctx.lineTo(x - r * 0.7, y + r * 0.5);
      ctx.closePath();
      ctx.fill();
    }

    // Ghost preview
    if (this._ghostX !== null && this._ghostY !== null) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#c9963a';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(this._ghostX, this._ghostY, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // Line from current to ghost
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(this._ghostX, this._ghostY);
      ctx.stroke();
    }

    // Label
    if (this.label) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = this.color;
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      ctx.fillText(this.label, x, y - this.radius - 3);
    }

    ctx.restore();
  }

  /** Get cursor style */
  getCursor() {
    if (this.isDragging) return 'grabbing';
    if (this.isHovered || this.isFocused) return this.cursor;
    return 'default';
  }

  /** Reset to start position */
  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.isDragging = false;
    this._ghostX = null;
    this._ghostY = null;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Handle;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Handle = Handle;
}

})(typeof window !== 'undefined' ? window : this);
