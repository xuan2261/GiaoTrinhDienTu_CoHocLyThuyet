(function(root) {
  'use strict';

  function create(cfg) {
    const THREE = cfg.THREE;
    const entries = new Map();
    const layer = document.createElement('div');
    layer.className = 'sim3-label-layer';
    layer.setAttribute('aria-hidden', 'true');
    cfg.host.appendChild(layer);
    let disposed = false;

    function pointPosition(target) {
      if (!target) return null;
      if (typeof target === 'function') return target();
      return target.position || target;
    }

    function projected(point) {
      if (!point) return null;
      const value = point.clone
        ? point.clone()
        : new THREE.Vector3(point.x || 0, point.y || 0, point.z || 0);
      value.project(cfg.camera);
      return value.z > -1 && value.z < 1 ? value : null;
    }

    function bounds(points) {
      const rect = cfg.renderer.domElement.getBoundingClientRect();
      const xs = [], ys = [];
      (points || []).forEach(point => {
        const value = projected(point);
        if (!value) return;
        xs.push((value.x * 0.5 + 0.5) * rect.width);
        ys.push((-value.y * 0.5 + 0.5) * rect.height);
      });
      if (!xs.length || !ys.length || !rect.width || !rect.height) return null;
      const left = Math.min.apply(null, xs), right = Math.max.apply(null, xs);
      const top = Math.min.apply(null, ys), bottom = Math.max.apply(null, ys);
      return {
        left, right, top, bottom,
        width: right - left,
        height: bottom - top,
        canvasWidth: rect.width,
        canvasHeight: rect.height,
        fillRatio: Math.max((right - left) / rect.width, (bottom - top) / rect.height)
      };
    }

    function margin(points) {
      const value = bounds(points);
      return value
        ? Math.floor(Math.min(value.left, value.top, value.canvasWidth - value.right, value.canvasHeight - value.bottom))
        : 0;
    }

    function distance(a, b) {
      const value = bounds([a, b]);
      return value ? Math.hypot(value.width, value.height) : 0;
    }

    function update() {
      if (disposed) return;
      const rect = cfg.renderer.domElement.getBoundingClientRect();
      entries.forEach(entry => {
        const value = projected(pointPosition(entry.target));
        entry.el.style.display = value ? 'block' : 'none';
        if (!value) return;
        const dx = entry.opts.dx || 0, dy = entry.opts.dy || 0;
        const x = Math.max(8, Math.min(rect.width - 8, (value.x * 0.5 + 0.5) * rect.width + dx));
        const y = Math.max(16, Math.min(rect.height - 8, (-value.y * 0.5 + 0.5) * rect.height + dy));
        entry.el.style.left = `${x}px`;
        entry.el.style.top = `${y}px`;
      });
    }

    function add(id, text, target, opts) {
      if (disposed) return null;
      let entry = entries.get(id);
      if (!entry) {
        const el = document.createElement('div');
        el.className = `sim3-label${opts && opts.kind ? ` sim3-label-${opts.kind}` : ''}`;
        el.dataset.label = id;
        layer.appendChild(el);
        entry = { el, target: null, opts: {} };
        entries.set(id, entry);
      }
      entry.el.textContent = text;
      entry.target = target;
      entry.opts = opts || {};
      update();
      return entry.el;
    }

    function remove(id) {
      const entry = entries.get(id);
      if (!entry) return;
      entry.el.remove();
      entries.delete(id);
    }

    function countVisible() {
      let count = 0;
      entries.forEach(entry => {
        if (entry.el && root.getComputedStyle(entry.el).display !== 'none') count += 1;
      });
      return count;
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      entries.clear();
      layer.remove();
    }

    return { add, remove, update, countVisible, bounds, margin, distance, dispose, element: layer };
  }

  root.Sim3LabelLayer = { create };
})(typeof window !== 'undefined' ? window : this);
