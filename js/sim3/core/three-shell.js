(function(root) {
  'use strict';

  function webglAvailable() {
    if (root.__SIM3_FORCE_WEBGL_FAIL) return false;
    try {
      const c = document.createElement('canvas');
      const gl = (root.WebGL2RenderingContext && c.getContext('webgl2')) || c.getContext('webgl');
      const ok = !!gl;
      if (gl) {
        const lose = gl.getExtension && gl.getExtension('WEBGL_lose_context');
        if (lose && typeof lose.loseContext === 'function') lose.loseContext();
      }
      return ok;
    } catch (e) {
      return false;
    }
  }

  function hostSize(host, cfg) {
    const ref = cfg.referenceEl && cfg.referenceEl.getBoundingClientRect();
    const rect = host.getBoundingClientRect();
    return {
      width: Math.max(280, Math.round(cfg.width || rect.width || (ref && ref.width) || 360)),
      height: Math.max(220, Math.round(cfg.height || rect.height || (ref && ref.height) || 280))
    };
  }

  function create(cfg) {
    const THREE = root.THREE;
    if (!THREE || !webglAvailable()) {
      if (cfg.onFallback) cfg.onFallback(!THREE ? 'three-missing' : 'webgl-unavailable');
      return null;
    }

    const size = hostSize(cfg.host, cfg);
    cfg.host.style.cssText = `position:relative;width:${size.width}px;height:${size.height}px;`;
    let scene, camera, renderer, labelLayer;
    const labels = new Map();
    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);
      camera = new THREE.PerspectiveCamera(40, size.width / size.height, 0.1, 100);
      camera.position.set(4.5, 4.2, 6.5);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(size.width, size.height, false);
      renderer.domElement.className = 'sim3-canvas';
      renderer.domElement.setAttribute('aria-label', cfg.label || 'Mô phỏng 3D');
      cfg.host.appendChild(renderer.domElement);
      labelLayer = document.createElement('div');
      labelLayer.className = 'sim3-label-layer';
      labelLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2;';
      cfg.host.appendChild(labelLayer);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x8aa0b8, 2.5));
      const key = new THREE.DirectionalLight(0xffffff, 1.3);
      key.position.set(4, 6, 5);
      key.castShadow = true;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xdbeafe, 0.55);
      fill.position.set(-3, 3, -4);
      scene.add(fill);
    } catch (e) {
      root.Sim3Dispose.disposeAll({ scene, renderer });
      if (labelLayer && labelLayer.parentNode) labelLayer.parentNode.removeChild(labelLayer);
      if (cfg.onFallback) cfg.onFallback('renderer-create-failed');
      return null;
    }

    let disposed = false, rafId = null, lastState = null;
    const api = { THREE, scene, camera, renderer, host: cfg.host, labels: { add: addLabel, remove: removeLabel, update: updateLabels }, setState, render, resize, start, stop, dispose };
    try {
      if (cfg.setup) cfg.setup(api);
    } catch (e) {
      dispose();
      if (cfg.onFallback) cfg.onFallback('scene-setup-failed');
      return null;
    }

    function render() {
      if (!disposed) {
        renderer.render(scene, camera);
        updateLabels();
      }
    }
    function loop() {
      if (disposed) return;
      if (cfg.update) cfg.update(lastState, api);
      render();
      rafId = root.requestAnimationFrame(loop);
    }
    function setState(state) {
      lastState = state;
      if (cfg.update) cfg.update(state, api);
      render();
    }
    function resize() {
      const next = hostSize(cfg.host, cfg);
      camera.aspect = next.width / next.height;
      camera.updateProjectionMatrix();
      renderer.setSize(next.width, next.height, false);
      render();
    }
    function labelPosition(target) {
      if (!target) return null;
      if (typeof target === 'function') return target();
      if (target.position) return target.position;
      return target;
    }
    function addLabel(id, text, target, opts) {
      if (!labelLayer) return null;
      opts = opts || {};
      let entry = labels.get(id);
      if (!entry) {
        const el = document.createElement('div');
        el.className = `sim3-label${opts.kind ? ` sim3-label-${opts.kind}` : ''}`;
        el.dataset.label = id;
        el.style.cssText = [
          'position:absolute',
          'transform:translate(-50%,-120%)',
          'padding:2px 6px',
          'border-radius:999px',
          'background:rgba(15,23,42,.82)',
          'color:#fff',
          'font:600 12px/1.25 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
          'box-shadow:0 1px 5px rgba(15,23,42,.24)',
          'white-space:nowrap'
        ].join(';');
        labelLayer.appendChild(el);
        entry = { el, target, opts };
        labels.set(id, entry);
      }
      entry.el.textContent = text;
      entry.target = target;
      entry.opts = opts;
      updateLabels();
      return entry.el;
    }
    function removeLabel(id) {
      const entry = labels.get(id);
      if (!entry) return;
      if (entry.el.parentNode) entry.el.parentNode.removeChild(entry.el);
      labels.delete(id);
    }
    function updateLabels() {
      if (!labelLayer) return;
      const rect = renderer.domElement.getBoundingClientRect();
      labels.forEach(entry => {
        const pos = labelPosition(entry.target);
        if (!pos) {
          entry.el.style.display = 'none';
          return;
        }
        const p = pos.clone ? pos.clone() : new THREE.Vector3(pos.x || 0, pos.y || 0, pos.z || 0);
        p.project(camera);
        const visible = p.z > -1 && p.z < 1;
        entry.el.style.display = visible ? 'block' : 'none';
        if (visible) {
          const dx = entry.opts && entry.opts.dx ? entry.opts.dx : 0;
          const dy = entry.opts && entry.opts.dy ? entry.opts.dy : 0;
          const x = Math.max(8, Math.min(rect.width - 8, (p.x * 0.5 + 0.5) * rect.width + dx));
          const y = Math.max(16, Math.min(rect.height - 8, (-p.y * 0.5 + 0.5) * rect.height + dy));
          entry.el.style.left = `${x}px`;
          entry.el.style.top = `${y}px`;
        }
      });
    }
    function start() {
      if (rafId == null && !disposed) rafId = root.requestAnimationFrame(loop);
    }
    function stop() {
      if (rafId != null) {
        root.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
    function dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      labels.forEach(entry => {
        if (entry.el.parentNode) entry.el.parentNode.removeChild(entry.el);
      });
      labels.clear();
      if (labelLayer && labelLayer.parentNode) labelLayer.parentNode.removeChild(labelLayer);
      root.Sim3Dispose.disposeAll(api);
      if (cfg.host.parentNode) cfg.host.parentNode.removeChild(cfg.host);
    }

    start();
    return api;
  }

  root.Sim3Shell = { create, webglAvailable };
})(typeof window !== 'undefined' ? window : this);
