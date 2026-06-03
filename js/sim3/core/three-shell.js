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
    let scene, camera, renderer;
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

      scene.add(new THREE.HemisphereLight(0xffffff, 0x8aa0b8, 2.2));
      const key = new THREE.DirectionalLight(0xffffff, 1.3);
      key.position.set(4, 6, 5);
      scene.add(key);
    } catch (e) {
      root.Sim3Dispose.disposeAll({ scene, renderer });
      if (cfg.onFallback) cfg.onFallback('renderer-create-failed');
      return null;
    }

    let disposed = false, rafId = null, lastState = null;
    const api = { THREE, scene, camera, renderer, host: cfg.host, setState, render, resize, start, stop, dispose };
    try {
      if (cfg.setup) cfg.setup(api);
    } catch (e) {
      dispose();
      if (cfg.onFallback) cfg.onFallback('scene-setup-failed');
      return null;
    }

    function render() {
      if (!disposed) renderer.render(scene, camera);
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
      root.Sim3Dispose.disposeAll(api);
      if (cfg.host.parentNode) cfg.host.parentNode.removeChild(cfg.host);
    }

    start();
    return api;
  }

  root.Sim3Shell = { create, webglAvailable };
})(typeof window !== 'undefined' ? window : this);
