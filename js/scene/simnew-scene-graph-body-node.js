/**
 * SimNew Scene — BodyNode
 * Links RigidBody ↔ SceneNode, auto-syncs position/angle.
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

const SceneNode = root.SimNew ? root.SimNew.SceneNode : require('./simnew-scene-graph-node-base');

class BodyNode extends SceneNode {
  /**
   * @param {Object} opts
   * @param {RigidBody} opts.body - physics body
   * @param {string} opts.shape - 'circle'|'rect'|'point'
   * @param {string} opts.color
   * @param {string} opts.label
   */
  constructor(opts) {
    super(opts);
    this.body = opts.body || null;
    this.shape = opts.shape || (this.body ? this.body.shape : 'point');
    this.color = opts.color || '#e74c3c';
    this.label = opts.label || (this.body ? this.body.label : '');
    this.showLabel = opts.showLabel !== undefined ? opts.showLabel : true;
    this._prevX = null;
    this._prevY = null;
    this._prevAngle = null;
  }

  /** Sync position/angle from physics body */
  syncFromBody() {
    if (!this.body) return;
    if (this.body.pos.x !== this._prevX || this.body.pos.y !== this._prevY) {
      this.x = this.body.pos.x;
      this.y = this.body.pos.y;
      this._prevX = this.body.pos.x;
      this._prevY = this.body.pos.y;
      this.markDirty();
    }
    if (this.body.angle !== this._prevAngle) {
      this.angle = this.body.angle;
      this._prevAngle = this.body.angle;
      this.markDirty();
    }
  }

  updateFromBody(body) {
    this.body = body;
    this.syncFromBody();
  }

  render(ctx) {
    if (!this.visible) return;
    const shape = this.shape || 'point';

    this.draw(ctx, () => {
      if (shape === 'circle') {
        const r = this.body ? this.body.radius : 20;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha *= 0.85;
        ctx.fill();
        ctx.globalAlpha /= 0.85;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (shape === 'rect') {
        const w = this.body ? this.body.width : 40;
        const h = this.body ? this.body.height : 20;
        ctx.fillStyle = this.color;
        ctx.globalAlpha *= 0.85;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.globalAlpha /= 0.85;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      }
      // Label
      if (this.showLabel && this.label) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.label, 0, 0);
      }
    });
  }

  getBounds() {
    if (this.body && this.body.shape === 'circle') {
      const r = this.body.radius;
      return { left: this.x - r, right: this.x + r, top: this.y - r, bottom: this.y + r };
    }
    return super.getBounds();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BodyNode;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.BodyNode = BodyNode;
}

})(typeof window !== 'undefined' ? window : this);
