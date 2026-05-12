/**
 * SimNew Scene — SceneGraph
 * Top-level scene container: nodes, camera, background, grid, render loop.
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

const SceneNode = root.SimNew ? root.SimNew.SceneNode : require('./simnew-scene-graph-node-base');

class SceneGraph {
  /**
   * @param {Object} opts
   * @param {HTMLCanvasElement} opts.canvas
   * @param {number} opts.width - logical width (default 760)
   * @param {number} opts.height - logical height (default 440)
   */
  constructor(opts) {
    opts = opts || {};
    this.canvas = opts.canvas || null;
    this.ctx = opts.canvas ? opts.canvas.getContext('2d') : null;
    this.width = opts.width || 760;
    this.height = opts.height || 440;
    this.nodes = [];
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.backgroundColor = opts.backgroundColor || '#f8f9fa';
    this.showGrid = opts.showGrid !== undefined ? opts.showGrid : true;
    this.gridStep = opts.gridStep || 30;
    this.gridColor = opts.gridColor || 'rgba(0,0,0,0.08)';
    this._dirty = true;
    this._scale = 1;

    if (this.canvas) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }

  /** Compute and apply CSS scale to fit container */
  fitContainer(containerEl) {
    if (!containerEl || !this.canvas) return;
    const cw = containerEl.clientWidth - 32;
    this._scale = Math.min(1, cw / this.width);
    this.canvas.style.transform = `scale(${this._scale})`;
    this.canvas.style.transformOrigin = 'top left';
  }

  /** Add a node to the scene */
  addNode(node) {
    this.nodes.push(node);
    return node;
  }

  /** Remove a node */
  removeNode(node) {
    const idx = this.nodes.indexOf(node);
    if (idx >= 0) this.nodes.splice(idx, 1);
    return node;
  }

  /** Get node by id */
  getNode(id) {
    return this.nodes.find(n => n.id === id) || null;
  }

  /** Mark entire scene dirty */
  markDirty() { this._dirty = true; }

  /** Render background + grid */
  renderBackground(ctx) {
    const w = this.width, h = this.height;
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, w, h);

    if (!this.showGrid) return;
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += this.gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += this.gridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  /** Full render pass */
  render(ctx) {
    if (!ctx) ctx = this.ctx;
    if (!ctx) return;

    // Clear and draw background
    this.renderBackground(ctx);

    // Apply camera transform
    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    // Render all nodes
    for (const node of this.nodes) {
      if (!node.visible) continue;
      // Sync body nodes from physics
      if (node.syncFromBody) node.syncFromBody();
      node.render(ctx);
    }

    ctx.restore();
    this._dirty = false;
  }

  /** Convenience: add a body node */
  addBodyNode(body, shape, color, label) {
    const node = new (root.SimNew ? root.SimNew.BodyNode : require('./simnew-scene-graph-body-node'))({
      body, shape, color, label
    });
    this.addNode(node);
    return node;
  }

  /** Convenience: add an arrow node */
  addArrow(x1, y1, x2, y2, color, label, opts) {
    opts = opts || {};
    const ArrowNode = root.SimNew ? root.SimNew.ArrowNode : require('./simnew-scene-graph-arrow-trail-joint-nodes').ArrowNode;
    const node = new ArrowNode({ x1, y1, x2, y2, color, label,
      lineWidth: opts.lineWidth || 2, glow: opts.glow || 0,
      dashed: !!opts.dashed, ghost: !!opts.ghost
    });
    this.addNode(node);
    return node;
  }

  /** Convenience: add a trail node */
  addTrail(color, maxPoints) {
    const TrailNode = root.SimNew ? root.SimNew.TrailNode : require('./simnew-scene-graph-arrow-trail-joint-nodes').TrailNode;
    const node = new TrailNode({ color, maxPoints: maxPoints || 60 });
    this.addNode(node);
    return node;
  }

  /** Screen coords → world coords */
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.camera.x) / this.camera.zoom,
      y: (sy - this.camera.y) / this.camera.zoom
    };
  }

  /** World coords → screen coords */
  worldToScreen(wx, wy) {
    return {
      x: wx * this.camera.zoom + this.camera.x,
      y: wy * this.camera.zoom + this.camera.y
    };
  }

  /** Camera pan */
  pan(dx, dy) {
    this.camera.x += dx;
    this.camera.y += dy;
    this._dirty = true;
  }

  /** Camera zoom centered on point */
  zoom(factor, cx, cy) {
    cx = cx !== undefined ? cx : this.width / 2;
    cy = cy !== undefined ? cy : this.height / 2;
    const wx = (cx - this.camera.x) / this.camera.zoom;
    const wy = (cy - this.camera.y) / this.camera.zoom;
    this.camera.zoom = Math.max(0.25, Math.min(4, this.camera.zoom * factor));
    this.camera.x = cx - wx * this.camera.zoom;
    this.camera.y = cy - wy * this.camera.zoom;
    this._dirty = true;
  }

  /** Clear all nodes */
  clear() {
    this.nodes.length = 0;
    this._dirty = true;
  }

  /** Get all nodes matching a filter */
  findNodes(filterFn) {
    return this.nodes.filter(filterFn);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SceneGraph;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.SceneGraph = SceneGraph;
}

})(typeof window !== 'undefined' ? window : this);
