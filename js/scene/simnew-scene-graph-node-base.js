/**
 * SimNew Scene — SceneNode base class
 * Declarative scene graph node with transform + dirty flag.
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

class SceneNode {
  /**
   * @param {Object} opts
   * @param {number} opts.x - world x
   * @param {number} opts.y - world y
   * @param {number} opts.angle - rotation radians
   * @param {number} opts.scale - uniform scale
   * @param {number} opts.opacity - opacity 0..1
   */
  constructor(opts) {
    opts = opts || {};
    this.id = opts.id || ('node_' + Math.random().toString(36).slice(2, 9));
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.angle = opts.angle || 0;
    this.scale = opts.scale || 1;
    this.opacity = opts.opacity !== undefined ? opts.opacity : 1;
    this.parent = null;
    this.children = [];
    this._dirty = true;
    this.visible = true;
  }

  /** World transform matrix (read-only) */
  get worldX() { return this.x; }
  get worldY() { return this.y; }
  get worldAngle() { return this.angle; }
  get worldScale() { return this.scale; }

  /** Mark dirty so this node re-renders next frame */
  markDirty() { this._dirty = true; }

  /** Invalidate entire subtree */
  markDirtyTree() {
    this.markDirty();
    for (const c of this.children) c.markDirtyTree();
  }

  /** Add child node */
  addChild(node) {
    if (node.parent) node.parent.removeChild(node);
    node.parent = this;
    this.children.push(node);
    return node;
  }

  /** Remove child node */
  removeChild(node) {
    const idx = this.children.indexOf(node);
    if (idx >= 0) {
      this.children.splice(idx, 1);
      node.parent = null;
    }
    return node;
  }

  /** Render this node (override in subclass) */
  render(ctx) {
    // Override in subclass
  }

  /** Draw frame — called by render, applies transform */
  draw(ctx, fn) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(this.scale, this.scale);
    ctx.globalAlpha *= this.opacity;
    fn();
    ctx.restore();
    this._dirty = false;
  }

  /** Update from physics body (override in subclass) */
  updateFromBody(body) {
    // Override in subclass
  }

  /** Update from simulation state (called each frame) */
  update(state) {
    // Override in subclass
  }

  /** Get bounding box in world coords */
  getBounds() {
    return { left: this.x - 5, right: this.x + 5, top: this.y - 5, bottom: this.y + 5 };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SceneNode;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.SceneNode = SceneNode;
}

})(typeof window !== 'undefined' ? window : this);
